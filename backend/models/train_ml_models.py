"""
RiskPulse ML Model Training Script
Trains ensemble models for risk prediction, flood forecasting, and water level prediction
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import pickle
import logging
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, mean_squared_error, r2_score
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("riskpulse.ml_training")

# Create models directory
MODELS_DIR = Path(__file__).parent / "trained_models"
MODELS_DIR.mkdir(exist_ok=True)

# Locations data for feature engineering
LOCATIONS_DATA = {
    "LOC-VELACH-001": {
        "elevation": 4.5,
        "flood_frequency": 0.75,
        "population_density": 85,
        "road_vulnerability": 0.8,
    },
    "LOC-PALLIK-002": {
        "elevation": 3.0,
        "flood_frequency": 0.85,
        "population_density": 90,
        "road_vulnerability": 0.85,
    },
    "LOC-VYASAR-003": {
        "elevation": 5.0,
        "flood_frequency": 0.6,
        "population_density": 75,
        "road_vulnerability": 0.65,
    },
    "LOC-PERUMB-004": {
        "elevation": 3.5,
        "flood_frequency": 0.7,
        "population_density": 80,
        "road_vulnerability": 0.75,
    },
    "LOC-SEMME-005": {
        "elevation": 4.0,
        "flood_frequency": 0.65,
        "population_density": 70,
        "road_vulnerability": 0.7,
    },
}


def generate_synthetic_training_data(num_samples=2000):
    """Generate synthetic training data for model training"""
    logger.info(f"Generating {num_samples} synthetic training samples...")
    
    data = []
    locations = list(LOCATIONS_DATA.keys())
    
    for _ in range(num_samples):
        location_id = np.random.choice(locations)
        loc_data = LOCATIONS_DATA[location_id]
        
        # Feature generation
        rainfall_mm = np.random.gamma(shape=2, scale=5)  # Right-skewed
        rainfall_intensity = rainfall_mm / max(1, np.random.uniform(1, 6))
        forecast_rainfall = np.random.gamma(shape=2, scale=3)
        
        water_level_cm = np.random.gamma(shape=2, scale=8)
        water_level_rate = np.random.normal(loc=0, scale=1)
        
        num_reports = np.random.poisson(lam=2)
        avg_report_severity = np.random.uniform(2, 5) if num_reports > 0 else 0
        
        # Additional features
        humidity = np.random.uniform(40, 95)
        temperature = np.random.uniform(20, 35)
        wind_speed = np.random.exponential(scale=5)
        
        # Temporal features
        hour = np.random.randint(0, 24)
        month = np.random.randint(1, 13)
        
        # Engineer features
        elevation = loc_data["elevation"]
        historical_freq = loc_data["flood_frequency"]
        population_density = loc_data["population_density"]
        road_vuln = loc_data["road_vulnerability"]
        
        # Calculate risk score
        rainfall_score = min(100, (rainfall_mm + forecast_rainfall * 0.5) / 150 * 100)
        water_level_score = min(100, (water_level_cm / 100) * 100)
        elevation_score = max(0, 100 - (elevation / 10) * 100)
        historical_score = historical_freq * 100
        citizen_score = min(100, (num_reports / 10) * 50 + (avg_report_severity / 5) * 50)
        
        # Weighted risk score
        risk_score = (
            rainfall_score * 0.30 +
            water_level_score * 0.25 +
            elevation_score * 0.15 +
            historical_score * 0.20 +
            citizen_score * 0.10
        )
        risk_score = max(0, min(100, risk_score))
        
        # Determine risk level
        if risk_score < 30:
            risk_level = 0  # LOW
        elif risk_score < 50:
            risk_level = 1  # MODERATE
        elif risk_score < 75:
            risk_level = 2  # HIGH
        else:
            risk_level = 3  # CRITICAL
        
        data.append({
            # Input features
            "rainfall_mm": rainfall_mm,
            "rainfall_intensity": rainfall_intensity,
            "forecast_rainfall_mm": forecast_rainfall,
            "water_level_cm": water_level_cm,
            "water_level_rate": water_level_rate,
            "num_citizen_reports": num_reports,
            "avg_report_severity": avg_report_severity,
            "humidity": humidity,
            "temperature": temperature,
            "wind_speed": wind_speed,
            "hour_of_day": hour,
            "month": month,
            "elevation": elevation,
            "historical_flood_freq": historical_freq,
            "population_density": population_density,
            "road_vulnerability": road_vuln,
            # Targets
            "risk_score": risk_score,
            "risk_level": risk_level,
            "water_level_prediction": water_level_cm + water_level_rate * 2,
        })
    
    return pd.DataFrame(data)


def train_risk_level_classifier(X_train, y_train, X_test, y_test):
    """Train Random Forest classifier for risk level prediction"""
    logger.info("Training Risk Level Classifier...")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    
    logger.info(f"Risk Level Classifier - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "risk_level_classifier.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Risk level classifier saved to {model_path}")
    
    return model


def train_risk_score_regressor(X_train, y_train, X_test, y_test):
    """Train Gradient Boosting regressor for continuous risk score prediction"""
    logger.info("Training Risk Score Regressor...")
    
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"Risk Score Regressor - RMSE: {rmse:.4f}, R²: {r2:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "risk_score_regressor.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Risk score regressor saved to {model_path}")
    
    return model


def train_water_level_predictor(X_train, y_train, X_test, y_test):
    """Train model for water level prediction"""
    logger.info("Training Water Level Predictor...")
    
    model = GradientBoostingRegressor(
        n_estimators=80,
        learning_rate=0.1,
        max_depth=4,
        min_samples_split=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"Water Level Predictor - RMSE: {rmse:.4f}, R²: {r2:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "water_level_predictor.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Water level predictor saved to {model_path}")
    
    return model


def train_flood_probability_classifier(X_train, y_train_binary, X_test, y_test_binary):
    """Train classifier for flood probability (binary classification)"""
    logger.info("Training Flood Probability Classifier...")
    
    model = RandomForestClassifier(
        n_estimators=80,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    
    model.fit(X_train, y_train_binary)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test_binary, y_pred)
    precision = precision_score(y_test_binary, y_pred, zero_division=0)
    recall = recall_score(y_test_binary, y_pred, zero_division=0)
    
    logger.info(f"Flood Probability - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "flood_probability_classifier.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Flood probability classifier saved to {model_path}")
    
    return model


def train_vulnerability_predictor(X_train, y_train, X_test, y_test):
    """Train model for vulnerability score prediction"""
    logger.info("Training Vulnerability Predictor...")
    
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"Vulnerability Predictor - RMSE: {rmse:.4f}, R²: {r2:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "vulnerability_predictor.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Vulnerability predictor saved to {model_path}")
    
    return model


def save_scaler(scaler, name):
    """Save the scaler for use in production"""
    scaler_path = MODELS_DIR / f"{name}_scaler.pkl"
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    logger.info(f"Scaler saved to {scaler_path}")


def save_feature_names(feature_names):
    """Save feature names for consistency"""
    features_path = MODELS_DIR / "feature_names.pkl"
    with open(features_path, 'wb') as f:
        pickle.dump(feature_names, f)
    logger.info(f"Feature names saved to {features_path}")


def main():
    """Main training pipeline"""
    logger.info("=" * 60)
    logger.info("RiskPulse ML Model Training Pipeline")
    logger.info("=" * 60)
    
    # Generate training data
    df = generate_synthetic_training_data(num_samples=2000)
    logger.info(f"Generated dataset shape: {df.shape}")
    logger.info(f"\nDataset statistics:\n{df.describe()}")
    
    # Prepare features and targets
    feature_columns = [
        "rainfall_mm", "rainfall_intensity", "forecast_rainfall_mm",
        "water_level_cm", "water_level_rate", "num_citizen_reports",
        "avg_report_severity", "humidity", "temperature", "wind_speed",
        "hour_of_day", "month", "elevation", "historical_flood_freq",
        "population_density", "road_vulnerability"
    ]
    
    X = df[feature_columns]
    y_risk_level = df["risk_level"]
    y_risk_score = df["risk_score"]
    y_water_level = df["water_level_prediction"]
    y_flood_binary = (df["risk_score"] >= 50).astype(int)  # Binary: flood or not
    
    # Create vulnerability scores
    y_vulnerability = (
        (1 - X["elevation"] / 10) * 0.3 +
        X["population_density"] / 100 * 0.3 +
        X["road_vulnerability"] * 0.2 +
        X["historical_flood_freq"] * 0.2
    ) * 100
    y_vulnerability = np.clip(y_vulnerability, 0, 100)
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    save_scaler(scaler, "features")
    save_feature_names(feature_columns)
    
    # Split data
    split_seed = 42
    X_train, X_test, y_train_level, y_test_level = train_test_split(
        X_scaled, y_risk_level, test_size=0.2, random_state=split_seed
    )
    _, _, y_train_score, y_test_score = train_test_split(
        X_scaled, y_risk_score, test_size=0.2, random_state=split_seed
    )
    _, _, y_train_water, y_test_water = train_test_split(
        X_scaled, y_water_level, test_size=0.2, random_state=split_seed
    )
    _, _, y_train_flood, y_test_flood = train_test_split(
        X_scaled, y_flood_binary, test_size=0.2, random_state=split_seed
    )
    _, _, y_train_vuln, y_test_vuln = train_test_split(
        X_scaled, y_vulnerability, test_size=0.2, random_state=split_seed
    )
    
    logger.info(f"\nTrain/test split: {len(X_train)} / {len(X_test)}")
    
    # Train models
    logger.info("\n" + "=" * 60)
    logger.info("Training ML Models...")
    logger.info("=" * 60)
    
    model_risk_level = train_risk_level_classifier(X_train, y_train_level, X_test, y_test_level)
    model_risk_score = train_risk_score_regressor(X_train, y_train_score, X_test, y_test_score)
    model_water_level = train_water_level_predictor(X_train, y_train_water, X_test, y_test_water)
    model_flood_prob = train_flood_probability_classifier(X_train, y_train_flood, X_test, y_test_flood)
    model_vulnerability = train_vulnerability_predictor(X_train, y_train_vuln, X_test, y_test_vuln)
    
    logger.info("\n" + "=" * 60)
    logger.info("Model Training Complete!")
    logger.info(f"Models saved to: {MODELS_DIR}")
    logger.info("=" * 60)
    
    # Feature importance analysis
    logger.info("\nTop Feature Importances (Risk Level Classifier):")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model_risk_level.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")


if __name__ == "__main__":
    main()
