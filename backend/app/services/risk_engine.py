from typing import Dict, List, Optional
from datetime import datetime
from app.config import settings
from app.models.risk import (
    RiskAssessment, RiskLevel, ContributingFactors
)
from app.db.mongodb import get_database


class RiskEngine:
    def __init__(self):
        self.weights = {
            "rainfall": settings.RISK_WEIGHT_RAINFALL,
            "water_level": settings.RISK_WEIGHT_WATER_LEVEL,
            "elevation": settings.RISK_WEIGHT_ELEVATION,
            "historical": settings.RISK_WEIGHT_HISTORICAL,
            "citizen": settings.RISK_WEIGHT_CITIZEN,
        }
        self.threshold_low = settings.RISK_THRESHOLD_LOW
        self.threshold_moderate = settings.RISK_THRESHOLD_MODERATE
        self.threshold_high = settings.RISK_THRESHOLD_HIGH

    def normalize_rainfall(self, rainfall_mm: float, forecast_mm: float = 0) -> float:
        total = rainfall_mm + forecast_mm * 0.5
        return min(100.0, (total / 150.0) * 100)

    def normalize_water_level(self, water_level_cm: float) -> float:
        return min(100.0, (water_level_cm / 100.0) * 100)

    def normalize_elevation(self, elevation_m: float) -> float:
        low_elevation_threshold = 3.0
        high_elevation_threshold = 15.0
        if elevation_m <= low_elevation_threshold:
            return 100.0
        if elevation_m >= high_elevation_threshold:
            return 0.0
        return ((high_elevation_threshold - elevation_m) / (high_elevation_threshold - low_elevation_threshold)) * 100

    def normalize_historical(self, flood_frequency: float) -> float:
        return min(100.0, flood_frequency * 100)

    def normalize_citizen_reports(self, report_count: int, avg_severity: float = 3.0) -> float:
        count_score = min(50.0, (report_count / 10.0) * 50)
        severity_score = (avg_severity / 5.0) * 50
        return min(100.0, count_score + severity_score)

    def determine_risk_level(self, score: float) -> RiskLevel:
        if score < self.threshold_low:
            return RiskLevel.LOW
        elif score < self.threshold_moderate:
            return RiskLevel.MODERATE
        elif score < self.threshold_high:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    async def calculate_risk(
        self,
        location_id: str,
        rainfall_score: float,
        water_level_score: float,
        elevation_score: float,
        historical_score: float,
        citizen_score: float,
        confidence_score: float = 50.0,
        data_sources_used: List[str] = None,
    ) -> RiskAssessment:
        contributing_factors = ContributingFactors(
            rainfall=round(rainfall_score, 2),
            water_level=round(water_level_score, 2),
            elevation=round(elevation_score, 2),
            historical_flooding=round(historical_score, 2),
            citizen_reports=round(citizen_score, 2),
        )

        risk_score = (
            rainfall_score * self.weights["rainfall"]
            + water_level_score * self.weights["water_level"]
            + elevation_score * self.weights["elevation"]
            + historical_score * self.weights["historical"]
            + citizen_score * self.weights["citizen"]
        )

        risk_score = max(0.0, min(100.0, risk_score))
        risk_level = self.determine_risk_level(risk_score)

        db = get_database()
        location = await db["locations"].find_one({"location_id": location_id})
        location_name = location["name"] if location else location_id

        return RiskAssessment(
            location_id=location_id,
            location_name=location_name,
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            confidence_score=round(confidence_score, 2),
            contributing_factors=contributing_factors,
            data_sources_used=data_sources_used or [],
            calculated_at=datetime.utcnow(),
        )

    async def store_risk_assessment(self, assessment: RiskAssessment):
        db = get_database()
        await db["risk_assessments"].update_one(
            {"location_id": assessment.location_id},
            {"$set": assessment.model_dump()},
            upsert=True,
        )

    async def get_risk_assessment(self, location_id: str) -> Optional[RiskAssessment]:
        try:
            db = get_database()
        except RuntimeError:
            return None
        doc = await db["risk_assessments"].find_one(
            {"location_id": location_id},
            sort=[("calculated_at", -1)],
        )
        if doc:
            doc.pop("_id", None)
            return RiskAssessment(**doc)
        return None

    async def get_all_risk_assessments(self) -> List[RiskAssessment]:
        db = get_database()
        pipeline = [
            {"$sort": {"calculated_at": -1}},
            {"$group": {"_id": "$location_id", "doc": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$doc"}},
        ]
        cursor = db["risk_assessments"].aggregate(pipeline)
        assessments = []
        async for doc in cursor:
            doc.pop("_id", None)
            assessments.append(RiskAssessment(**doc))
        return assessments


risk_engine = RiskEngine()
