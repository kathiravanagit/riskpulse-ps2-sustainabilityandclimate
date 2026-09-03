from typing import List
from datetime import datetime
from app.config import settings
from app.models.risk import (
    RiskAssessment, VulnerabilityAssessment, PriorityAssessment, RiskLevel
)
from app.db.mongodb import get_database


class PriorityEngine:
    def __init__(self):
        self.weight_risk = settings.PRIORITY_WEIGHT_RISK
        self.weight_vulnerability = settings.PRIORITY_WEIGHT_VULNERABILITY

    def calculate_priority_score(self, risk_score: float, vulnerability_score: float) -> float:
        priority = (
            risk_score * self.weight_risk
            + vulnerability_score * self.weight_vulnerability
        )
        return max(0.0, min(100.0, priority))

    async def calculate_all_priorities(self) -> List[PriorityAssessment]:
        db = get_database()

        risk_pipeline = [
            {"$sort": {"calculated_at": -1}},
            {"$group": {"_id": "$location_id", "doc": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$doc"}},
        ]
        risk_cursor = db["risk_assessments"].aggregate(risk_pipeline)
        risk_map = {}
        async for doc in risk_cursor:
            doc.pop("_id", None)
            risk_map[doc["location_id"]] = RiskAssessment(**doc)

        vuln_cursor = db["vulnerability_assessments"].find()
        vuln_map = {}
        async for doc in vuln_cursor:
            doc.pop("_id", None)
            vuln_map[doc["location_id"]] = VulnerabilityAssessment(**doc)

        priorities = []
        for location_id, risk in risk_map.items():
            vuln = vuln_map.get(location_id)
            if not vuln:
                continue

            priority_score = self.calculate_priority_score(
                risk.risk_score, vuln.vulnerability_score
            )

            action_doc = await db["actions"].find_one(
                {"location_id": location_id},
                sort=[("created_at", -1)],
            )
            recommended_action = action_doc.get("action", "Continue monitoring") if action_doc else "Continue monitoring"

            priority = PriorityAssessment(
                rank=0,
                location_id=location_id,
                location_name=risk.location_name,
                risk_score=risk.risk_score,
                vulnerability_score=vuln.vulnerability_score,
                priority_score=round(priority_score, 2),
                risk_level=risk.risk_level,
                recommended_action=recommended_action,
                confidence_score=risk.confidence_score,
                calculated_at=datetime.utcnow(),
            )
            priorities.append(priority)

        priorities.sort(key=lambda x: x.priority_score, reverse=True)
        for i, p in enumerate(priorities):
            p.rank = i + 1

        return priorities

    async def store_priorities(self, priorities: List[PriorityAssessment]):
        db = get_database()
        await db["priority_assessments"].delete_many({})
        for p in priorities:
            await db["priority_assessments"].insert_one(p.model_dump())

    async def get_ranked_priorities(self) -> List[PriorityAssessment]:
        db = get_database()
        cursor = db["priority_assessments"].find().sort("rank", 1)
        priorities = []
        async for doc in cursor:
            doc.pop("_id", None)
            priorities.append(PriorityAssessment(**doc))
        return priorities

    async def get_priority(self, location_id: str) -> PriorityAssessment:
        db = get_database()
        doc = await db["priority_assessments"].find_one({"location_id": location_id})
        if doc:
            doc.pop("_id", None)
            return PriorityAssessment(**doc)
        raise ValueError(f"Priority not found for location {location_id}")


priority_engine = PriorityEngine()
