from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.db.mongodb import get_database
from app.models.sensor import SensorReading, SensorCreate, SensorResponse

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("/{location_id}", response_model=List[SensorResponse])
async def get_sensors(location_id: str, limit: int = 20):
    db = get_database()
    cursor = db["sensor_readings"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(limit)
    readings = []
    async for doc in cursor:
        doc.pop("_id", None)
        readings.append(SensorResponse(**doc))
    return readings


@router.post("/readings", response_model=SensorResponse, status_code=201)
async def create_sensor_reading(data: SensorCreate):
    db = get_database()
    reading = SensorReading(
        sensor_id=data.sensor_id,
        location_id=data.location_id,
        timestamp=datetime.utcnow(),
        water_level_cm=data.water_level_cm,
        battery_level=data.battery_level,
        connectivity_status=data.connectivity_status,
        source_type=data.source_type,
        source_reliability=data.source_reliability,
    )
    await db["sensor_readings"].insert_one(reading.model_dump())
    return reading
