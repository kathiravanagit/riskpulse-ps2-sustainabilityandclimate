from fastapi import APIRouter, HTTPException
from typing import List
from app.models.risk import ActionRecommendation
from app.services.action_engine import action_engine
from app.db.mongodb import get_database

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("/{location_id}", response_model=ActionRecommendation)
async def get_action(location_id: str):
    action = await action_engine.get_action_for_location(location_id)
    if not action:
        raise HTTPException(status_code=404, detail=f"No action found for {location_id}")
    return action


@router.get("", response_model=List[ActionRecommendation])
async def get_all_actions():
    db = get_database()
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$location_id", "doc": {"$first": "$$ROOT"}}},
        {"$replaceRoot": {"newRoot": "$doc"}},
    ]
    cursor = db["actions"].aggregate(pipeline)
    actions = []
    async for doc in cursor:
        doc.pop("_id", None)
        actions.append(ActionRecommendation(**doc))
    return actions
