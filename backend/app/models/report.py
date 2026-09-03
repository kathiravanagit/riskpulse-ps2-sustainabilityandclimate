from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CitizenReport(BaseModel):
    report_id: str
    location_id: str
    timestamp: datetime
    report_type: str = "waterlogging"
    water_depth_cm: float = Field(ge=0, default=0)
    severity: int = Field(ge=1, le=5, default=3)
    verified: bool = False
    source_reliability: float = Field(ge=0, le=1, default=0.5)
    description: str = ""
    source_type: str = "synthetic"


class CitizenReportCreate(BaseModel):
    location_id: str
    report_type: str = "waterlogging"
    water_depth_cm: float = Field(ge=0, default=0)
    severity: int = Field(ge=1, le=5, default=3)
    verified: bool = False
    description: str = ""
    source_type: str = "synthetic"


class CitizenReportResponse(BaseModel):
    report_id: str
    location_id: str
    timestamp: datetime
    report_type: str
    water_depth_cm: float
    severity: int
    verified: bool
    source_reliability: float
    description: str
    source_type: str
