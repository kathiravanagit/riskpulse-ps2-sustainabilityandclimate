from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.config import settings


class MongoDB:
    client: AsyncIOMotorClient = None
    database = None


db = MongoDB()


async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.database = db.client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")


def get_database():
    return db.database


def get_sync_client():
    return MongoClient(settings.MONGODB_URI)


COLLECTIONS = {
    "locations": "locations",
    "weather_observations": "weather_observations",
    "sensor_readings": "sensor_readings",
    "citizen_reports": "citizen_reports",
    "risk_assessments": "risk_assessments",
    "vulnerability_assessments": "vulnerability_assessments",
    "priority_assessments": "priority_assessments",
    "actions": "actions",
}
