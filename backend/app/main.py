import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from loguru import logger

from app.config import settings
from app.database.connection import Base, engine
from app.api.auth import router as auth_router
from app.api.business import router as business_router
from app.api.website import router as website_router
from app.api.rate_limit import limiter
import app.models  # ensure all models are registered

# ── Dirs must exist before app.mount and log file sink ───────────────────────
Path("logs").mkdir(exist_ok=True)
Path("static/uploads").mkdir(parents=True, exist_ok=True)
logger.remove()
logger.add(sys.stderr, level="INFO", format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}")
logger.add("logs/app.log", rotation="10 MB", retention="30 days", level="INFO", enqueue=True)


def _migrate():
    migrations = [
        ("website_visits", "device_type",    "VARCHAR(20)"),
        ("website_visits", "referrer_source", "VARCHAR(100)"),
        ("users",          "name",            "VARCHAR(255)"),
        ("websites",       "edit_history",    "JSONB DEFAULT '[]'::jsonb"),
    ]
    with engine.connect() as conn:
        for table, col, coltype in migrations:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {coltype}"))
                conn.commit()
            except Exception as exc:
                conn.rollback()
                logger.warning(f"Migration skipped ({table}.{col}): {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate()
    yield


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SiteForge AI API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(business_router)
app.include_router(website_router)


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except Exception as exc:
        logger.error(f"Health check DB failure: {exc}")
        return JSONResponse(status_code=503, content={"status": "degraded", "db": "unreachable"})


@app.get("/cors-check")
def cors_check():
    return {"allowed_origins": settings.allowed_origins}
