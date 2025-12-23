# Analytics service (FastAPI)

This service provides analytics endpoints and Plotly chart payloads for the Food-O-Nation admin dashboard.

Quick start (local):

1. Create a `.env` file and set `DATABASE_URL` to your NeonDB (or other Postgres) connection string. Do NOT commit this file; it should remain local and secret. See the backend Prisma schema (`backend/prisma/schema.prisma`) for table/field references.
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
- POST /collect  (collect a page visit) -- payload: { clientId?: string, path: string, referrer?: string, userId?: string }

Notes:
- The service will create a `page_visits` table on startup if the DB is available. If there is no `DATABASE_URL` set, the service falls back to demo data for page visit charts.
- Page visits aggregation returns totals per day and an optional `byPath` breakdown for the same date range.
Notes:
- Endpoints return a Plotly figure JSON under `figure` and data under `data`.
- For production, use a read-only DB user and consider materialized views or pre-aggregation.
