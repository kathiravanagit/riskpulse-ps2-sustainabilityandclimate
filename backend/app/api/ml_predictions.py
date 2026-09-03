"""
RiskPulse ML Predictions API
Provides ML-based predictions for risk, flood probability, and water levels
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.db.mongodb import get_database
from app.services.ml_model_manager import ml_model_manager

logger = logging.getLogger("riskpulse.api.ml_predictions")
router = APIRouter(prefix="/ml", tags=["ml-predictions"])


class MLPredictionRequest(BaseModel):
    """Request for ML predictions"""
    location_id: str
    rainfall_mm: float = Field(ge=0, le=200)
    rainfall_intensity: float = Field(ge=0, le=100)
    forecast_rainfall_mm: float = Field(ge=0, le=200)
    water_level_cm: float = Field(ge=0, le=500)
    water_level_rate: float = Field(ge=-10, le=10)
    num_citizen_reports: int = Field(ge=0, le=100)
    avg_report_severity: float = Field(ge=0, le=5)
    humidity: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-10, le=50)
    wind_speed: float = Field(ge=0, le=100)
    hour_of_day: int = Field(ge=0, le=23)
    month: int = Field(ge=1, le=12)
    elevation: float = Field(ge=0, le=100)
    historical_flood_freq: float = Field(ge=0, le=1)
    population_density: int = Field(ge=0, le=500)
    road_vulnerability: float = Field(ge=0, le=1)


class MLPredictionResponse(BaseModel):
    """Response with ML predictions"""
    location_id: str
    predictions: Dict
    confidence: float
    predicted_at: datetime


@router.post("/predict", response_model=MLPredictionResponse)
async def predict_risk(request: MLPredictionRequest):
    """
    Run ML predictions for a specific location
    
    Returns:
    - Risk level and score
    - Water level prediction
    - Flood probability
    - Vulnerability score
    """
    if not ml_model_manager.models_loaded:
        raise HTTPException(
            status_code=503,
            detail="ML models not loaded. Please run training script first."
        )
    
    try:
        # Prepare features dict
        features = {
            "rainfall_mm": request.rainfall_mm,
            "rainfall_intensity": request.rainfall_intensity,
            "forecast_rainfall_mm": request.forecast_rainfall_mm,
            "water_level_cm": request.water_level_cm,
            "water_level_rate": request.water_level_rate,
            "num_citizen_reports": request.num_citizen_reports,
            "avg_report_severity": request.avg_report_severity,
            "humidity": request.humidity,
            "temperature": request.temperature,
            "wind_speed": request.wind_speed,
            "hour_of_day": request.hour_of_day,
            "month": request.month,
            "elevation": request.elevation,
            "historical_flood_freq": request.historical_flood_freq,
            "population_density": request.population_density,
            "road_vulnerability": request.road_vulnerability,
        }
        
        # Get predictions
        predictions = ml_model_manager.predict_all(features)
        
        if predictions is None:
            raise HTTPException(status_code=500, detail="Prediction failed")
        
        # Calculate overall confidence
        confidence = 0
        counts = 0
        if predictions.get("risk_level") and predictions["risk_level"].get("confidence"):
            confidence += predictions["risk_level"]["confidence"]
            counts += 1
        if predictions.get("flood_probability") and predictions["flood_probability"].get("flood_probability"):
            confidence += predictions["flood_probability"]["flood_probability"]
            counts += 1
        
        confidence = confidence / counts if counts > 0 else 0
        
        # Store prediction in database
        db = get_database()
        await db["ml_predictions"].insert_one({
            "location_id": request.location_id,
            "predictions": predictions,
            "confidence": confidence,
            "predicted_at": datetime.utcnow(),
            "request_data": request.model_dump(),
        })
        
        logger.info(f"ML prediction made for location {request.location_id}")
        
        return MLPredictionResponse(
            location_id=request.location_id,
            predictions=predictions,
            confidence=round(confidence, 2),
            predicted_at=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Error making prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predict/{location_id}")
async def predict_from_latest_data(location_id: str):
    """
    Make predictions using latest available data for a location
    """
    if not ml_model_manager.models_loaded:
        raise HTTPException(
            status_code=503,
            detail="ML models not loaded. Please run training script first."
        )
    
    try:
        db = get_database()
        
        # Get latest weather data
        weather = await db["weather_observations"].find_one(
            {"location_id": location_id},
            sort=[("timestamp", -1)]
        )
        
        # Get latest sensor data
        sensor = await db["sensor_readings"].find_one(
            {"location_id": location_id},
            sort=[("timestamp", -1)]
        )
        
        # Get latest citizen reports
        reports = []
        async for report in db["citizen_reports"].find(
            {"location_id": location_id}
        ).sort("timestamp", -1).limit(10):
            reports.append(report)
        
        # Get location data
        location = await db["locations"].find_one({"location_id": location_id})
        
        if not location:
            raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
        
        # Build features
        now = datetime.utcnow()
        avg_severity = sum(r.get("severity", 3) for r in reports) / len(reports) if reports else 0
        
        features = {
            "rainfall_mm": weather.get("rainfall_mm", 0) if weather else 0,
            "rainfall_intensity": weather.get("rainfall_intensity", 0) if weather else 0,
            "forecast_rainfall_mm": weather.get("forecast_rainfall_mm", 0) if weather else 0,
            "water_level_cm": sensor.get("water_level_cm", 0) if sensor else 0,
            "water_level_rate": sensor.get("water_level_rate_cm_per_hour", 0) if sensor else 0,
            "num_citizen_reports": len(reports),
            "avg_report_severity": float(avg_severity),
            "humidity": weather.get("humidity_percent", 50) if weather else 50,
            "temperature": weather.get("temperature_celsius", 25) if weather else 25,
            "wind_speed": weather.get("wind_speed_kmh", 0) if weather else 0,
            "hour_of_day": now.hour,
            "month": now.month,
            "elevation": location.get("elevation", 5),
            "historical_flood_freq": location.get("historical_flood_frequency", 0.5),
            "population_density": location.get("population_density", 80),
            "road_vulnerability": location.get("road_vulnerability", 0.7),
        }
        
        # Get predictions
        predictions = ml_model_manager.predict_all(features)
        
        if predictions is None:
            raise HTTPException(status_code=500, detail="Prediction failed")
        
        # Calculate confidence
        confidence = 0
        counts = 0
        if predictions.get("risk_level") and predictions["risk_level"].get("confidence"):
            confidence += predictions["risk_level"]["confidence"]
            counts += 1
        if predictions.get("flood_probability") and predictions["flood_probability"].get("flood_probability"):
            confidence += predictions["flood_probability"]["flood_probability"]
            counts += 1
        
        confidence = confidence / counts if counts > 0 else 0
        
        logger.info(f"ML prediction generated for location {location_id} using latest data")
        
        return {
            "location_id": location_id,
            "predictions": predictions,
            "confidence": round(confidence, 2),
            "predicted_at": datetime.utcnow(),
        }
    
    except Exception as e:
        logger.error(f"Error making prediction from latest data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/status")
async def get_model_status():
    """
    Get status of all loaded ML models
    """
    return ml_model_manager.get_model_status()


@router.get("/models/feature-importance")
async def get_feature_importance():
    """
    Get feature importance scores from the trained models
    """
    if not ml_model_manager.models_loaded or ml_model_manager.risk_level_classifier is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded"
        )
    
    try:
        feature_names = ml_model_manager.feature_names
        importances = ml_model_manager.risk_level_classifier.feature_importances_
        
        # Create ranking
        feature_importance = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            "model": "risk_level_classifier",
            "features": [
                {
                    "name": name,
                    "importance": round(float(importance), 4),
                    "importance_percent": round(float(importance) * 100, 2)
                }
                for name, importance in feature_importance
            ]
        }
    
    except Exception as e:
        logger.error(f"Error getting feature importance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions/location/{location_id}")
async def get_predictions_history(
    location_id: str,
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get recent ML predictions for a location
    """
    try:
        db = get_database()
        
        predictions = []
        async for doc in db["ml_predictions"].find(
            {"location_id": location_id}
        ).sort("predicted_at", -1).limit(limit):
            doc.pop("_id", None)
            predictions.append(doc)
        
        return {
            "location_id": location_id,
            "predictions": predictions,
            "count": len(predictions)
        }
    
    except Exception as e:
        logger.error(f"Error retrieving predictions history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
