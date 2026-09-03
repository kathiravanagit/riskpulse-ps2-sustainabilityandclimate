from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SensorReading(BaseModel):
    sensor_id: str
    location_id: str
    timestamp: datetime
    water_level_cm: float = Field(ge=0)
    battery_level: float = Field(ge=0, le=100, default=100)
    connectivity_status: str = "online"
    source_type: str = "synthetic"
    source_reliability: float = Field(ge=0, le=1, default=0.6)


class SensorCreate(BaseModel):
    sensor_id: str
    location_id: str
    water_level_cm: float = Field(ge=0)
    battery_level: float = Field(ge=0, le=100, default=100)
    connectivity_status: str = "online"
    source_type: str = "synthetic"
    source_reliability: float = Field(ge=0, le=1, default=0.6)


class SensorResponse(BaseModel):
    sensor_id: str
    location_id: str
    timestamp: datetime
    water_level_cm: float
    battery_level: float
    connectivity_status: str
    source_type: str
    source_reliability: float
