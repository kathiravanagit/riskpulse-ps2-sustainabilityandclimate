"""
RiskPulse ML Model Manager
Loads and manages trained ML models for predictions
"""

import os
import pickle
import numpy as np
import logging
from pathlib import Path
from typing import Optional, Dict, List
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("riskpulse.ml_manager")

MODELS_DIR = Path(__file__).resolve().parents[2] / "models" / "trained_models"


class MLModelManager:
    """Manages loading and inference for trained ML models"""
    
    def __init__(self):
        self.risk_level_classifier = None
        self.risk_score_regressor = None
        self.water_level_predictor = None
        self.flood_probability_classifier = None
        self.vulnerability_predictor = None
        self.scaler = None
        self.feature_names = None
        self.models_loaded = False
        self.load_models()
    
    def load_models(self):
        """Load all trained models from disk"""
        try:
            # Load scaler
            scaler_path = MODELS_DIR / "features_scaler.pkl"
            if scaler_path.exists():
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info(f"Loaded scaler from {scaler_path}")
            
            # Load feature names
            features_path = MODELS_DIR / "feature_names.pkl"
            if features_path.exists():
                with open(features_path, 'rb') as f:
                    self.feature_names = pickle.load(f)
                logger.info(f"Loaded feature names: {len(self.feature_names)} features")
            
            # Load risk level classifier
            model_path = MODELS_DIR / "risk_level_classifier.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.risk_level_classifier = pickle.load(f)
                logger.info("Loaded risk level classifier")
            
            # Load risk score regressor
            model_path = MODELS_DIR / "risk_score_regressor.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.risk_score_regressor = pickle.load(f)
                logger.info("Loaded risk score regressor")
            
            # Load water level predictor
            model_path = MODELS_DIR / "water_level_predictor.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.water_level_predictor = pickle.load(f)
                logger.info("Loaded water level predictor")
            
            # Load flood probability classifier
            model_path = MODELS_DIR / "flood_probability_classifier.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.flood_probability_classifier = pickle.load(f)
                logger.info("Loaded flood probability classifier")
            
            # Load vulnerability predictor
            model_path = MODELS_DIR / "vulnerability_predictor.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.vulnerability_predictor = pickle.load(f)
                logger.info("Loaded vulnerability predictor")
            
            self.models_loaded = (
                self.risk_level_classifier is not None and
                self.risk_score_regressor is not None and
                self.water_level_predictor is not None
            )
            
            if self.models_loaded:
                logger.info("✓ All ML models loaded successfully")
            else:
                logger.warning("⚠ Some models failed to load")
        
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False
    
    def prepare_features(self, features: Dict[str, float]) -> Optional[np.ndarray]:
        """Prepare features in the correct order for model inference"""
        if self.feature_names is None:
            logger.error("Feature names not loaded")
            return None
        
        try:
            # Create feature array in correct order
            feature_vector = np.array([features.get(name, 0.0) for name in self.feature_names])
            
            # Scale features
            if self.scaler is not None:
                feature_vector = self.scaler.transform([feature_vector])[0]
            
            return feature_vector.reshape(1, -1)
        
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            return None
    
    def predict_risk_level(self, features: Dict[str, float]) -> Optional[Dict]:
        """Predict risk level (0=LOW, 1=MODERATE, 2=HIGH, 3=CRITICAL)"""
        if not self.models_loaded or self.risk_level_classifier is None:
            logger.warning("Risk level classifier not available")
            return None
        
        try:
            X = self.prepare_features(features)
            if X is None:
                return None
            
            # Predict
            prediction = self.risk_level_classifier.predict(X)[0]
            probabilities = self.risk_level_classifier.predict_proba(X)[0]
            confidence = float(np.max(probabilities))
            
            risk_levels = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
            
            return {
                "risk_level": risk_levels[int(prediction)],
                "risk_level_code": int(prediction),
                "confidence": round(confidence * 100, 2),
                "probabilities": {
                    level: round(float(prob) * 100, 2)
                    for level, prob in zip(risk_levels, probabilities)
                }
            }
        
        except Exception as e:
            logger.error(f"Error predicting risk level: {e}")
            return None
    
    def predict_risk_score(self, features: Dict[str, float]) -> Optional[float]:
        """Predict continuous risk score (0-100)"""
        if not self.models_loaded or self.risk_score_regressor is None:
            logger.warning("Risk score regressor not available")
            return None
        
        try:
            X = self.prepare_features(features)
            if X is None:
                return None
            
            prediction = self.risk_score_regressor.predict(X)[0]
            # Clip to valid range
            return round(float(np.clip(prediction, 0, 100)), 2)
        
        except Exception as e:
            logger.error(f"Error predicting risk score: {e}")
            return None
    
    def predict_water_level(self, features: Dict[str, float]) -> Optional[float]:
        """Predict future water level"""
        if not self.models_loaded or self.water_level_predictor is None:
            logger.warning("Water level predictor not available")
            return None
        
        try:
            X = self.prepare_features(features)
            if X is None:
                return None
            
            prediction = self.water_level_predictor.predict(X)[0]
            return round(float(max(0, prediction)), 2)
        
        except Exception as e:
            logger.error(f"Error predicting water level: {e}")
            return None
    
    def predict_flood_probability(self, features: Dict[str, float]) -> Optional[Dict]:
        """Predict flood probability"""
        if not self.models_loaded or self.flood_probability_classifier is None:
            logger.warning("Flood probability classifier not available")
            return None
        
        try:
            X = self.prepare_features(features)
            if X is None:
                return None
            
            prediction = self.flood_probability_classifier.predict(X)[0]
            probabilities = self.flood_probability_classifier.predict_proba(X)[0]
            
            return {
                "will_flood": bool(prediction),
                "flood_probability": round(float(probabilities[1]) * 100, 2),
                "no_flood_probability": round(float(probabilities[0]) * 100, 2),
            }
        
        except Exception as e:
            logger.error(f"Error predicting flood probability: {e}")
            return None
    
    def predict_vulnerability_score(self, features: Dict[str, float]) -> Optional[float]:
        """Predict vulnerability score"""
        if not self.models_loaded or self.vulnerability_predictor is None:
            logger.warning("Vulnerability predictor not available")
            return None
        
        try:
            X = self.prepare_features(features)
            if X is None:
                return None
            
            prediction = self.vulnerability_predictor.predict(X)[0]
            return round(float(np.clip(prediction, 0, 100)), 2)
        
        except Exception as e:
            logger.error(f"Error predicting vulnerability score: {e}")
            return None
    
    def predict_all(self, features: Dict[str, float]) -> Optional[Dict]:
        """Run all predictions at once"""
        if not self.models_loaded:
            logger.warning("ML models not loaded")
            return None
        
        try:
            return {
                "risk_level": self.predict_risk_level(features),
                "risk_score": self.predict_risk_score(features),
                "water_level_prediction": self.predict_water_level(features),
                "flood_probability": self.predict_flood_probability(features),
                "vulnerability_score": self.predict_vulnerability_score(features),
            }
        
        except Exception as e:
            logger.error(f"Error in predict_all: {e}")
            return None
    
    def get_model_status(self) -> Dict:
        """Get status of all models"""
        return {
            "models_loaded": self.models_loaded,
            "risk_level_classifier": self.risk_level_classifier is not None,
            "risk_score_regressor": self.risk_score_regressor is not None,
            "water_level_predictor": self.water_level_predictor is not None,
            "flood_probability_classifier": self.flood_probability_classifier is not None,
            "vulnerability_predictor": self.vulnerability_predictor is not None,
            "scaler_loaded": self.scaler is not None,
            "features_count": len(self.feature_names) if self.feature_names else 0,
        }


# Global instance
ml_model_manager = MLModelManager()
