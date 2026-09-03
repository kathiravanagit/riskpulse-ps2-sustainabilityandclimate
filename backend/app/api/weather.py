from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
import httpx
from app.db.mongodb import get_database
from app.models.weather import WeatherObservation, WeatherCreate, WeatherResponse

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/{location_id}", response_model=List[WeatherResponse])
async def get_weather(location_id: str, limit: int = 20):
    db = get_database()
    cursor = db["weather_observations"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(limit)
    observations = []
    async for doc in cursor:
        doc.pop("_id", None)
        observations.append(WeatherResponse(**doc))
    return observations


@router.post("/observations", response_model=WeatherResponse, status_code=201)
async def create_weather_observation(data: WeatherCreate):
    db = get_database()
    observation = WeatherObservation(
        observation_id=str(uuid.uuid4()),
        location_id=data.location_id,
        timestamp=datetime.utcnow(),
        rainfall_mm=data.rainfall_mm,
        rainfall_intensity=data.rainfall_intensity,
        forecast_rainfall_mm=data.forecast_rainfall_mm,
        source_type=data.source_type,
        source_reliability=data.source_reliability,
    )
    await db["weather_observations"].insert_one(observation.model_dump())
    return observation


@router.post("/sync/{location_id}", response_model=WeatherResponse)
async def sync_live_weather(location_id: str):
    """Fetch the current observation and short forecast from Open-Meteo."""
    db = get_database()
    location = await db["locations"].find_one({"location_id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": "rain,temperature_2m,wind_speed_10m",
        "hourly": "precipitation",
        "forecast_days": 1,
        "timezone": "UTC",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://api.open-meteo.com/v1/forecast", params=params)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Weather provider unavailable: {exc}") from exc

    current = payload.get("current", {})
    hourly = payload.get("hourly", {}).get("precipitation", [])
    rainfall = max(0.0, float(current.get("rain", 0) or 0))
    forecast = sum(float(value or 0) for value in hourly[:6])
    observation = WeatherObservation(
        observation_id=str(uuid.uuid4()),
        location_id=location_id,
        timestamp=datetime.utcnow(),
        rainfall_mm=rainfall,
        rainfall_intensity=rainfall,
        forecast_rainfall_mm=max(0.0, forecast),
        source_type="open-meteo",
        source_reliability=0.85,
    )
    await db["weather_observations"].insert_one(observation.model_dump())
    return observation
