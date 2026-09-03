import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
import uuid
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "riskpulse")


def import_historical_weather(csv_path: str, location_id: str):
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        observations = []
        for row in reader:
            obs = {
                "observation_id": str(uuid.uuid4()),
                "location_id": location_id,
                "timestamp": datetime.fromisoformat(row.get("timestamp", datetime.utcnow().isoformat())),
                "rainfall_mm": float(row.get("rainfall_mm", 0)),
                "rainfall_intensity": float(row.get("rainfall_intensity", 0)),
                "forecast_rainfall_mm": float(row.get("forecast_rainfall_mm", 0)),
                "source_type": "historical",
                "source_reliability": 0.9,
            }
            observations.append(obs)

        if observations:
            db["weather_observations"].insert_many(observations)
            print(f"Imported {len(observations)} historical weather observations")

    client.close()


def import_historical_sensors(csv_path: str, location_id: str):
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        readings = []
        for row in reader:
            reading = {
                "sensor_id": f"HIST-{location_id[:8]}",
                "location_id": location_id,
                "timestamp": datetime.fromisoformat(row.get("timestamp", datetime.utcnow().isoformat())),
                "water_level_cm": float(row.get("water_level_cm", 0)),
                "battery_level": float(row.get("battery_level", 100)),
                "connectivity_status": "online",
                "source_type": "historical",
                "source_reliability": 0.9,
            }
            readings.append(reading)

        if readings:
            db["sensor_readings"].insert_many(readings)
            print(f"Imported {len(readings)} historical sensor readings")

    client.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Import historical data into RiskPulse")
    parser.add_argument("--type", choices=["weather", "sensors"], required=True)
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--location", required=True, help="Location ID")

    args = parser.parse_args()

    if args.type == "weather":
        import_historical_weather(args.csv, args.location)
    elif args.type == "sensors":
        import_historical_sensors(args.csv, args.location)
