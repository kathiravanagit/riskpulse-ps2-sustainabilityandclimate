from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class AlertRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=3, max_length=2000)
    severity: str = "HIGH"
    location_id: str
    audiences: List[str] = Field(min_length=1)
    recipients: List[str] = []


class AlertResponse(BaseModel):
    alert_id: str
    title: str
    message: str
    severity: str
    location_id: str
    audiences: List[str]
    channels: dict
    created_at: datetime