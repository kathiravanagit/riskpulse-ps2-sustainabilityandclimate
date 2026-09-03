import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.config import settings
from app.models.risk import FusedSignal


class FusionEngine:
    def __init__(self):
        self.half_life_hours = settings.RECENCY_HALF_LIFE_HOURS

    def calculate_recency_weight(self, observation_time: datetime, reference_time: Optional[datetime] = None) -> float:
        if reference_time is None:
            reference_time = datetime.utcnow()
        hours_diff = (reference_time - observation_time).total_seconds() / 3600
        decay = math.exp(-0.693 * hours_diff / self.half_life_hours)
        return max(0.1, min(1.0, decay))

    def get_source_reliability(self, source_type: str, verified: bool = False) -> float:
        reliability_map = {
            "official_weather": settings.RELIABILITY_OFFICIAL_WEATHER,
            "verified_sensor": settings.RELIABILITY_VERIFIED_SENSOR,
            "unverified_sensor": settings.RELIABILITY_UNVERIFIED_SENSOR,
            "verified_citizen": settings.RELIABILITY_VERIFIED_CITIZEN,
            "unverified_citizen": settings.RELIABILITY_UNVERIFIED_CITIZEN,
            "synthetic": settings.RELIABILITY_SYNTHETIC,
        }
        if source_type == "citizen_report":
            return settings.RELIABILITY_VERIFIED_CITIZEN if verified else settings.RELIABILITY_UNVERIFIED_CITIZEN
        return reliability_map.get(source_type, settings.RELIABILITY_SYNTHETIC)

    def fuse_signals(self, signals: List[Dict]) -> FusedSignal:
        if not signals:
            return FusedSignal(
                fused_value=0.0,
                confidence_score=0.0,
                source_contributions=[],
                timestamp=datetime.utcnow(),
            )

        weighted_sum = 0.0
        total_weight = 0.0
        source_contributions = []

        for signal in signals:
            value = signal.get("value", 0)
            source_type = signal.get("source_type", "synthetic")
            timestamp = signal.get("timestamp", datetime.utcnow())
            verified = signal.get("verified", False)

            reliability = self.get_source_reliability(source_type, verified)
            recency = self.calculate_recency_weight(timestamp)
            weight = reliability * recency

            weighted_sum += value * weight
            total_weight += weight

            source_contributions.append({
                "source_type": source_type,
                "value": value,
                "reliability": round(reliability, 3),
                "recency_weight": round(recency, 3),
                "combined_weight": round(weight, 3),
            })

        fused_value = weighted_sum / total_weight if total_weight > 0 else 0.0

        confidence_score = min(100.0, (total_weight / len(signals)) * 100) if signals else 0.0

        return FusedSignal(
            fused_value=round(fused_value, 2),
            confidence_score=round(confidence_score, 2),
            source_contributions=source_contributions,
            timestamp=datetime.utcnow(),
        )

    def fuse_rainfall(self, weather_observations: List[Dict]) -> FusedSignal:
        signals = []
        for obs in weather_observations:
            signals.append({
                "value": obs.get("rainfall_mm", 0),
                "source_type": obs.get("source_type", "synthetic"),
                "timestamp": obs.get("timestamp", datetime.utcnow()),
                "verified": True,
            })
        return self.fuse_signals(signals)

    def fuse_water_level(self, sensor_readings: List[Dict]) -> FusedSignal:
        signals = []
        for reading in sensor_readings:
            signals.append({
                "value": reading.get("water_level_cm", 0),
                "source_type": "verified_sensor" if reading.get("connectivity_status") == "online" else "unverified_sensor",
                "timestamp": reading.get("timestamp", datetime.utcnow()),
                "verified": reading.get("connectivity_status") == "online",
            })
        return self.fuse_signals(signals)

    def fuse_citizen_reports(self, reports: List[Dict]) -> FusedSignal:
        signals = []
        for report in reports:
            signals.append({
                "value": report.get("water_depth_cm", 0) * report.get("severity", 3),
                "source_type": "citizen_report",
                "timestamp": report.get("timestamp", datetime.utcnow()),
                "verified": report.get("verified", False),
            })
        return self.fuse_signals(signals)


fusion_engine = FusionEngine()
