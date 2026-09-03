import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from contextlib import asynccontextmanager
from app.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.indexes import create_indexes
from app.api import (
    locations,
    weather,
    sensors,
    reports,
    risk,
    vulnerability,
    priority,
    actions,
    simulation,
    ml_predictions,
    hazards,
    resources,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("riskpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RiskPulse API v1.0.0")
    try:
        await connect_to_mongo()
        logger.info("MongoDB connected")
        await create_indexes()
        logger.info("Database indexes created")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    yield
    logger.info("Shutting down RiskPulse API")
    await close_mongo_connection()
    logger.info("MongoDB connection closed")


app = FastAPI(
    title="RiskPulse API",
    description="Hyperlocal Climate Risk-to-Action Decision-Support System for Chennai Urban Floods",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


app.include_router(locations.router)
app.include_router(weather.router)
app.include_router(sensors.router)
app.include_router(reports.router)
app.include_router(risk.router)
app.include_router(vulnerability.router)
app.include_router(priority.router)
app.include_router(actions.router)
app.include_router(simulation.router)
app.include_router(ml_predictions.router)
app.include_router(hazards.router)
app.include_router(resources.router)


@app.get("/")
async def api_root():
    return {
        "service": "riskpulse-backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(
        content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0a0e27"/><path d="M32 10 12 20l20 10 20-10L32 10Zm-20 22 20 10 20-10M12 44l20 10 20-10" fill="none" stroke="#60a5fa" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        media_type="image/svg+xml",
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "riskpulse-backend", "version": "1.0.0"}
