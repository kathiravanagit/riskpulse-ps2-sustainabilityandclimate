from datetime import datetime
from uuid import uuid4
import httpx
from fastapi import APIRouter, Depends
from app.config import settings
from app.db.mongodb import get_database
from app.models.alert import AlertRequest, AlertResponse
from app.api.auth import current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])


async def _send_sms(message: str, recipients: list[str]) -> str:
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_FROM_NUMBER or not recipients:
        return "not_configured"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    async with httpx.AsyncClient(timeout=10) as client:
        for number in recipients:
            response = await client.post(url, data={"From": settings.TWILIO_FROM_NUMBER, "To": number, "Body": message}, auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN))
            response.raise_for_status()
    return "sent"


@router.post("", response_model=AlertResponse, status_code=201)
async def create_alert(request: AlertRequest, user=Depends(current_user)):
    sms_status = await _send_sms(request.message, request.recipients) if "residents" in request.audiences else "not_requested"
    radio_status = "not_configured"
    if "rescue_teams" in request.audiences and settings.RADIO_WEBHOOK_URL:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(settings.RADIO_WEBHOOK_URL, json={"title": request.title, "message": request.message, "location_id": request.location_id})
            response.raise_for_status()
        radio_status = "sent"
    alert = AlertResponse(alert_id=f"ALT-{uuid4().hex[:12].upper()}", title=request.title, message=request.message, severity=request.severity, location_id=request.location_id, audiences=request.audiences, channels={"sms": sms_status, "radio": radio_status, "website": "recorded"}, created_at=datetime.utcnow())
    await get_database()["alerts"].insert_one(alert.model_dump())
    return alert