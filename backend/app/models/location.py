from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CriticalInfrastructure(BaseModel):
    hospitals: int = 0
    schools: int = 0
    fire_stations: int = 0
    police_stations: int = 0


class Location(BaseModel):
    location_id: str
    name: str
    ward: str
    latitude: float
    longitude: float
    elevation: float
    historical_flood_frequency: float = Field(ge=0, le=1)
    population_density: float = Field(ge=0, le=100)
    road_vulnerability: float = Field(ge=0, le=1)
    critical_infrastructure: CriticalInfrastructure = CriticalInfrastructure()
    baseline_vulnerability: float = Field(ge=0, le=1)
    source_type: str = "synthetic"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LocationResponse(BaseModel):
    location_id: str
    name: str
    ward: str
    latitude: float
    longitude: float
    elevation: float
    historical_flood_frequency: float
    population_density: float
    road_vulnerability: float
    critical_infrastructure: CriticalInfrastructure
    baseline_vulnerability: float
