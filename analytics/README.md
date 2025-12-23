# Analytics service (FastAPI)

This service provides analytics endpoints and Plotly chart payloads for the Food-O-Nation admin dashboard.

Quick start (local):

1. Copy .env.example to .env and set DATABASE_URL with a read-only DB user.
2. Build and run locally:
   - python -m venv .venv && . .venv/bin/activate
   - pip install -r requirements.txt
   - uvicorn app.main:app --reload --port 8000

Or via Docker:

  docker compose up --build

Endpoints:
- GET /health
- GET /charts/donation-flow?year=2025
- GET /charts/donor-activity?limit=10
- GET /charts/page-visits?start=2025-11-01&end=2025-11-30

Notes:
- Endpoints return a Plotly figure JSON under `figure` and data under `data`.
- For production, use a read-only DB user and consider materialized views or pre-aggregation.
