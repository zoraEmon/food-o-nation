from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import charts
import os

app = FastAPI(title="Food-O-Nation Analytics")

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

app.include_router(charts.router, prefix="/charts", tags=["charts"])


@app.get("/health")
async def health():
    return {"status": "ok"}
