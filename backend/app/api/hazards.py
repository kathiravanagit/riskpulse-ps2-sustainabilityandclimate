from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.db.mongodb import get_database
from app.models.hazard import (
    HazardAssessment, HazardAssessmentRequest, HazardSignal,
    HazardType, OperationalPriority,
)

router = APIRouter(prefix="/hazards", tags=["multi-hazard"])


def level(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "moderate"
    return "low"


def signal(hazard: HazardType, score: float, evidence: list[str]) -> HazardSignal:
    return HazardSignal(
        hazard=hazard,
        score=round(max(0, min(100, score)), 2),
        level=level(score),
        confidence=round(min(98, 55 + len(evidence) * 10), 2),
        evidence=evidence,
    )


def build_assessment(request: HazardAssessmentRequest, location_name: str) -> HazardAssessment:
    signals = [
        signal(HazardType.FLOOD, request.rainfall_mm / 1.5 + request.water_level_cm * 0.55, [
            "Rainfall observation", "Water-level reading", "Drainage and flood history"
        ]),
        signal(HazardType.HEATWAVE, (request.temperature_c - 28) * 14 + request.population_exposure * 0.18, [
            "Air temperature", "Population exposure"
        ]),
        signal(HazardType.CYCLONE, request.wind_kmh * 1.4 + request.rainfall_mm * 0.15, [
            "Wind observation", "Rainfall observation"
        ]),
        signal(HazardType.LANDSLIDE, request.slope_degrees * 1.1 + request.soil_saturation * 0.65, [
            "Terrain slope", "Soil saturation"
        ]),
        signal(HazardType.GLACIAL_LAKE_FAILURE, request.lake_level_change_m * 18, [
            "Lake-level change"
        ]),
        signal(HazardType.MARINE_HEAT, request.sea_surface_temp_anomaly_c * 18, [
            "Sea-surface temperature anomaly"
        ]),
    ]
    signals.sort(key=lambda item: item.score, reverse=True)
    overall_score = max(item.score for item in signals)
    priorities = [
        OperationalPriority(priority=1, category="rescue", name="Rescue teams", location=location_name, reason="Deploy to the highest current hazard signal"),
        OperationalPriority(priority=2, category="route", name="Primary travel route", location=location_name, reason="Review closure and safe-route status before dispatch"),
        OperationalPriority(priority=3, category="shelter", name="Nearest shelter", location=location_name, reason="Confirm capacity and power before public direction"),
        OperationalPriority(priority=4, category="medical", name="Medical support", location=location_name, reason="Prepare support for exposed or vulnerable residents"),
    ]
    return HazardAssessment(
        location_id=request.location_id,
        location_name=location_name,
        overall_score=round(overall_score, 2),
        overall_level=level(overall_score),
        signals=signals,
        priorities=priorities,
        data_quality={
            "weather": "observed",
            "terrain": "configured",
            "community": "reported",
            "connectivity": "online",
        },
        last_updated=datetime.utcnow(),
    )


@router.post("/assess", response_model=HazardAssessment)
async def assess_hazards(request: HazardAssessmentRequest):
    db = get_database()
    location = await db["locations"].find_one({"location_id": request.location_id})
    if not location:
        raise HTTPException(status_code=404, detail=f"Location {request.location_id} not found")
    assessment = build_assessment(request, location.get("name", request.location_id))
    await db["hazard_assessments"].replace_one(
        {"location_id": request.location_id}, assessment.model_dump(), upsert=True
    )
    return assessment


@router.get("/{location_id}", response_model=HazardAssessment)
async def get_hazard_assessment(location_id: str):
    db = get_database()
    saved = await db["hazard_assessments"].find_one({"location_id": location_id})
    if saved:
        saved.pop("_id", None)
        return HazardAssessment(**saved)
    location = await db["locations"].find_one({"location_id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
    return build_assessment(HazardAssessmentRequest(location_id=location_id), location.get("name", location_id))
