import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.db.indexes import create_indexes
from app.config import settings
from app.api.auth import _hash_password


async def seed():
    await connect_to_mongo()
    await create_indexes()

    db = get_database()

    location_count = await db["locations"].count_documents({})
    weather_count = await db["weather_observations"].count_documents({})
    sensor_count = await db["sensor_readings"].count_documents({})
    report_count = await db["citizen_reports"].count_documents({})

    if settings.BOOTSTRAP_ADMIN_EMAIL and settings.BOOTSTRAP_ADMIN_PASSWORD:
        email = settings.BOOTSTRAP_ADMIN_EMAIL.strip().lower()
        await db["users"].update_one(
            {"email": email},
            {
                "$setOnInsert": {
                    "email": email,
                    "name": "RiskPulse Administrator",
                    "password_hash": _hash_password(settings.BOOTSTRAP_ADMIN_PASSWORD),
                    "role": "admin",
                }
            },
            upsert=True,
        )
        print(f"  Bootstrap admin: {email}")
    else:
        print("  Bootstrap admin: skipped (set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD)")

    print(f"Database seeded successfully!")
    print(f"  Locations: {location_count}")
    print(f"  Weather observations: {weather_count}")
    print(f"  Sensor readings: {sensor_count}")
    print(f"  Citizen reports: {report_count}")

    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
