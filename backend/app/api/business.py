from fastapi import APIRouter, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.api.rate_limit import limiter
from app.schemas.business import BusinessCreate, BusinessOut, TranscribeRequest
from app.services.business_service import create_business, transcribe_and_extract, get_user_businesses, delete_business
from app.ai.whisper import transcribe_audio

router = APIRouter(prefix="/business", tags=["business"])


@router.post("/create", response_model=BusinessOut)
def create(
    data: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_business(db, current_user.id, data)


@router.post("/transcribe-audio")
@limiter.limit("10/hour")
async def transcribe_audio_endpoint(
    request: Request,
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()
    transcript = await transcribe_audio(audio_bytes, audio.filename or "audio.webm")
    result = await transcribe_and_extract(db, current_user.id, transcript)
    return result


@router.post("/transcribe")
@limiter.limit("20/hour")
async def transcribe_text(
    request: Request,
    data: TranscribeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await transcribe_and_extract(db, current_user.id, data.transcript)
    return result


@router.get("/list", response_model=list[BusinessOut])
def list_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_businesses(db, current_user.id)


@router.delete("/{business_id}")
def delete(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_business(db, business_id, current_user.id)
    return {"ok": True}
