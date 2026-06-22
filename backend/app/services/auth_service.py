from datetime import datetime, timedelta

from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserRegister, Token, UserOut
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def register_user(db: Session, data: UserRegister) -> Token:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))


def login_user(db: Session, email: str, password: str) -> Token:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id, user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))


def google_oauth_login(db: Session, email: str, name: str | None = None) -> Token:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        import secrets
        placeholder = hash_password(secrets.token_hex(32))
        user = User(email=email, password_hash=placeholder, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif name and not user.name:
        user.name = name
        db.commit()
        db.refresh(user)
    token = create_access_token(user.id, user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))
