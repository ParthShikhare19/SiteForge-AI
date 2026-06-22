import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings


def _make_engine():
    url = settings.DATABASE_URL
    parsed = urllib.parse.urlparse(url)
    params = dict(urllib.parse.parse_qsl(parsed.query))

    connect_args: dict = {}
    sslmode = params.pop("sslmode", None)
    if sslmode:
        connect_args["sslmode"] = sslmode
    # channel_binding is a libpq param psycopg2 accepts via connect_args, not URL
    channel_binding = params.pop("channel_binding", None)
    if channel_binding:
        connect_args["channel_binding"] = channel_binding

    clean_query = urllib.parse.urlencode(params)
    clean_url = parsed._replace(query=clean_query).geturl()

    return create_engine(
        clean_url,
        connect_args=connect_args,
        pool_pre_ping=True,   # detect dropped Neon connections
        pool_size=5,
        max_overflow=10,
    )


engine = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
