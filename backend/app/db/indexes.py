from pymongo import ASCENDING, DESCENDING, IndexModel
from app.db.mongodb import get_database


async def create_indexes():
    database = get_database()

    await database["locations"].create_indexes([
        IndexModel([("location_id", ASCENDING)], unique=True),
        IndexModel([("ward", ASCENDING)]),
    ])

    await database["weather_observations"].create_indexes([
        IndexModel([("observation_id", ASCENDING)], unique=True),
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("timestamp", DESCENDING)]),
        IndexModel([("location_id", ASCENDING), ("timestamp", DESCENDING)]),
    ])

    await database["sensor_readings"].create_indexes([
        IndexModel([("sensor_id", ASCENDING)]),
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("timestamp", DESCENDING)]),
        IndexModel([("location_id", ASCENDING), ("timestamp", DESCENDING)]),
    ])

    await database["citizen_reports"].create_indexes([
        IndexModel([("report_id", ASCENDING)], unique=True),
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("timestamp", DESCENDING)]),
        IndexModel([("location_id", ASCENDING), ("timestamp", DESCENDING)]),
    ])

    await database["risk_assessments"].create_indexes([
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("risk_level", ASCENDING)]),
        IndexModel([("calculated_at", DESCENDING)]),
        IndexModel([("location_id", ASCENDING), ("calculated_at", DESCENDING)]),
    ])

    await database["vulnerability_assessments"].create_indexes([
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("vulnerability_level", ASCENDING)]),
    ])

    await database["priority_assessments"].create_indexes([
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("priority_score", DESCENDING)]),
        IndexModel([("rank", ASCENDING)]),
    ])

    await database["actions"].create_indexes([
        IndexModel([("location_id", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
    ])

    print("MongoDB indexes created successfully")
