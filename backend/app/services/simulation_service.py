import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List
from app.db.mongodb import get_database
from app.services.fusion_engine import fusion_engine
from app.services.risk_engine import risk_engine
from app.services.vulnerability_engine import vulnerability_engine
from app.services.priority_engine import priority_engine
from app.services.action_engine import action_engine


class SimulationService:
    def __init__(self):
        self.is_running = False
        self.current_stage = 0
        self.stages = [
            {"rainfall": 10, "water_level": 15, "reports": 1, "severity": 2, "duration": 3},
            {"rainfall": 30, "water_level": 35, "reports": 3, "severity": 3, "duration": 3},
            {"rainfall": 60, "water_level": 55, "reports": 5, "severity": 4, "duration": 3},
            {"rainfall": 100, "water_level": 80, "reports": 8, "severity": 5, "duration": 3},
            {"rainfall": 130, "water_level": 95, "reports": 12, "severity": 5, "duration": 3},
        ]

    async def simulate_stage(self, location_id: str, stage: Dict):
        db = get_database()
        now = datetime.utcnow()

        weather_obs = {
            "observation_id": str(uuid.uuid4()),
            "location_id": location_id,
            "timestamp": now,
            "rainfall_mm": stage["rainfall"],
            "rainfall_intensity": stage["rainfall"] / 3,
            "forecast_rainfall_mm": stage["rainfall"] * 0.3,
            "source_type": "synthetic",
            "source_reliability": 0.6,
        }
        await db["weather_observations"].insert_one(weather_obs)

        sensor_reading = {
            "sensor_id": f"SIM-{location_id[:8]}",
            "location_id": location_id,
            "timestamp": now,
            "water_level_cm": stage["water_level"],
            "battery_level": 85,
            "connectivity_status": "online",
            "source_type": "synthetic",
            "source_reliability": 0.6,
        }
        await db["sensor_readings"].insert_one(sensor_reading)

        for i in range(stage["reports"]):
            report = {
                "report_id": str(uuid.uuid4()),
                "location_id": location_id,
                "timestamp": now - timedelta(minutes=i * 5),
                "report_type": "waterlogging",
                "water_depth_cm": stage["water_level"] * 0.8,
                "severity": stage["severity"],
                "verified": i % 2 == 0,
                "source_reliability": 0.5 if i % 2 == 0 else 0.75,
                "description": f"Simulated flood report - Stage {self.current_stage + 1}",
                "source_type": "synthetic",
            }
            await db["citizen_reports"].insert_one(report)

    async def run_simulation(self, location_id: str):
        self.is_running = True
        self.current_stage = 0

        for stage in self.stages:
            if not self.is_running:
                break

            self.current_stage = self.stages.index(stage)
            await self.simulate_stage(location_id, stage)
            await asyncio.sleep(stage["duration"])

        self.is_running = False

    async def stop_simulation(self):
        self.is_running = False

    def get_status(self) -> Dict:
        return {
            "is_running": self.is_running,
            "current_stage": self.current_stage,
            "total_stages": len(self.stages),
            "stages": self.stages,
        }


simulation_service = SimulationService()
