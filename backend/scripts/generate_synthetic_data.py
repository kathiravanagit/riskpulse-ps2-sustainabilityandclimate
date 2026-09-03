import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "riskpulse")

CHENNAI_LOCATIONS = [
    {
        "location_id": "LOC-VELACH-001",
        "name": "Velachery",
        "ward": "Velachery",
        "latitude": 12.9815,
        "longitude": 80.2180,
        "elevation": 4.5,
        "historical_flood_frequency": 0.75,
        "population_density": 85,
        "road_vulnerability": 0.8,
        "critical_infrastructure": {"hospitals": 3, "schools": 5, "fire_stations": 1, "police_stations": 2},
        "baseline_vulnerability": 0.7,
    },
    {
        "location_id": "LOC-PALLIK-002",
        "name": "Pallikaranai",
        "ward": "Pallikaranai",
        "latitude": 12.9352,
        "longitude": 80.2350,
        "elevation": 3.0,
        "historical_flood_frequency": 0.85,
        "population_density": 90,
        "road_vulnerability": 0.85,
        "critical_infrastructure": {"hospitals": 2, "schools": 4, "fire_stations": 1, "police_stations": 1},
        "baseline_vulnerability": 0.8,
    },
    {
        "location_id": "LOC-VYASAR-003",
        "name": "Vyasarpadi",
        "ward": "Vyasarpadi",
        "latitude": 13.1100,
        "longitude": 80.2350,
        "elevation": 5.0,
        "historical_flood_frequency": 0.6,
        "population_density": 75,
        "road_vulnerability": 0.65,
        "critical_infrastructure": {"hospitals": 1, "schools": 3, "fire_stations": 0, "police_stations": 1},
        "baseline_vulnerability": 0.6,
    },
    {
        "location_id": "LOC-PERUMB-004",
        "name": "Perumbakkam",
        "ward": "Perumbakkam",
        "latitude": 12.9100,
        "longitude": 80.2000,
        "elevation": 3.5,
        "historical_flood_frequency": 0.7,
        "population_density": 80,
        "road_vulnerability": 0.75,
        "critical_infrastructure": {"hospitals": 2, "schools": 4, "fire_stations": 1, "police_stations": 1},
        "baseline_vulnerability": 0.65,
    },
    {
        "location_id": "LOC-SEMME-005",
        "name": "Semmenchery",
        "ward": "Semmenchery",
        "latitude": 12.8950,
        "longitude": 80.2250,
        "elevation": 4.0,
        "historical_flood_frequency": 0.65,
        "population_density": 70,
        "road_vulnerability": 0.7,
        "critical_infrastructure": {"hospitals": 1, "schools": 3, "fire_stations": 0, "police_stations": 1},
        "baseline_vulnerability": 0.55,
    },
]


def generate_weather_observations(location_id: str, count: int = 24) -> list:
    observations = []
    now = datetime.utcnow()
    for i in range(count):
        timestamp = now - timedelta(hours=i)
        rainfall = random.uniform(0, 20)
        if random.random() < 0.3:
            rainfall = random.uniform(50, 120)
        observations.append({
            "observation_id": str(uuid.uuid4()),
            "location_id": location_id,
            "timestamp": timestamp,
            "rainfall_mm": round(rainfall, 2),
            "rainfall_intensity": round(rainfall / max(1, random.randint(1, 6)), 2),
            "forecast_rainfall_mm": round(random.uniform(0, 30), 2),
            "source_type": "synthetic",
            "source_reliability": 0.6,
        })
    return observations


def generate_sensor_readings(location_id: str, count: int = 24) -> list:
    readings = []
    now = datetime.utcnow()
    base_water_level = random.uniform(10, 60)
    for i in range(count):
        timestamp = now - timedelta(hours=i)
        water_level = base_water_level + random.uniform(-10, 15)
        water_level = max(0, water_level)
        readings.append({
            "sensor_id": f"SENS-{location_id[:8]}-{i:03d}",
            "location_id": location_id,
            "timestamp": timestamp,
            "water_level_cm": round(water_level, 2),
            "battery_level": round(random.uniform(70, 100), 1),
            "connectivity_status": "online" if random.random() > 0.1 else "offline",
            "source_type": "synthetic",
            "source_reliability": 0.6,
        })
    return readings


def generate_citizen_reports(location_id: str, count: int = 8) -> list:
    reports = []
    now = datetime.utcnow()
    for i in range(count):
        timestamp = now - timedelta(hours=random.randint(0, 48))
        severity = random.randint(1, 5)
        water_depth = severity * random.uniform(5, 15)
        reports.append({
            "report_id": str(uuid.uuid4()),
            "location_id": location_id,
            "timestamp": timestamp,
            "report_type": "waterlogging",
            "water_depth_cm": round(water_depth, 2),
            "severity": severity,
            "verified": random.random() > 0.4,
            "source_reliability": 0.75 if random.random() > 0.4 else 0.5,
            "description": f"Synthetic citizen report for {location_id}",
            "source_type": "synthetic",
        })
    return reports


def main():
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    print("Generating synthetic data for RiskPulse...")

    for location in CHENNAI_LOCATIONS:
        db["locations"].update_one(
            {"location_id": location["location_id"]},
            {"$set": {**location, "source_type": "synthetic", "created_at": datetime.utcnow()}},
            upsert=True,
        )
        print(f"  Location: {location['name']}")

        weather = generate_weather_observations(location["location_id"])
        db["weather_observations"].insert_many(weather)
        print(f"    Weather observations: {len(weather)}")

        sensors = generate_sensor_readings(location["location_id"])
        db["sensor_readings"].insert_many(sensors)
        print(f"    Sensor readings: {len(sensors)}")

        reports = generate_citizen_reports(location["location_id"])
        db["citizen_reports"].insert_many(reports)
        print(f"    Citizen reports: {len(reports)}")

    print(f"\nSynthetic data generation complete!")
    print(f"Database: {DATABASE_NAME}")
    print(f"Locations: {len(CHENNAI_LOCATIONS)}")


if __name__ == "__main__":
    main()
