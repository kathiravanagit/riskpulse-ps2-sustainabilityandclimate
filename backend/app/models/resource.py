from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Resource(BaseModel):
    resource_id: str
    location_id: str
    category: str
    name: str
    latitude: float
    longitude: float
    capacity: Optional[int] = Field(default=None, ge=0)
    status: str = "available"
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResourceStatusUpdate(BaseModel):
    status: str