import logging
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.risk import PriorityAssessment
from app.services.priority_engine import priority_engine

logger = logging.getLogger("riskpulse.api.priority")
router = APIRouter(prefix="/priority", tags=["priority"])


@router.get("", response_model=List[PriorityAssessment])
async def get_priorities():
    priorities = await priority_engine.get_ranked_priorities()
    if not priorities:
        logger.info("No priorities found, calculating fresh rankings")
        priorities = await priority_engine.calculate_all_priorities()
        await priority_engine.store_priorities(priorities)
    return priorities


@router.get("/{location_id}", response_model=PriorityAssessment)
async def get_priority(location_id: str):
    try:
        return await priority_engine.get_priority(location_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Priority not found for {location_id}")
