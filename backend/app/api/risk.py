import logging
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.db.mongodb import get_database
from app.models.risk import RiskAssessment, RecalculateResponse
from app.services.fusion_engine import fusion_engine
from app.services.risk_engine import risk_engine
from app.services.vulnerability_engine import vulnerability_engine
from app.services.priority_engine import priority_engine
from app.services.action_engine import action_engine

logger = logging.getLogger("riskpulse.api.risk")
router = APIRouter(prefix="/risk", tags=["risk"])


async def _calculate_risk_for_location(location_id: str) -> RecalculateResponse:
    db = get_database()

    weather_cursor = db["weather_observations"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(10)
    weather_observations = []
    async for doc in weather_cursor:
        weather_observations.append(doc)

    sensor_cursor = db["sensor_readings"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(10)
    sensor_readings = []
    async for doc in sensor_cursor:
        sensor_readings.append(doc)

    report_cursor = db["citizen_reports"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(10)
    citizen_reports = []
    async for doc in report_cursor:
        citizen_reports.append(doc)

    location = await db["locations"].find_one({"location_id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")

    rainfall_fused = fusion_engine.fuse_rainfall(weather_observations)
    water_level_fused = fusion_engine.fuse_water_level(sensor_readings)
    citizen_fused = fusion_engine.fuse_citizen_reports(citizen_reports)

    rainfall_score = risk_engine.normalize_rainfall(
        rainfall_fused.fused_value,
        sum(w.get("forecast_rainfall_mm", 0) for w in weather_observations) / max(1, len(weather_observations)),
    )
    water_level_score = risk_engine.normalize_water_level(water_level_fused.fused_value)
    elevation_score = risk_engine.normalize_elevation(location.get("elevation", 10))
    historical_score = risk_engine.normalize_historical(location.get("historical_flood_frequency", 0))
    citizen_score = risk_engine.normalize_citizen_reports(
        len(citizen_reports),
        sum(r.get("severity", 3) for r in citizen_reports) / max(1, len(citizen_reports)),
    )

    data_sources = []
    if weather_observations:
        data_sources.append("weather")
    if sensor_readings:
        data_sources.append("sensors")
    if citizen_reports:
        data_sources.append("citizen_reports")

    total_confidence = (
        rainfall_fused.confidence_score * 0.3
        + water_level_fused.confidence_score * 0.3
        + citizen_fused.confidence_score * 0.2
        + 50.0 * 0.2
    )

    risk_assessment = await risk_engine.calculate_risk(
        location_id=location_id,
        rainfall_score=rainfall_score,
        water_level_score=water_level_score,
        elevation_score=elevation_score,
        historical_score=historical_score,
        citizen_score=citizen_score,
        confidence_score=total_confidence,
        data_sources_used=data_sources,
    )
    await risk_engine.store_risk_assessment(risk_assessment)

    vulnerability_assessment = await vulnerability_engine.calculate_vulnerability(location_id)
    await vulnerability_engine.store_vulnerability_assessment(vulnerability_assessment)

    priority_score = priority_engine.calculate_priority_score(
        risk_assessment.risk_score, vulnerability_assessment.vulnerability_score
    )

    from app.models.risk import PriorityAssessment
    priority_assessment = PriorityAssessment(
        rank=0,
        location_id=location_id,
        location_name=risk_assessment.location_name,
        risk_score=risk_assessment.risk_score,
        vulnerability_score=vulnerability_assessment.vulnerability_score,
        priority_score=round(priority_score, 2),
        risk_level=risk_assessment.risk_level,
        recommended_action="",
        confidence_score=risk_assessment.confidence_score,
        calculated_at=datetime.utcnow(),
    )

    action = await action_engine.generate_action(
        location_id=location_id,
        risk_level=risk_assessment.risk_level,
        vulnerability_level=vulnerability_assessment.vulnerability_level,
        priority_score=priority_score,
    )
    priority_assessment.recommended_action = action.action

    return RecalculateResponse(
        location_id=location_id,
        risk_assessment=risk_assessment,
        vulnerability_assessment=vulnerability_assessment,
        priority_assessment=priority_assessment,
        action=action,
    )


@router.get("/all", response_model=List[RiskAssessment])
async def get_all_risks():
    return await risk_engine.get_all_risk_assessments()


@router.get("/{location_id}", response_model=RiskAssessment)
async def get_risk(location_id: str):
    assessment = await risk_engine.get_risk_assessment(location_id)
    if not assessment:
        raise HTTPException(status_code=404, detail=f"No risk assessment found for {location_id}")
    return assessment


@router.post("/recalculate/{location_id}", response_model=RecalculateResponse)
async def recalculate_risk(location_id: str):
    logger.info(f"Recalculating risk for {location_id}")
    try:
        result = await _calculate_risk_for_location(location_id)
        logger.info(f"Risk recalculated for {location_id}: score={result.risk_assessment.risk_score}, level={result.risk_assessment.risk_level}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to recalculate risk for {location_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Risk calculation failed for {location_id}")


@router.post("/recalculate-all")
async def recalculate_all_risks():
    logger.info("Recalculating risk for all locations")
    db = get_database()
    cursor = db["locations"].find()
    results = []
    errors = []
    async for location in cursor:
        loc_id = location["location_id"]
        try:
            result = await _calculate_risk_for_location(loc_id)
            results.append(result.location_id)
        except Exception as e:
            logger.warning(f"Failed to recalculate {loc_id}: {e}")
            errors.append(loc_id)
    priorities = await priority_engine.calculate_all_priorities()
    await priority_engine.store_priorities(priorities)
    logger.info(f"Recalculation complete: {len(results)} succeeded, {len(errors)} failed")
    return {"recalculated": results, "count": len(results), "errors": errors}
