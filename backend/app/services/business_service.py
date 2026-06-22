import re
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.business import Business
from app.models.product import Product
from app.schemas.business import BusinessCreate, BusinessOut, ExtractedBusiness
from app.ai.gpt import extract_business_data


def slugify(name: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", name.lower())
    slug = re.sub(r"[\s_]+", "-", slug).strip("-")
    return slug


def ensure_unique_slug(db: Session, base_slug: str) -> str:
    slug = base_slug
    while db.query(Business).filter(Business.slug == slug).first():
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
    return slug


def create_business(db: Session, user_id: int, data: BusinessCreate) -> BusinessOut:
    slug = ensure_unique_slug(db, slugify(data.name))
    business = Business(
        user_id=user_id,
        name=data.name,
        category=data.category,
        slug=slug,
        description=data.description,
        phone=data.phone,
        email=data.email,
        address=data.address,
        timings=data.timings,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessOut.model_validate(business)


async def transcribe_and_extract(db: Session, user_id: int, transcript: str) -> dict:
    extracted = await extract_business_data(transcript)
    description = extracted.get("description") or extracted.get("tagline")
    valid_categories = {"retail", "restaurant", "bakery", "salon", "clinic", "cafe", "hotel", "gym", "other"}
    raw_category = (extracted.get("category") or "").lower().strip()
    data = BusinessCreate(
        name=extracted.get("business_name") or "My Business",
        category=raw_category if raw_category in valid_categories else "other",
        description=description or None,
        phone=extracted.get("phone") or None,
        email=extracted.get("email") or None,
        address=extracted.get("address") or None,
        timings=extracted.get("timings") or None,
    )
    slug = ensure_unique_slug(db, slugify(data.name))
    business = Business(user_id=user_id, slug=slug, **data.model_dump())
    db.add(business)
    db.flush()

    for p in extracted.get("products") or []:
        product_name = (p.get("name") or "").strip()
        if not product_name:
            continue
        product = Product(
            business_id=business.id,
            name=product_name,
            description=p.get("description") or "",
            price=p.get("price") if isinstance(p.get("price"), (int, float)) else None,
        )
        db.add(product)

    db.commit()
    db.refresh(business)
    return {"business": BusinessOut.model_validate(business), "extracted": extracted}


def get_user_businesses(db: Session, user_id: int) -> list[BusinessOut]:
    businesses = db.query(Business).filter(Business.user_id == user_id).all()
    result = []
    for b in businesses:
        d = BusinessOut.model_validate(b).model_dump()
        d["is_published"] = b.website.is_published if b.website else None
        result.append(BusinessOut.model_validate(d))
    return result


def delete_business(db: Session, business_id: int, user_id: int) -> None:
    business = get_business_by_id(db, business_id, user_id)
    db.delete(business)
    db.commit()


def get_business_by_id(db: Session, business_id: int, user_id: int) -> Business:
    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business
