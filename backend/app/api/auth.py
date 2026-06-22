import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.user import UserRegister, UserLogin, Token
from app.services.auth_service import register_user, login_user, google_oauth_login
from app.api.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleTokenRequest(BaseModel):
    access_token: str


@router.post("/register", response_model=Token)
@limiter.limit("10/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, data)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, data.email, data.password)


@router.post("/google/token", response_model=Token)
@limiter.limit("20/minute")
async def google_token_login(request: Request, data: GoogleTokenRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {data.access_token}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    info = resp.json()
    email = info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")
    name = info.get("name") or info.get("given_name")
    return google_oauth_login(db, email, name=name)
