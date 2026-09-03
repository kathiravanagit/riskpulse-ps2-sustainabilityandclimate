import pytest
from app.services.priority_engine import PriorityEngine


class TestPriorityEngine:
    def setup_method(self):
        self.engine = PriorityEngine()

    def test_calculate_priority_score_balanced(self):
        score = self.engine.calculate_priority_score(50, 50)
        assert score == pytest.approx(50.0, abs=1.0)

    def test_calculate_priority_score_high_risk(self):
        score = self.engine.calculate_priority_score(80, 30)
        assert score > 50.0

    def test_calculate_priority_score_high_vulnerability(self):
        score = self.engine.calculate_priority_score(30, 80)
        assert score >= 50.0

    def test_calculate_priority_score_bounds(self):
        score = self.engine.calculate_priority_score(100, 100)
        assert score <= 100.0
        score = self.engine.calculate_priority_score(0, 0)
        assert score >= 0.0
