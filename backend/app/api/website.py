from fastapi import APIRouter, Depends, File, UploadFile, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.api.rate_limit import limiter
from app.schemas.website import (
    WebsiteOut, WebsiteGenerateRequest, WebsiteEditRequest,
    DirectFieldUpdate, DirectProductUpdate, VisitCreate, AnalyticsResponse,
)
from app.services.website_service import (
    generate_website,
    get_website_by_slug,
    apply_edit,
    undo_last_edit,
    get_edit_history,
    publish_website,
    unpublish_website,
    update_website_field,
    update_product_direct,
    _get_website_or_404,
    record_visit,
    get_analytics,
    get_detailed_analytics,
    get_overview_analytics,
)
from app.services.upload_service import save_upload

router = APIRouter(prefix="/website", tags=["website"])


@router.get("/business/{business_id}", response_model=WebsiteOut)
def get_my_website(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WebsiteOut.model_validate(_get_website_or_404(db, business_id, current_user.id))


@router.post("/generate", response_model=WebsiteOut)
@limiter.limit("5/hour")
async def generate(
    request: Request,
    data: WebsiteGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await generate_website(db, data.business_id, current_user.id, data.template_id)


@router.post("/visit/{slug}")
def track_visit(slug: str, data: VisitCreate, request: Request, db: Session = Depends(get_db)):
    user_agent = request.headers.get("user-agent", "")
    record_visit(db, slug, data.referrer, user_agent)
    return {"ok": True}


@router.get("/analytics/overview")
def overview_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_overview_analytics(db, current_user.id)


@router.get("/analytics/{business_id}", response_model=AnalyticsResponse)
def analytics(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics(db, business_id, current_user.id)


@router.get("/analytics/{business_id}/detailed")
def detailed_analytics(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_detailed_analytics(db, business_id, current_user.id)


@router.post("/edit", response_model=WebsiteOut)
@limiter.limit("20/hour")
async def edit(
    request: Request,
    data: WebsiteEditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await apply_edit(db, data.business_id, current_user.id, data.instruction)


@router.patch("/field", response_model=WebsiteOut)
def update_field(
    data: DirectFieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_website_field(db, data.business_id, current_user.id, data.section, data.field, data.value)


@router.patch("/product", response_model=WebsiteOut)
async def update_product(
    data: DirectProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updates = {k: v for k, v in data.model_dump().items() if k not in ("business_id", "product_id")}
    return await update_product_direct(db, data.business_id, current_user.id, data.product_id, updates)


@router.post("/publish/{business_id}", response_model=WebsiteOut)
def publish(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publish_website(db, business_id, current_user.id)


@router.post("/unpublish/{business_id}", response_model=WebsiteOut)
def unpublish(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return unpublish_website(db, business_id, current_user.id)


@router.get("/history/{business_id}")
def edit_history(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_edit_history(db, business_id, current_user.id)


@router.post("/undo/{business_id}", response_model=WebsiteOut)
def undo_edit(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return undo_last_edit(db, business_id, current_user.id)


@router.post("/upload-image/{business_id}")
async def upload_image(
    request: Request,
    business_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_website_or_404(db, business_id, current_user.id)
    raw = await file.read()
    base_url = str(request.base_url).rstrip("/")
    url = save_upload(raw, file.filename or "image.jpg", base_url)
    return {"url": url}


# Keep catch-all GET last so specific routes above always match first
@router.get("/{slug}")
def get_site(slug: str, db: Session = Depends(get_db)):
    return get_website_by_slug(db, slug)
