import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.db.indexes import create_indexes


async def seed():
    await connect_to_mongo()
    await create_indexes()

    db = get_database()

    location_count = await db["locations"].count_documents({})
    weather_count = await db["weather_observations"].count_documents({})
    sensor_count = await db["sensor_readings"].count_documents({})
    report_count = await db["citizen_reports"].count_documents({})

    print(f"Database seeded successfully!")
    print(f"  Locations: {location_count}")
    print(f"  Weather observations: {weather_count}")
    print(f"  Sensor readings: {sensor_count}")
    print(f"  Citizen reports: {report_count}")

    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
