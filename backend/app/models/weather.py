from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WeatherObservation(BaseModel):
    observation_id: str
    location_id: str
    timestamp: datetime
    rainfall_mm: float = Field(ge=0)
    rainfall_intensity: float = Field(ge=0)
    forecast_rainfall_mm: float = Field(ge=0, default=0)
    source_type: str = "synthetic"
    source_reliability: float = Field(ge=0, le=1, default=0.6)


class WeatherCreate(BaseModel):
    location_id: str
    rainfall_mm: float = Field(ge=0)
    rainfall_intensity: float = Field(ge=0)
    forecast_rainfall_mm: float = Field(ge=0, default=0)
    source_type: str = "synthetic"
    source_reliability: float = Field(ge=0, le=1, default=0.6)


class WeatherResponse(BaseModel):
    observation_id: str
    location_id: str
    timestamp: datetime
    rainfall_mm: float
    rainfall_intensity: float
    forecast_rainfall_mm: float
    source_type: str
    source_reliability: float
