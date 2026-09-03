from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.db.mongodb import get_database
from app.models.report import CitizenReport, CitizenReportCreate, CitizenReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{location_id}", response_model=List[CitizenReportResponse])
async def get_reports(location_id: str, limit: int = 20):
    db = get_database()
    cursor = db["citizen_reports"].find(
        {"location_id": location_id}
    ).sort("timestamp", -1).limit(limit)
    reports = []
    async for doc in cursor:
        doc.pop("_id", None)
        reports.append(CitizenReportResponse(**doc))
    return reports


@router.post("", response_model=CitizenReportResponse, status_code=201)
async def create_citizen_report(data: CitizenReportCreate):
    db = get_database()
    source_reliability = 0.75 if data.verified else 0.50
    report = CitizenReport(
        report_id=str(uuid.uuid4()),
        location_id=data.location_id,
        timestamp=datetime.utcnow(),
        report_type=data.report_type,
        water_depth_cm=data.water_depth_cm,
        severity=data.severity,
        verified=data.verified,
        source_reliability=source_reliability,
        description=data.description,
        source_type=data.source_type,
    )
    await db["citizen_reports"].insert_one(report.model_dump())
    return report
