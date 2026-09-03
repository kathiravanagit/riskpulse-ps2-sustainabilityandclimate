from datetime import datetime
from enum import Enum
from typing import Dict, List
from pydantic import BaseModel, Field


class HazardType(str, Enum):
    FLOOD = "flood"
    HEATWAVE = "heatwave"
    CYCLONE = "cyclone"
    LANDSLIDE = "landslide"
    GLACIAL_LAKE_FAILURE = "glacial_lake_failure"
    MARINE_HEAT = "marine_heat"


class HazardSignal(BaseModel):
    hazard: HazardType
    score: float = Field(ge=0, le=100)
    level: str
    confidence: float = Field(ge=0, le=100)
    evidence: List[str]
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OperationalPriority(BaseModel):
    priority: int = Field(ge=1)
    category: str
    name: str
    location: str
    reason: str
    status: str = "open"


class HazardAssessment(BaseModel):
    location_id: str
    location_name: str
    overall_score: float = Field(ge=0, le=100)
    overall_level: str
    signals: List[HazardSignal]
    priorities: List[OperationalPriority]
    data_quality: Dict[str, str]
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class HazardAssessmentRequest(BaseModel):
    location_id: str
    rainfall_mm: float = Field(default=0, ge=0)
    temperature_c: float = Field(default=30, ge=-50, le=70)
    wind_kmh: float = Field(default=0, ge=0)
    water_level_cm: float = Field(default=0, ge=0)
    slope_degrees: float = Field(default=0, ge=0, le=90)
    soil_saturation: float = Field(default=0, ge=0, le=100)
    sea_surface_temp_anomaly_c: float = Field(default=0, ge=-10, le=10)
    lake_level_change_m: float = Field(default=0, ge=0)
    population_exposure: float = Field(default=50, ge=0, le=100)
