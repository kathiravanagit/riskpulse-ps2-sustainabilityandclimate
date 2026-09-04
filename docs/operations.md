# Operations Guide

## Start Locally

Run MongoDB first, then start the API and frontend in separate terminals:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm run dev
```

## Configuration

Backend configuration lives in `backend/.env`. Never commit credentials. Frontend configuration lives in `frontend/.env` and should point to the API that is serving the current environment.

Important frontend variables:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

For a local administrator account, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` in `backend/.env`, then run `python scripts/seed_database.py`. The seed command creates that account only if it does not already exist. Do not commit the password.

## Data Recovery

If a report cannot be submitted, the browser keeps it in the `riskpulse_offline_reports` local-storage queue. The queue is retried on the browser `online` event. Operators should still verify that queued reports reached the API before treating them as authoritative.

## Deployment Checks

1. Confirm MongoDB connectivity.
2. Run the model training pipeline or deploy the expected artifacts.
3. Run backend compilation and tests.
4. Run frontend lint and build.
5. Verify `/health`, `/docs`, `/hazards/{location_id}`, and `/weather/sync/{location_id}`.
6. Confirm CORS includes only trusted frontend origins.
7. Confirm provider credentials and rate limits before enabling live ingestion.
