from datetime import datetime
from typing import Optional
from app.models.risk import (
    RiskLevel, VulnerabilityLevel, ActionRecommendation
)
from app.db.mongodb import get_database


class ActionEngine:
    def __init__(self):
        self.action_rules = {
            (RiskLevel.CRITICAL, VulnerabilityLevel.VERY_HIGH): "Immediate field inspection / rescue readiness",
            (RiskLevel.CRITICAL, VulnerabilityLevel.HIGH): "Immediate field inspection / rescue readiness",
            (RiskLevel.CRITICAL, VulnerabilityLevel.MEDIUM): "Deploy emergency response teams",
            (RiskLevel.CRITICAL, VulnerabilityLevel.LOW): "Deploy emergency response teams",
            (RiskLevel.HIGH, VulnerabilityLevel.VERY_HIGH): "Deploy pump / inspect drainage",
            (RiskLevel.HIGH, VulnerabilityLevel.HIGH): "Deploy pump / inspect drainage",
            (RiskLevel.HIGH, VulnerabilityLevel.MEDIUM): "Monitor and prepare response team",
            (RiskLevel.HIGH, VulnerabilityLevel.LOW): "Monitor and prepare response team",
            (RiskLevel.MODERATE, VulnerabilityLevel.VERY_HIGH): "Increase monitoring frequency",
            (RiskLevel.MODERATE, VulnerabilityLevel.HIGH): "Increase monitoring frequency",
            (RiskLevel.MODERATE, VulnerabilityLevel.MEDIUM): "Continue monitoring",
            (RiskLevel.MODERATE, VulnerabilityLevel.LOW): "Continue monitoring",
            (RiskLevel.LOW, VulnerabilityLevel.VERY_HIGH): "Continue monitoring",
            (RiskLevel.LOW, VulnerabilityLevel.HIGH): "Continue monitoring",
            (RiskLevel.LOW, VulnerabilityLevel.MEDIUM): "No immediate action",
            (RiskLevel.LOW, VulnerabilityLevel.LOW): "No immediate action",
        }

    def get_action(self, risk_level: RiskLevel, vulnerability_level: VulnerabilityLevel) -> str:
        return self.action_rules.get(
            (risk_level, vulnerability_level),
            "Continue monitoring"
        )

    async def generate_action(
        self,
        location_id: str,
        risk_level: RiskLevel,
        vulnerability_level: VulnerabilityLevel,
        priority_score: float,
    ) -> ActionRecommendation:
        db = get_database()
        location = await db["locations"].find_one({"location_id": location_id})
        location_name = location["name"] if location else location_id

        action_text = self.get_action(risk_level, vulnerability_level)

        recommendation = ActionRecommendation(
            location_id=location_id,
            location_name=location_name,
            action=action_text,
            risk_level=risk_level,
            vulnerability_level=vulnerability_level,
            priority_score=round(priority_score, 2),
            created_at=datetime.utcnow(),
        )

        await db["actions"].update_one(
            {"location_id": location_id},
            {"$set": recommendation.model_dump()},
            upsert=True,
        )

        return recommendation

    async def get_action_for_location(self, location_id: str) -> Optional[ActionRecommendation]:
        db = get_database()
        doc = await db["actions"].find_one(
            {"location_id": location_id},
            sort=[("created_at", -1)],
        )
        if doc:
            doc.pop("_id", None)
            return ActionRecommendation(**doc)
        return None


action_engine = ActionEngine()
