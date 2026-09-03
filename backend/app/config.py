import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "riskpulse")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
    SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "RISKPULSE")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "")
    RADIO_WEBHOOK_URL: str = os.getenv("RADIO_WEBHOOK_URL", "")
    AUTH_SECRET: str = os.getenv("AUTH_SECRET", "change-this-secret")
    AUTH_TOKEN_TTL_SECONDS: int = int(os.getenv("AUTH_TOKEN_TTL_SECONDS", "3600"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    RISK_WEIGHT_RAINFALL: float = 0.25
    RISK_WEIGHT_WATER_LEVEL: float = 0.25
    RISK_WEIGHT_ELEVATION: float = 0.15
    RISK_WEIGHT_HISTORICAL: float = 0.20
    RISK_WEIGHT_CITIZEN: float = 0.15

    RISK_THRESHOLD_LOW: int = 25
    RISK_THRESHOLD_MODERATE: int = 50
    RISK_THRESHOLD_HIGH: int = 75

    PRIORITY_WEIGHT_RISK: float = 0.6
    PRIORITY_WEIGHT_VULNERABILITY: float = 0.4

    RELIABILITY_OFFICIAL_WEATHER: float = 0.95
    RELIABILITY_VERIFIED_SENSOR: float = 0.90
    RELIABILITY_UNVERIFIED_SENSOR: float = 0.70
    RELIABILITY_VERIFIED_CITIZEN: float = 0.75
    RELIABILITY_UNVERIFIED_CITIZEN: float = 0.50
    RELIABILITY_SYNTHETIC: float = 0.60

    RECENCY_HALF_LIFE_HOURS: float = 6.0


settings = Settings()
