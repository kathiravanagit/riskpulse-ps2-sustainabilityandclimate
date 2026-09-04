# RiskPulse

RiskPulse is a hyperlocal climate-risk decision-support system for communities and response teams. It combines location data, weather observations, IoT water-level readings, citizen reports, risk scoring, ML predictions, and operational priorities in one web application.

The current implementation is a working flood-focused prototype with a multi-hazard assessment foundation. It supports Chennai monitoring locations and can run with local mock data or a MongoDB-backed FastAPI service.

## Repository Structure

```text
riskpulse/
|-- README.md
|-- .gitignore
|-- docs/
|   |-- architecture.md
|   `-- operations.md
|-- data/
|   `-- README.md
|-- backend/
|   |-- .env.example
|   |-- requirements.txt
|   |-- render.yaml
|   |-- app/
|   |   |-- main.py
|   |   |-- config.py
|   |   |-- api/
|   |   |   |-- locations.py
|   |   |   |   |-- weather.py
|   |   |   |   |-- sensors.py
|   |   |   |   |-- reports.py
|   |   |   |   |-- risk.py
|   |   |   |   |-- vulnerability.py
|   |   |   |   |-- priority.py
|   |   |   |   |-- actions.py
|   |   |   |   |-- simulation.py
|   |   |   |   |-- ml_predictions.py
|   |   |   |   |-- hazards.py
|   |   |   |   `-- resources.py
|   |   |   |-- db/
|   |   |   |-- models/
|   |   |   `-- services/
|   |   |-- models/
|   |   |   |-- train_ml_models.py
|   |   |   `-- trained_models/
|   |   |-- scripts/
|   |   |   |-- generate_synthetic_data.py
|   |   |   |-- seed_database.py
|   |   |   |-- import_historical_data.py
|   |   |   `-- simulate_flood_event.py
|   |   `-- tests/
|-- frontend/
|   |-- package.json
|   |-- public/
|   |   |-- favicon.svg
|   |   `-- sw.js
|   `-- src/
|       |-- App.jsx
|       |-- services/api.js
|       |-- contexts/AuthContext.jsx
|       |-- layouts/
|       |-- components/
|       |-- pages/
|       |   |-- Dashboard.jsx
|       |   |-- RiskMap.jsx
|       |   |-- Hazards.jsx
|       |   |-- MLPredictions.jsx
|       |   |-- PriorityQueue.jsx
|       |   |-- Sensors.jsx
|       |   |-- Reports.jsx
|       |   |-- Analytics.jsx
|       |   |-- Events.jsx
|       |   `-- Settings.jsx
|       |-- data/mockData.js
|       `-- styles/
`-- .git/
```

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- MongoDB 6 or a MongoDB Atlas database
- PowerShell on Windows, or an equivalent shell

## Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `MONGODB_URI`, `DATABASE_NAME`, and `CORS_ORIGINS` in `backend/.env`. To create the local administrator used by the login screen, also set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` to your own values, then seed the database:

```powershell
python scripts/generate_synthetic_data.py
python scripts/seed_database.py
python -m uvicorn app.main:app --reload --port 8000
```

Sign in with the bootstrap email and password from `backend/.env`. If those variables are omitted, no account is created; you can use the registration form to create a viewer account instead.

Backend URLs:

- API: <http://localhost:8000>
- Swagger docs: <http://localhost:8000/docs>
- Health: <http://localhost:8000/health>

## Frontend Setup

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend URL: <http://localhost:3000>

`frontend/.env` controls the data source:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

Use `VITE_USE_MOCK=true` when MongoDB or the backend is unavailable and you want the local demonstration data.

## Train Models

The current training pipeline creates a reproducible synthetic flood-risk dataset and saves model artifacts under `backend/models/trained_models/`.

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python models/train_ml_models.py
```

The backend loads these artifacts when it starts. The trained models are baseline decision-support models, not a substitute for validated hazard datasets.

## Checks

```powershell
cd frontend
npm run lint
npm run build

cd ..\backend
python -m compileall -q app models
pytest
```

## Current Scope

Implemented now:

- Location-based flood monitoring
- Weather, sensors, and citizen reports
- Risk, vulnerability, priority, and action calculations
- ML risk, water-level, flood-probability, and vulnerability predictions
- Multi-hazard assessment contract for six hazard types
- Open-Meteo weather synchronization
- Operational resource records and status updates
- Offline citizen-report queue with reconnect synchronization
- Responsive web dashboard and service-worker app-shell caching

Still requiring external integration:

- Production satellite, terrain, ocean, and hazard feeds
- Validated hazard-specific training datasets
- Real road routing and road-closure data
- SMS, radio, and telecom fallback providers
- Production identity, roles, permissions, audit logging, and monitoring

## Safety and Data Note

RiskPulse is decision-support software. It should display source, timestamp, confidence, and data-quality information for every recommendation. Production deployments need domain validation, incident-response procedures, privacy review, and clear human approval before issuing evacuation or emergency instructions.
