from fastapi import APIRouter, HTTPException
from typing import List
from app.db.mongodb import get_database
from app.models.location import Location, LocationResponse

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=List[LocationResponse])
async def get_locations():
    try:
        db = get_database()
    except RuntimeError:
        return []
    cursor = db["locations"].find()
    locations = []
    async for doc in cursor:
        doc.pop("_id", None)
        locations.append(LocationResponse(**doc))
    return locations


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(location_id: str):
    try:
        db = get_database()
    except RuntimeError:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
    doc = await db["locations"].find_one({"location_id": location_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
    doc.pop("_id", None)
    return LocationResponse(**doc)
