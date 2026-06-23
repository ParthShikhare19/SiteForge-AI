from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import jwt, JWTError

from app.config import settings


def _user_or_ip(request: Request) -> str:
    """Key by authenticated user ID; fall back to IP for unauthenticated requests."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            payload = jwt.decode(
                auth[7:], settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            uid = payload.get("sub")
            if uid:
                return f"user:{uid}"
        except JWTError:
            pass
    return f"ip:{get_remote_address(request)}"


def _make_limiter() -> Limiter:
    if settings.REDIS_URL:
        try:
            import redis as _redis
            r = _redis.from_url(settings.REDIS_URL, socket_connect_timeout=3)
            r.ping()
            r.close()
            return Limiter(key_func=_user_or_ip, storage_uri=settings.REDIS_URL)
        except Exception as exc:
            import logging
            logging.warning(f"Redis unreachable, falling back to in-memory rate limiting: {exc}")
    return Limiter(key_func=_user_or_ip)


limiter = _make_limiter()
