import pytest
from app.services.risk_engine import RiskEngine
from app.models.risk import RiskLevel


class TestRiskEngine:
    def setup_method(self):
        self.engine = RiskEngine()

    def test_normalize_rainfall_zero(self):
        assert self.engine.normalize_rainfall(0) == 0.0

    def test_normalize_rainfall_high(self):
        assert self.engine.normalize_rainfall(150) >= 100.0

    def test_normalize_rainfall_with_forecast(self):
        score = self.engine.normalize_rainfall(50, 50)
        assert score > self.engine.normalize_rainfall(50, 0)

    def test_normalize_water_level_zero(self):
        assert self.engine.normalize_water_level(0) == 0.0

    def test_normalize_water_level_high(self):
        assert self.engine.normalize_water_level(100) >= 100.0

    def test_normalize_elevation_low(self):
        assert self.engine.normalize_elevation(2.0) == 100.0

    def test_normalize_elevation_high(self):
        assert self.engine.normalize_elevation(15.0) == 0.0

    def test_normalize_historical(self):
        assert self.engine.normalize_historical(0.5) == 50.0

    def test_normalize_citizen_reports_zero(self):
        score = self.engine.normalize_citizen_reports(0, 1)
        assert score >= 0.0

    def test_normalize_citizen_reports_high(self):
        score = self.engine.normalize_citizen_reports(10, 5)
        assert score >= 50.0

    def test_determine_risk_level_low(self):
        assert self.engine.determine_risk_level(10) == RiskLevel.LOW

    def test_determine_risk_level_moderate(self):
        assert self.engine.determine_risk_level(35) == RiskLevel.MODERATE

    def test_determine_risk_level_high(self):
        assert self.engine.determine_risk_level(60) == RiskLevel.HIGH

    def test_determine_risk_level_critical(self):
        assert self.engine.determine_risk_level(80) == RiskLevel.CRITICAL
