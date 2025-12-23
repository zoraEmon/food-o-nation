from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import charts
import os

import logging

app = FastAPI(title="Food-O-Nation Analytics")
logger = logging.getLogger("analytics")

# Allow local frontend to access endpoints; in prod set explicit origins
origins = os.getenv('ANALYTICS_ALLOW_ORIGINS', '*')
if origins == '*':
    allow_origins = ['*']
else:
    allow_origins = [o.strip() for o in origins.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _startup_logs():
    logger.info(f"Analytics service starting; allowing origins: {allow_origins}")
    logger.info("Check /health for service status")
    # Ensure page_visits table exists for collecting page visit telemetry
    try:
        from app.services import db
        await db.execute('''
        CREATE TABLE IF NOT EXISTS page_visits (
            id BIGSERIAL PRIMARY KEY,
            client_id TEXT UNIQUE,
            path TEXT NOT NULL,
            referrer TEXT,
            user_id UUID,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits (created_at);
        CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits (path);
        ''')
        logger.info("Ensured page_visits table exists")
    except Exception as e:
        logger.warning("Failed to create/verify page_visits table: %s", e)

app.include_router(charts.router, prefix="/charts", tags=["charts"])


@app.get("/health")
async def health():
    return {"status": "ok"}
