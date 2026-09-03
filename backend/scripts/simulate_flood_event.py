import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import uuid
import time
from datetime import datetime
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.services.risk_engine import risk_engine
from app.services.vulnerability_engine import vulnerability_engine
from app.services.priority_engine import priority_engine
from app.services.action_engine import action_engine
from app.services.fusion_engine import fusion_engine


FLOOD_STAGES = [
    {"name": "Normal", "rainfall_mm": 5, "water_level_cm": 10, "reports": 0, "severity": 1},
    {"name": "Light Rain", "rainfall_mm": 25, "water_level_cm": 25, "reports": 2, "severity": 2},
    {"name": "Moderate Rain", "rainfall_mm": 50, "water_level_cm": 45, "reports": 4, "severity": 3},
    {"name": "Heavy Rain", "rainfall_mm": 80, "water_level_cm": 65, "reports": 6, "severity": 4},
    {"name": "Extreme Rain", "rainfall_mm": 120, "water_level_cm": 90, "reports": 10, "severity": 5},
]

TARGET_LOCATION = "LOC-PALLIK-002"


async def simulate_stage(db, location_id: str, stage: dict, stage_num: int):
    now = datetime.utcnow()

    weather_obs = {
        "observation_id": str(uuid.uuid4()),
        "location_id": location_id,
        "timestamp": now,
        "rainfall_mm": stage["rainfall_mm"],
        "rainfall_intensity": stage["rainfall_mm"] / 3,
        "forecast_rainfall_mm": stage["rainfall_mm"] * 0.3,
        "source_type": "synthetic",
        "source_reliability": 0.6,
    }
    await db["weather_observations"].insert_one(weather_obs)

    sensor_reading = {
        "sensor_id": f"SIM-{location_id[:8]}",
        "location_id": location_id,
        "timestamp": now,
        "water_level_cm": stage["water_level_cm"],
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
            "timestamp": now,
            "report_type": "waterlogging",
            "water_depth_cm": stage["water_level_cm"] * 0.8,
            "severity": stage["severity"],
            "verified": i % 2 == 0,
            "source_reliability": 0.75 if i % 2 == 0 else 0.5,
            "description": f"Simulation: {stage['name']}",
            "source_type": "synthetic",
        }
        await db["citizen_reports"].insert_one(report)

    weather_cursor = db["weather_observations"].find({"location_id": location_id}).sort("timestamp", -1).limit(10)
    weather_data = await weather_cursor.to_list(10)

    sensor_cursor = db["sensor_readings"].find({"location_id": location_id}).sort("timestamp", -1).limit(10)
    sensor_data = await sensor_cursor.to_list(10)

    report_cursor = db["citizen_reports"].find({"location_id": location_id}).sort("timestamp", -1).limit(10)
    report_data = await report_cursor.to_list(10)

    rainfall_fused = fusion_engine.fuse_rainfall(weather_data)
    water_fused = fusion_engine.fuse_water_level(sensor_data)
    citizen_fused = fusion_engine.fuse_citizen_reports(report_data)

    rainfall_score = risk_engine.normalize_rainfall(rainfall_fused.fused_value, stage["rainfall_mm"] * 0.3)
    water_score = risk_engine.normalize_water_level(water_fused.fused_value)

    location = await db["locations"].find_one({"location_id": location_id})
    elevation_score = risk_engine.normalize_elevation(location.get("elevation", 10))
    historical_score = risk_engine.normalize_historical(location.get("historical_flood_frequency", 0))
    citizen_score = risk_engine.normalize_citizen_reports(len(report_data), stage["severity"])

    risk_assessment = await risk_engine.calculate_risk(
        location_id=location_id,
        rainfall_score=rainfall_score,
        water_level_score=water_score,
        elevation_score=elevation_score,
        historical_score=historical_score,
        citizen_score=citizen_score,
        confidence_score=(rainfall_fused.confidence_score + water_fused.confidence_score) / 2,
        data_sources_used=["weather", "sensors", "citizen_reports"],
    )
    await risk_engine.store_risk_assessment(risk_assessment)

    vuln_assessment = await vulnerability_engine.calculate_vulnerability(location_id)
    await vulnerability_engine.store_vulnerability_assessment(vuln_assessment)

    priority_score = priority_engine.calculate_priority_score(
        risk_assessment.risk_score, vuln_assessment.vulnerability_score
    )

    action = await action_engine.generate_action(
        location_id=location_id,
        risk_level=risk_assessment.risk_level,
        vulnerability_level=vuln_assessment.vulnerability_level,
        priority_score=priority_score,
    )

    return {
        "stage": stage_num + 1,
        "name": stage["name"],
        "risk_score": risk_assessment.risk_score,
        "risk_level": risk_assessment.risk_level.value,
        "vulnerability_score": vuln_assessment.vulnerability_score,
        "vulnerability_level": vuln_assessment.vulnerability_level.value,
        "priority_score": round(priority_score, 2),
        "action": action.action,
    }


async def run_simulation():
    await connect_to_mongo()
    db = get_database()

    print(f"Starting flood simulation for Pallikaranai...")
    print("=" * 60)

    for i, stage in enumerate(FLOOD_STAGES):
        print(f"\nStage {i + 1}: {stage['name']}")
        print("-" * 40)

        result = await simulate_stage(db, TARGET_LOCATION, stage, i)

        print(f"  Rainfall: {stage['rainfall_mm']} mm")
        print(f"  Water Level: {stage['water_level_cm']} cm")
        print(f"  Citizen Reports: {stage['reports']}")
        print(f"  Risk Score: {result['risk_score']} ({result['risk_level']})")
        print(f"  Vulnerability: {result['vulnerability_score']} ({result['vulnerability_level']})")
        print(f"  Priority Score: {result['priority_score']}")
        print(f"  Recommended Action: {result['action']}")

        time.sleep(1)

    print("\n" + "=" * 60)
    print("Simulation complete!")

    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(run_simulation())
