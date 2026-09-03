from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class VulnerabilityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class ContributingFactors(BaseModel):
    rainfall: float = Field(ge=0, le=100)
    water_level: float = Field(ge=0, le=100)
    elevation: float = Field(ge=0, le=100)
    historical_flooding: float = Field(ge=0, le=100)
    citizen_reports: float = Field(ge=0, le=100)


class FusedSignal(BaseModel):
    fused_value: float
    confidence_score: float
    source_contributions: List[Dict]
    timestamp: datetime


class RiskAssessment(BaseModel):
    location_id: str
    location_name: str
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    confidence_score: float = Field(ge=0, le=100)
    contributing_factors: ContributingFactors
    data_sources_used: List[str]
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class VulnerabilityAssessment(BaseModel):
    location_id: str
    location_name: str
    vulnerability_score: float = Field(ge=0, le=100)
    vulnerability_level: VulnerabilityLevel
    factors: Dict[str, float]
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class PriorityAssessment(BaseModel):
    rank: int
    location_id: str
    location_name: str
    risk_score: float
    vulnerability_score: float
    priority_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    recommended_action: str
    confidence_score: float
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class ActionRecommendation(BaseModel):
    location_id: str
    location_name: str
    action: str
    risk_level: RiskLevel
    vulnerability_level: VulnerabilityLevel
    priority_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecalculateResponse(BaseModel):
    location_id: str
    risk_assessment: RiskAssessment
    vulnerability_assessment: VulnerabilityAssessment
    priority_assessment: PriorityAssessment
    action: ActionRecommendation
