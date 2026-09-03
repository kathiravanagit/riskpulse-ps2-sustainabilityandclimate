import pytest
from datetime import datetime, timedelta
from app.services.fusion_engine import FusionEngine


class TestFusionEngine:
    def setup_method(self):
        self.engine = FusionEngine()

    def test_calculate_recency_weight_recent(self):
        now = datetime.utcnow()
        weight = self.engine.calculate_recency_weight(now)
        assert weight == pytest.approx(1.0, abs=0.01)

    def test_calculate_recency_weight_old(self):
        old_time = datetime.utcnow() - timedelta(hours=24)
        weight = self.engine.calculate_recency_weight(old_time)
        assert weight < 0.5

    def test_fuse_signals_empty(self):
        result = self.engine.fuse_signals([])
        assert result.fused_value == 0.0
        assert result.confidence_score == 0.0

    def test_fuse_signals_single(self):
        signals = [{"value": 50.0, "source_type": "synthetic", "timestamp": datetime.utcnow()}]
        result = self.engine.fuse_signals(signals)
        assert result.fused_value == pytest.approx(50.0, abs=1.0)

    def test_fuse_signals_multiple(self):
        signals = [
            {"value": 40.0, "source_type": "synthetic", "timestamp": datetime.utcnow()},
            {"value": 60.0, "source_type": "synthetic", "timestamp": datetime.utcnow()},
        ]
        result = self.engine.fuse_signals(signals)
        assert 40.0 <= result.fused_value <= 60.0

    def test_get_source_reliability(self):
        assert self.engine.get_source_reliability("official_weather") == 0.95
        assert self.engine.get_source_reliability("verified_sensor") == 0.90
        assert self.engine.get_source_reliability("unverified_sensor") == 0.70

    def test_fuse_rainfall(self):
        observations = [
            {"rainfall_mm": 50.0, "source_type": "synthetic", "timestamp": datetime.utcnow()},
            {"rainfall_mm": 30.0, "source_type": "synthetic", "timestamp": datetime.utcnow()},
        ]
        result = self.engine.fuse_rainfall(observations)
        assert result.fused_value > 0
        assert result.confidence_score > 0

    def test_fuse_water_level(self):
        readings = [
            {"water_level_cm": 40.0, "connectivity_status": "online", "timestamp": datetime.utcnow()},
        ]
        result = self.engine.fuse_water_level(readings)
        assert result.fused_value == pytest.approx(40.0, abs=1.0)
