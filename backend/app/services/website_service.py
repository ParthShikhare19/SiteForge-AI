import asyncio
import copy
import re
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import func as sqlfunc, case, extract
from sqlalchemy.orm import Session
from fastapi import HTTPException
from loguru import logger

from app.models.business import Business
from app.models.website import Website
from app.models.product import Product
from app.models.analytics import WebsiteVisit
from app.schemas.website import WebsiteOut, WebsiteJSON, HeroSection, AboutSection, ContactSection, ProductItem, Feature, Testimonial, Social, AnalyticsResponse, VisitDay
from app.ai.gpt import parse_edit_instruction

TEMPLATE_IDS = {"retail", "restaurant", "bakery"}

HERO_IMAGES = {
    "retail":     "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80",
    "restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80",
    "bakery":     "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1920&q=80",
    "salon":      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
    "clinic":     "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1920&q=80",
    "cafe":       "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80",
    "other":      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
}

CATEGORY_TO_TEMPLATE = {
    "retail": "retail",
    "restaurant": "restaurant",
    "bakery": "bakery",
    "salon": "retail",
    "clinic": "retail",
    "dental": "retail",
    "cafe": "restaurant",
    "hotel": "restaurant",
    "gym": "retail",
    "other": "retail",
}

CATEGORY_DEFAULTS = {
    "retail": {
        "theme_color": "#312e81", "accent_color": "#7c3aed",
        "badge": "Open Now", "cta_secondary": "Explore Products",
        "products_title": "Featured Products", "products_subtitle": "Our Collection",
        "highlights": ["Wide range of quality products", "Competitive & transparent pricing", "Trusted by thousands of customers", "Easy returns & after-sales support"],
        "features": [
            {"id": "f1", "icon": "shield", "title": "Quality Assured", "description": "Every product is carefully inspected"},
            {"id": "f2", "icon": "truck", "title": "Fast Delivery", "description": "Same-day & next-day delivery available"},
            {"id": "f3", "icon": "refresh", "title": "Easy Returns", "description": "Hassle-free 7-day return policy"},
            {"id": "f4", "icon": "tag", "title": "Best Prices", "description": "Price match guarantee on all items"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Priya Sharma", "text": "Excellent quality products and outstanding service. I've been a loyal customer for years!", "rating": 5, "role": "Regular Customer"},
            {"id": "t2", "name": "Rahul Mehta", "text": "Great prices and fast delivery. The team is very helpful and professional.", "rating": 5, "role": "Verified Buyer"},
            {"id": "t3", "name": "Anita Kulkarni", "text": "Best store in the area. Always find what I need and the staff is very knowledgeable.", "rating": 5, "role": "Loyal Customer"},
        ],
    },
    "restaurant": {
        "theme_color": "#1c1917", "accent_color": "#d97706",
        "badge": "Now Open", "cta_secondary": "View Menu",
        "products_title": "Our Menu", "products_subtitle": "Menu Highlights",
        "highlights": ["Fresh ingredients sourced daily", "Authentic recipes passed down generations", "Warm and welcoming ambiance", "Experienced chefs with culinary expertise"],
        "features": [
            {"id": "f1", "icon": "flame", "title": "Expert Chefs", "description": "Seasoned culinary professionals at work"},
            {"id": "f2", "icon": "leaf", "title": "Fresh Daily", "description": "Ingredients sourced fresh every morning"},
            {"id": "f3", "icon": "star", "title": "Top Rated", "description": "Consistently 5-star reviews"},
            {"id": "f4", "icon": "clock", "title": "Quick Service", "description": "Served hot and on time, always"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Vikram Patel", "text": "Absolutely divine food! The flavors are authentic and the service is impeccable. My favorite restaurant!", "rating": 5, "role": "Food Enthusiast"},
            {"id": "t2", "name": "Meera Reddy", "text": "We celebrate every special occasion here. The food and ambiance are consistently wonderful.", "rating": 5, "role": "Regular Diner"},
            {"id": "t3", "name": "Arjun Tiwari", "text": "Exceptional dining experience from start to finish. The biryani is the best I've ever had!", "rating": 5, "role": "Happy Customer"},
        ],
    },
    "bakery": {
        "theme_color": "#be185d", "accent_color": "#f59e0b",
        "badge": "Fresh Today", "cta_secondary": "See Our Treats",
        "products_title": "Fresh Baked Goods", "products_subtitle": "Today's Selection",
        "highlights": ["Baked fresh every morning, no compromises", "Premium quality ingredients only", "Traditional family recipes with a modern twist", "Custom cakes & orders for every occasion"],
        "features": [
            {"id": "f1", "icon": "star", "title": "Baked Fresh", "description": "Made fresh daily, no preservatives"},
            {"id": "f2", "icon": "heart", "title": "Made with Love", "description": "Traditional family recipes"},
            {"id": "f3", "icon": "gift", "title": "Custom Orders", "description": "Special cakes for every occasion"},
            {"id": "f4", "icon": "sparkles", "title": "Premium Quality", "description": "Finest ingredients, always"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Sunita Bhat", "text": "Ordered a birthday cake and it was absolutely stunning! Everyone at the party loved it.", "rating": 5, "role": "Happy Customer"},
            {"id": "t2", "name": "Deepak Verma", "text": "The croissants here are life-changing. Fresh, flaky, buttery perfection every single morning.", "rating": 5, "role": "Daily Regular"},
            {"id": "t3", "name": "Kavya Menon", "text": "Best bakery in town, no contest. The pastries are divine and the staff is incredibly warm.", "rating": 5, "role": "Loyal Customer"},
        ],
    },
    "clinic": {
        "theme_color": "#0f4c81", "accent_color": "#059669",
        "badge": "Accepting Patients", "cta_secondary": "View Services",
        "products_title": "Our Services", "products_subtitle": "Medical Treatments",
        "highlights": ["Experienced and qualified medical professionals", "State-of-the-art equipment and facilities", "Comprehensive care for all ages", "Compassionate patient-centred approach"],
        "features": [
            {"id": "f1", "icon": "shield", "title": "Qualified Doctors", "description": "Board-certified specialists with proven expertise"},
            {"id": "f2", "icon": "star", "title": "Advanced Care", "description": "Latest medical technology and treatments"},
            {"id": "f3", "icon": "clock", "title": "Minimal Wait", "description": "Respect your time with punctual appointments"},
            {"id": "f4", "icon": "heart", "title": "Patient First", "description": "Compassionate care tailored to your needs"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Ravi Kumar", "text": "Exceptional care and very thorough diagnosis. The doctor took time to explain everything clearly.", "rating": 5, "role": "Patient"},
            {"id": "t2", "name": "Sangita Desai", "text": "Professional, caring staff and modern facilities. I feel completely at ease here.", "rating": 5, "role": "Regular Patient"},
            {"id": "t3", "name": "Mohan Pillai", "text": "Outstanding medical care. The entire team is dedicated and highly knowledgeable.", "rating": 5, "role": "Happy Patient"},
        ],
    },
    "salon": {
        "theme_color": "#1a0a1e", "accent_color": "#d4af37",
        "badge": "Book Now", "cta_secondary": "View Services",
        "products_title": "Our Services", "products_subtitle": "Beauty Treatments",
        "highlights": ["Expert stylists with years of experience", "Premium products and treatments", "Relaxing, luxurious atmosphere", "Personalised care for every client"],
        "features": [
            {"id": "f1", "icon": "star", "title": "Expert Stylists", "description": "Years of professional training and experience"},
            {"id": "f2", "icon": "shield", "title": "Premium Products", "description": "Only the finest brands and treatments"},
            {"id": "f3", "icon": "check", "title": "Hygienic Standards", "description": "Strict cleanliness and safety protocols"},
            {"id": "f4", "icon": "clock", "title": "By Appointment", "description": "Flexible scheduling at your convenience"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Divya Nair", "text": "The best salon experience! My hair looks absolutely stunning and the team was so professional.", "rating": 5, "role": "Regular Client"},
            {"id": "t2", "name": "Sonal Mehta", "text": "I've been coming here for years. The staff always makes me feel pampered and beautiful.", "rating": 5, "role": "Loyal Customer"},
            {"id": "t3", "name": "Priti Joshi", "text": "Amazing service and results. I wouldn't trust anyone else with my hair!", "rating": 5, "role": "Happy Client"},
        ],
    },
    "cafe": {
        "theme_color": "#3d1f0d", "accent_color": "#d97706",
        "badge": "Brewing Now", "cta_secondary": "See Our Menu",
        "products_title": "Our Menu", "products_subtitle": "Café Favourites",
        "highlights": ["Specialty coffee from the finest farms", "Freshly brewed to order, every time", "Cozy, welcoming atmosphere to relax", "Light bites to pair with your coffee"],
        "features": [
            {"id": "f1", "icon": "star", "title": "Specialty Coffee", "description": "Single-origin beans, expertly roasted"},
            {"id": "f2", "icon": "leaf", "title": "Fresh & Natural", "description": "No artificial flavours, just pure coffee"},
            {"id": "f3", "icon": "heart", "title": "Cozy Ambiance", "description": "Your perfect spot to relax and recharge"},
            {"id": "f4", "icon": "clock", "title": "Fast Service", "description": "Your order ready in minutes"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Aditya Roy", "text": "Best coffee in town! The ambiance is perfect for work and the staff is incredibly friendly.", "rating": 5, "role": "Coffee Lover"},
            {"id": "t2", "name": "Priyanka Das", "text": "My go-to café for morning coffee. The lattes here are absolutely divine!", "rating": 5, "role": "Daily Regular"},
            {"id": "t3", "name": "Siddharth Nair", "text": "Wonderful place to catch up with friends. Great coffee, great vibes!", "rating": 5, "role": "Happy Customer"},
        ],
    },
    "hotel": {
        "theme_color": "#1e3a5f", "accent_color": "#c9a227",
        "badge": "Book Your Stay", "cta_secondary": "View Rooms",
        "products_title": "Our Rooms", "products_subtitle": "Accommodation",
        "highlights": ["Luxurious rooms with modern amenities", "Prime location near major attractions", "Exceptional hospitality and personalised service", "Fine dining and recreation on-site"],
        "features": [
            {"id": "f1", "icon": "star", "title": "Luxury Rooms", "description": "Elegantly appointed for total comfort"},
            {"id": "f2", "icon": "shield", "title": "24/7 Service", "description": "Round-the-clock concierge at your disposal"},
            {"id": "f3", "icon": "heart", "title": "Fine Dining", "description": "World-class restaurant and bar on premise"},
            {"id": "f4", "icon": "check", "title": "Prime Location", "description": "Minutes from major attractions and business hubs"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Rohit Gupta", "text": "An unforgettable stay! Every detail was perfect — from the rooms to the breakfast.", "rating": 5, "role": "Business Traveller"},
            {"id": "t2", "name": "Neha Kapoor", "text": "We had our anniversary here and it was magical. The staff went above and beyond.", "rating": 5, "role": "Leisure Guest"},
            {"id": "t3", "name": "Ajay Sharma", "text": "Top-notch hospitality. I stay here every time I'm in the city for business.", "rating": 5, "role": "Regular Guest"},
        ],
    },
    "gym": {
        "theme_color": "#111827", "accent_color": "#ef4444",
        "badge": "Join Today", "cta_secondary": "View Plans",
        "products_title": "Our Plans", "products_subtitle": "Membership Options",
        "highlights": ["State-of-the-art equipment and facilities", "Certified personal trainers to guide you", "Flexible membership plans for all budgets", "Group classes, cardio, and strength training"],
        "features": [
            {"id": "f1", "icon": "shield", "title": "Pro Equipment", "description": "Latest machines for every muscle group"},
            {"id": "f2", "icon": "star", "title": "Expert Trainers", "description": "Certified coaches to maximise your results"},
            {"id": "f3", "icon": "clock", "title": "Open 24/7", "description": "Train whenever it suits your schedule"},
            {"id": "f4", "icon": "heart", "title": "All Levels", "description": "Beginner to advanced — we've got you covered"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Aryan Singh", "text": "Lost 15 kg in 4 months! The trainers are motivating and the equipment is top class.", "rating": 5, "role": "Member"},
            {"id": "t2", "name": "Kavya Iyer", "text": "Best gym in the area. Clean facilities, great classes, and excellent staff.", "rating": 5, "role": "Regular Member"},
            {"id": "t3", "name": "Suresh Reddy", "text": "Joined 2 years ago and never looked back. The trainers really push you to your best.", "rating": 5, "role": "Loyal Member"},
        ],
    },
    "other": {
        "theme_color": "#1e293b", "accent_color": "#3b82f6",
        "badge": "Open for Business", "cta_secondary": "Our Services",
        "products_title": "Our Services", "products_subtitle": "What We Offer",
        "highlights": ["Professional and reliable service", "Years of industry experience", "Customer satisfaction guaranteed", "Competitive and transparent pricing"],
        "features": [
            {"id": "f1", "icon": "shield", "title": "Quality Work", "description": "Committed to excellence in everything we do"},
            {"id": "f2", "icon": "star", "title": "Expert Team", "description": "Skilled professionals with proven track records"},
            {"id": "f3", "icon": "check", "title": "On Time", "description": "We deliver on schedule, every time"},
            {"id": "f4", "icon": "tag", "title": "Fair Pricing", "description": "Transparent costs with no hidden charges"},
        ],
        "testimonials": [
            {"id": "t1", "name": "Amit Pandey", "text": "Outstanding service and professionalism. I would highly recommend them to anyone.", "rating": 5, "role": "Satisfied Customer"},
            {"id": "t2", "name": "Rekha Bose", "text": "Reliable and efficient. They always exceed expectations!", "rating": 5, "role": "Regular Client"},
            {"id": "t3", "name": "Vishal Sharma", "text": "Best service I've ever experienced. Truly professional team.", "rating": 5, "role": "Happy Customer"},
        ],
    },
}

DEFAULT_DEFAULTS = CATEGORY_DEFAULTS["retail"]


def _get_defaults(category: str) -> dict:
    return CATEGORY_DEFAULTS.get(category, DEFAULT_DEFAULTS)


def _build_initial_json(business: Business, products: list[Product]) -> dict:
    d = _get_defaults(business.category)
    phone = business.phone or ""

    return WebsiteJSON(
        hero=HeroSection(
            headline=business.name,
            subheadline=business.description or f"Welcome to {business.name} — your trusted local {business.category} business.",
            cta_text="Contact Us",
            cta_secondary=d["cta_secondary"],
            badge=d["badge"],
            hero_image=HERO_IMAGES.get(business.category, HERO_IMAGES["other"]),
        ),
        about=AboutSection(
            title=f"About {business.name}",
            content=business.description or f"{business.name} is a trusted local {business.category} business serving our community with quality and dedication.",
            highlights=d["highlights"],
        ),
        features=[Feature(**f) for f in d["features"]],
        products=[
            ProductItem(
                id=str(p.id),
                name=p.name,
                description=p.description or "",
                price=float(p.price) if p.price else None,
            )
            for p in products
        ],
        testimonials=[Testimonial(**t) for t in d["testimonials"]],
        contact=ContactSection(
            phone=phone,
            email=business.email or "",
            address=business.address or "",
            timings=business.timings or "",
            whatsapp=phone,
        ),
        social=Social(),
        theme_color=d["theme_color"],
        accent_color=d["accent_color"],
        font="Inter",
        products_title=d.get("products_title", "Featured Products"),
        products_subtitle=d.get("products_subtitle", "Our Collection"),
    ).model_dump()


async def generate_website(db: Session, business_id: int, user_id: int, template_id: str) -> WebsiteOut:
    from app.ai.image_search import enrich_products, prewarm_urls
    from app.ai.gpt import generate_website_content, generate_image_prompts
    from app.ai.logo_gen import generate_logo_data_url

    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    if template_id not in TEMPLATE_IDS:
        template_id = CATEGORY_TO_TEMPLATE.get(business.category, "retail")

    products = db.query(Product).filter(Product.business_id == business_id, Product.is_active == True).all()
    product_names = [p.name for p in products]

    # Build initial JSON from static category defaults (always succeeds, used as fallback)
    website_json = _build_initial_json(business, products)

    # Ask Groq to generate category-appropriate colors, copy, and section labels
    ai_content = await generate_website_content(
        business_name=business.name,
        category=business.category,
        description=business.description or "",
        product_names=product_names,
    )

    # Apply AI-generated content over the static defaults
    if ai_content:
        if ai_content.get("theme_color"):
            website_json["theme_color"] = ai_content["theme_color"]
        if ai_content.get("accent_color"):
            website_json["accent_color"] = ai_content["accent_color"]
        if ai_content.get("hero_headline"):
            website_json["hero"]["headline"] = ai_content["hero_headline"]
        if ai_content.get("hero_subheadline"):
            website_json["hero"]["subheadline"] = ai_content["hero_subheadline"]
        if ai_content.get("hero_badge"):
            website_json["hero"]["badge"] = ai_content["hero_badge"]
        if ai_content.get("cta_secondary"):
            website_json["hero"]["cta_secondary"] = ai_content["cta_secondary"]
        if ai_content.get("about_content"):
            website_json["about"]["content"] = ai_content["about_content"]
        if ai_content.get("about_highlights") and len(ai_content["about_highlights"]) >= 2:
            website_json["about"]["highlights"] = ai_content["about_highlights"]
        if ai_content.get("features") and len(ai_content["features"]) >= 2:
            website_json["features"] = ai_content["features"]
        if ai_content.get("testimonials") and len(ai_content["testimonials"]) >= 2:
            website_json["testimonials"] = ai_content["testimonials"]
        if ai_content.get("products_title"):
            website_json["products_title"] = ai_content["products_title"]
        if ai_content.get("products_subtitle"):
            website_json["products_subtitle"] = ai_content["products_subtitle"]

    # Generate logo data URI using final accent color (after AI overrides applied)
    website_json["logo_url"] = generate_logo_data_url(
        business.name,
        accent_color=website_json.get("accent_color", "#7c3aed"),
    )

    # Generate contextual image prompts (one AI call for all products)
    ai_img = await generate_image_prompts(
        business_name=business.name,
        category=business.category,
        description=business.description or "",
        product_names=product_names,
    )

    # Hero: keep the reliable Unsplash static photo for the category (fast CDN, no delay)
    # website_json["hero"]["hero_image"] is already set by _build_initial_json via HERO_IMAGES

    # Enrich product/service images: static map → Pollinations.ai
    product_prompts: dict[str, str] = ai_img.get("products", {}) or {}
    website_json["products"] = await enrich_products(
        website_json["products"],
        business.category,
        ai_prompts=product_prompts,
        business_id=business_id,
    )

    # Pre-warm any Pollinations.ai URLs in background so they are ready when the browser loads
    pollinations_urls = [
        p["image_url"] for p in website_json["products"]
        if isinstance(p, dict) and "pollinations.ai" in (p.get("image_url") or "")
    ]
    if pollinations_urls:
        asyncio.create_task(prewarm_urls(pollinations_urls))

    website = db.query(Website).filter(Website.business_id == business_id).first()
    if website:
        website.template_id = template_id
        website.website_json = website_json
    else:
        website = Website(business_id=business_id, template_id=template_id, website_json=website_json, is_published=True)
        db.add(website)

    db.commit()
    db.refresh(website)
    return WebsiteOut.model_validate(website)


def _get_website_or_404(db: Session, business_id: int, user_id: int) -> Website:
    business = db.query(Business).filter(Business.id == business_id, Business.user_id == user_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    website = db.query(Website).filter(Website.business_id == business_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not generated yet")
    return website


def update_website_field(db: Session, business_id: int, user_id: int, section: str, field: str, value) -> WebsiteOut:
    website = _get_website_or_404(db, business_id, user_id)
    data = dict(website.website_json)

    TOP_LEVEL_FIELDS = {"theme_color", "accent_color", "font"}
    TOP_LEVEL_SECTIONS = {"theme", "seo"}
    if section in TOP_LEVEL_SECTIONS or field in TOP_LEVEL_FIELDS:
        data[field] = value
    elif section in data and isinstance(data[section], dict):
        data[section] = {**data[section], field: value}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown section: {section}")

    website.website_json = data
    db.add(website)
    db.commit()
    db.refresh(website)
    return WebsiteOut.model_validate(website)


async def update_product_direct(db: Session, business_id: int, user_id: int, product_id: str, updates: dict) -> WebsiteOut:
    from app.ai.image_search import fetch_image_url

    website = _get_website_or_404(db, business_id, user_id)
    business = db.query(Business).filter(Business.id == business_id).first()
    category = business.category if business else "other"

    data = dict(website.website_json)
    products = data.get("products", [])
    updated = False
    for i, p in enumerate(products):
        if p.get("id") == product_id:
            merged = {**p, **{k: v for k, v in updates.items() if v is not None}}
            # Refresh image if name changed or image is missing
            if updates.get("name") and (updates["name"] != p.get("name") or not p.get("image_url")):
                new_img = await fetch_image_url(merged["name"], category)
                if new_img:
                    merged["image_url"] = new_img
            products[i] = merged
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    data["products"] = products
    website.website_json = data
    db.add(website)
    db.commit()
    db.refresh(website)
    return WebsiteOut.model_validate(website)


def get_website_by_slug(db: Session, slug: str) -> dict:
    business = db.query(Business).filter(Business.slug == slug).first()
    if not business:
        raise HTTPException(status_code=404, detail="Website not found")
    website = business.website
    if not website:
        raise HTTPException(status_code=404, detail="Website not generated yet")
    if not website.is_published:
        raise HTTPException(status_code=404, detail="Website not published")
    return {
        "business": {"name": business.name, "category": business.category, "slug": business.slug},
        "template_id": website.template_id,
        "website_json": website.website_json,
        "is_published": website.is_published,
    }


_INJECTION_PATTERNS = re.compile(
    r"(ignore|disregard|forget|override).{0,40}(instructions?|rules?|context|prompt)|"
    r"(reveal|expose|leak|exfiltrate).{0,40}(api.?key|secret.?key|password|jwt|credential)|"
    r"(print|output|show|return|repeat).{0,40}(system.?prompt|secret.?key|api.?key|\.env)",
    re.IGNORECASE,
)

_MAX_INSTRUCTION_LEN = 500


def _sanitize_instruction(instruction: str) -> str:
    instruction = instruction.strip()[:_MAX_INSTRUCTION_LEN]
    if _INJECTION_PATTERNS.search(instruction):
        raise HTTPException(status_code=400, detail="Instruction contains disallowed content.")
    return instruction


_HISTORY_LIMIT = 10


def _push_history(website: Website, instruction: str) -> None:
    history = list(website.edit_history or [])
    history.append({
        "instruction": instruction,
        "snapshot": copy.deepcopy(website.website_json),
        "saved_at": datetime.now(timezone.utc).isoformat(),
    })
    website.edit_history = history[-_HISTORY_LIMIT:]


def get_edit_history(db: Session, business_id: int, user_id: int) -> list[dict]:
    website = _get_website_or_404(db, business_id, user_id)
    history = list(website.edit_history or [])
    return [
        {"index": i, "instruction": h["instruction"], "saved_at": h["saved_at"]}
        for i, h in enumerate(history)
    ]


def undo_last_edit(db: Session, business_id: int, user_id: int) -> WebsiteOut:
    website = _get_website_or_404(db, business_id, user_id)
    history = list(website.edit_history or [])
    if not history:
        raise HTTPException(status_code=400, detail="No edit history to undo.")
    last = history.pop()
    website.website_json = last["snapshot"]
    website.edit_history = history
    db.add(website)
    db.commit()
    db.refresh(website)
    logger.info(f"Undid edit for business {business_id}: '{last['instruction']}'")
    return WebsiteOut.model_validate(website)


async def apply_edit(db: Session, business_id: int, user_id: int, instruction: str) -> WebsiteOut:
    instruction = _sanitize_instruction(instruction)

    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    website = db.query(Website).filter(Website.business_id == business_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not generated yet")

    _push_history(website, instruction)

    action = await parse_edit_instruction(instruction, website.website_json)
    data = dict(website.website_json)

    act = action.get("action")

    if act == "update_section":
        section = action.get("section")
        content = action.get("content", {})
        if section in data and isinstance(data[section], dict):
            data[section] = {**data[section], **content}

    elif act == "update_field":
        section = action.get("section")
        field = action.get("field")
        value = action.get("value")
        if section in data and field:
            if isinstance(data[section], dict):
                data[section][field] = value
            else:
                data[section] = value

    elif act == "add_product":
        from app.ai.image_search import fetch_image_url
        product_data = action.get("product", {})
        product_name = product_data.get("name", "New Product")
        new_product = {
            "id": uuid.uuid4().hex[:8],
            "name": product_name,
            "description": product_data.get("description", ""),
            "price": product_data.get("price"),
            "badge": product_data.get("badge", "New"),
            "image_url": await fetch_image_url(product_name, business.category, business_id=business_id),
        }
        data.setdefault("products", []).append(new_product)
        db_product = Product(
            business_id=business_id,
            name=new_product["name"],
            description=new_product["description"],
            price=new_product["price"],
        )
        db.add(db_product)

    elif act == "remove_product":
        product_id = action.get("product_id")
        name = action.get("value", "").lower()
        data["products"] = [
            p for p in data.get("products", [])
            if p.get("id") != product_id and name not in p.get("name", "").lower()
        ]

    elif act == "add_testimonial":
        t_data = action.get("testimonial", {})
        new_t = {
            "id": uuid.uuid4().hex[:8],
            "name": t_data.get("name", "Customer"),
            "text": t_data.get("text", ""),
            "rating": t_data.get("rating", 5),
            "role": t_data.get("role", "Customer"),
        }
        data.setdefault("testimonials", []).append(new_t)

    elif act == "update_theme":
        if "theme_color" in action.get("content", {}):
            data["theme_color"] = action["content"]["theme_color"]
        if "accent_color" in action.get("content", {}):
            data["accent_color"] = action["content"]["accent_color"]

    elif act == "translate":
        translated = action.get("content", {})
        for key, val in translated.items():
            if key in data:
                if isinstance(val, dict) and isinstance(data[key], dict):
                    data[key] = {**data[key], **val}
                elif isinstance(data[key], list) and isinstance(val, list) and all(isinstance(item, dict) for item in val):
                    data[key] = val
                elif not isinstance(data[key], list):
                    data[key] = val

    # After every AI edit, fill in any products that are still missing images
    if data.get("products"):
        from app.ai.image_search import enrich_products
        data["products"] = await enrich_products(data["products"], business.category, business_id=business_id)

    website.website_json = data
    db.add(website)
    db.commit()
    db.refresh(website)
    return WebsiteOut.model_validate(website)


def _set_published(db: Session, business_id: int, user_id: int, published: bool) -> WebsiteOut:
    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    website = db.query(Website).filter(Website.business_id == business_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not generated yet")
    website.is_published = published
    db.commit()
    db.refresh(website)
    return WebsiteOut.model_validate(website)


def publish_website(db: Session, business_id: int, user_id: int) -> WebsiteOut:
    return _set_published(db, business_id, user_id, True)


def unpublish_website(db: Session, business_id: int, user_id: int) -> WebsiteOut:
    return _set_published(db, business_id, user_id, False)


def _detect_device(user_agent: str) -> str:
    ua = user_agent.lower()
    if any(k in ua for k in ("ipad", "tablet", "kindle", "playbook")):
        return "tablet"
    if any(k in ua for k in ("iphone", "android", "mobile", "windows phone", "blackberry", "opera mini", "opera mobi")):
        return "mobile"
    return "desktop"


def _parse_referrer_source(referrer: str) -> str:
    if not referrer:
        return "direct"
    r = referrer.lower()
    mapping = {
        "google": "google", "bing": "bing", "yahoo": "yahoo", "duckduckgo": "duckduckgo",
        "instagram": "instagram", "facebook": "facebook", "fb.com": "facebook",
        "twitter": "twitter", "x.com": "twitter", "t.co": "twitter",
        "youtube": "youtube", "linkedin": "linkedin", "whatsapp": "whatsapp",
        "wa.me": "whatsapp", "reddit": "reddit", "pinterest": "pinterest",
        "snapchat": "snapchat", "telegram": "telegram", "tiktok": "tiktok",
    }
    for key, source in mapping.items():
        if key in r:
            return source
    return "other"


def record_visit(db: Session, slug: str, referrer: str | None, user_agent: str = "") -> bool:
    business = db.query(Business).filter(Business.slug == slug).first()
    if not business or not business.website or not business.website.is_published:
        return False
    db.add(WebsiteVisit(
        business_id=business.id,
        referrer=referrer or "",
        device_type=_detect_device(user_agent),
        referrer_source=_parse_referrer_source(referrer or ""),
    ))
    db.commit()
    return True


def get_analytics(db: Session, business_id: int, user_id: int) -> AnalyticsResponse:
    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)

    # 1 query for aggregate counts
    counts = db.query(
        sqlfunc.count(WebsiteVisit.id).label("total"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= today_start, 1))).label("today"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= week_start, 1))).label("week"),
    ).filter(WebsiteVisit.business_id == business_id).one()

    # 1 query for daily buckets replacing 7-iteration loop
    day7_rows = (
        db.query(sqlfunc.date_trunc("day", WebsiteVisit.visited_at).label("day"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id == business_id, WebsiteVisit.visited_at >= week_start)
        .group_by(sqlfunc.date_trunc("day", WebsiteVisit.visited_at)).all()
    )
    day7_map = {row.day.date(): row.cnt for row in day7_rows}
    visits_by_day = [
        VisitDay(
            date=(today_start - timedelta(days=i)).strftime("%b %d"),
            count=day7_map.get((today_start - timedelta(days=i)).date(), 0),
        )
        for i in range(6, -1, -1)
    ]

    return AnalyticsResponse(
        total_visits=counts.total,
        visits_today=counts.today,
        visits_this_week=counts.week,
        visits_by_day=visits_by_day,
    )


def get_detailed_analytics(db: Session, business_id: int, user_id: int) -> dict:
    business = db.query(Business).filter(
        Business.id == business_id, Business.user_id == user_id
    ).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)
    month_start = today_start - timedelta(days=29)

    # ── 1 query: all aggregate counts ────────────────────────────────────────
    counts = db.query(
        sqlfunc.count(WebsiteVisit.id).label("total"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= today_start, 1))).label("today"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= week_start, 1))).label("week"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= month_start, 1))).label("month"),
    ).filter(WebsiteVisit.business_id == business_id).one()
    total, visits_today, visits_this_week, visits_last_30 = (
        counts.total, counts.today, counts.week, counts.month
    )
    avg_daily = round(visits_last_30 / 30, 1)

    # ── 1 query: daily buckets last 7 days ───────────────────────────────────
    day7_rows = (
        db.query(sqlfunc.date_trunc("day", WebsiteVisit.visited_at).label("day"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id == business_id, WebsiteVisit.visited_at >= week_start)
        .group_by(sqlfunc.date_trunc("day", WebsiteVisit.visited_at))
        .all()
    )
    day7_map = {row.day.date(): row.cnt for row in day7_rows}
    visits_by_day = [
        {"date": (today_start - timedelta(days=i)).strftime("%b %d"),
         "count": day7_map.get((today_start - timedelta(days=i)).date(), 0)}
        for i in range(6, -1, -1)
    ]

    # ── 1 query: daily buckets last 30 days ──────────────────────────────────
    day30_rows = (
        db.query(sqlfunc.date_trunc("day", WebsiteVisit.visited_at).label("day"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id == business_id, WebsiteVisit.visited_at >= month_start)
        .group_by(sqlfunc.date_trunc("day", WebsiteVisit.visited_at))
        .all()
    )
    day30_map = {row.day.date(): row.cnt for row in day30_rows}
    visits_by_day_30 = [
        {"date": (today_start - timedelta(days=i)).strftime("%b %d"),
         "count": day30_map.get((today_start - timedelta(days=i)).date(), 0)}
        for i in range(29, -1, -1)
    ]

    # ── 1 query: device breakdown ─────────────────────────────────────────────
    device_rows = (
        db.query(WebsiteVisit.device_type, sqlfunc.count(WebsiteVisit.id).label("cnt"))
        .filter(WebsiteVisit.business_id == business_id)
        .group_by(WebsiteVisit.device_type).all()
    )
    device_breakdown = {"mobile": 0, "desktop": 0, "tablet": 0, "unknown": 0}
    for dt, cnt in device_rows:
        device_breakdown[dt if dt in device_breakdown else "unknown"] += cnt

    # ── 1 query: referrer breakdown ───────────────────────────────────────────
    ref_rows = (
        db.query(WebsiteVisit.referrer_source, sqlfunc.count(WebsiteVisit.id).label("cnt"))
        .filter(WebsiteVisit.business_id == business_id)
        .group_by(WebsiteVisit.referrer_source)
        .order_by(sqlfunc.count(WebsiteVisit.id).desc()).limit(6).all()
    )
    referrer_sources = [
        {"source": src or "direct", "count": cnt,
         "percentage": round(cnt / total * 100, 1) if total else 0}
        for src, cnt in ref_rows
    ]

    # ── 1 query: hourly heatmap (last 7 days) ────────────────────────────────
    hourly_rows = (
        db.query(extract("hour", WebsiteVisit.visited_at).label("hr"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id == business_id, WebsiteVisit.visited_at >= week_start)
        .group_by(extract("hour", WebsiteVisit.visited_at)).all()
    )
    hourly_map: dict[int, int] = {h: 0 for h in range(24)}
    for row in hourly_rows:
        hourly_map[int(row.hr)] = row.cnt
    hourly_heatmap = [{"hour": h, "count": hourly_map[h]} for h in range(24)]
    peak_hour = max(hourly_map, key=hourly_map.get) if any(hourly_map.values()) else 0

    return {
        "total_visits": total,
        "visits_today": visits_today,
        "visits_this_week": visits_this_week,
        "avg_daily_visits": avg_daily,
        "visits_by_day": visits_by_day,
        "visits_by_day_30": visits_by_day_30,
        "device_breakdown": device_breakdown,
        "referrer_sources": referrer_sources,
        "hourly_heatmap": hourly_heatmap,
        "peak_hour": peak_hour,
    }


def get_overview_analytics(db: Session, user_id: int) -> dict:
    businesses = db.query(Business).filter(Business.user_id == user_id).all()
    business_ids = [b.id for b in businesses]

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)
    month_start = today_start - timedelta(days=29)

    empty_days = [{"date": (today_start - timedelta(days=i)).strftime("%b %d"), "count": 0} for i in range(6, -1, -1)]
    if not business_ids:
        return {
            "total_visits": 0, "visits_today": 0, "visits_this_week": 0,
            "avg_daily_visits": 0, "visits_by_day": empty_days,
            "visits_by_day_30": [{"date": (today_start - timedelta(days=i)).strftime("%b %d"), "count": 0} for i in range(29, -1, -1)],
            "device_breakdown": {"mobile": 0, "desktop": 0, "tablet": 0, "unknown": 0},
            "referrer_sources": [], "hourly_heatmap": [{"hour": h, "count": 0} for h in range(24)],
            "peak_hour": 0, "per_site": [],
        }

    # ── 1 query: all aggregate counts ────────────────────────────────────────
    counts = db.query(
        sqlfunc.count(WebsiteVisit.id).label("total"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= today_start, 1))).label("today"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= week_start, 1))).label("week"),
        sqlfunc.count(case((WebsiteVisit.visited_at >= month_start, 1))).label("month"),
    ).filter(WebsiteVisit.business_id.in_(business_ids)).one()
    total, visits_today, visits_this_week, visits_last_30 = (
        counts.total, counts.today, counts.week, counts.month
    )
    avg_daily = round(visits_last_30 / 30, 1)

    # ── 1 query: daily buckets last 7 days ───────────────────────────────────
    day7_rows = (
        db.query(sqlfunc.date_trunc("day", WebsiteVisit.visited_at).label("day"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id.in_(business_ids), WebsiteVisit.visited_at >= week_start)
        .group_by(sqlfunc.date_trunc("day", WebsiteVisit.visited_at)).all()
    )
    day7_map = {row.day.date(): row.cnt for row in day7_rows}
    visits_by_day = [
        {"date": (today_start - timedelta(days=i)).strftime("%b %d"),
         "count": day7_map.get((today_start - timedelta(days=i)).date(), 0)}
        for i in range(6, -1, -1)
    ]

    # ── 1 query: daily buckets last 30 days ──────────────────────────────────
    day30_rows = (
        db.query(sqlfunc.date_trunc("day", WebsiteVisit.visited_at).label("day"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id.in_(business_ids), WebsiteVisit.visited_at >= month_start)
        .group_by(sqlfunc.date_trunc("day", WebsiteVisit.visited_at)).all()
    )
    day30_map = {row.day.date(): row.cnt for row in day30_rows}
    visits_by_day_30 = [
        {"date": (today_start - timedelta(days=i)).strftime("%b %d"),
         "count": day30_map.get((today_start - timedelta(days=i)).date(), 0)}
        for i in range(29, -1, -1)
    ]

    # ── 1 query: device breakdown ─────────────────────────────────────────────
    device_rows = (
        db.query(WebsiteVisit.device_type, sqlfunc.count(WebsiteVisit.id).label("cnt"))
        .filter(WebsiteVisit.business_id.in_(business_ids))
        .group_by(WebsiteVisit.device_type).all()
    )
    device_breakdown = {"mobile": 0, "desktop": 0, "tablet": 0, "unknown": 0}
    for dt, cnt in device_rows:
        device_breakdown[dt if dt in device_breakdown else "unknown"] += cnt

    # ── 1 query: referrer breakdown ───────────────────────────────────────────
    ref_rows = (
        db.query(WebsiteVisit.referrer_source, sqlfunc.count(WebsiteVisit.id).label("cnt"))
        .filter(WebsiteVisit.business_id.in_(business_ids))
        .group_by(WebsiteVisit.referrer_source)
        .order_by(sqlfunc.count(WebsiteVisit.id).desc()).limit(6).all()
    )
    referrer_sources = [
        {"source": src or "direct", "count": cnt,
         "percentage": round(cnt / total * 100, 1) if total else 0}
        for src, cnt in ref_rows
    ]

    # ── 1 query: hourly heatmap (last 7 days) ────────────────────────────────
    hourly_rows = (
        db.query(extract("hour", WebsiteVisit.visited_at).label("hr"), sqlfunc.count().label("cnt"))
        .filter(WebsiteVisit.business_id.in_(business_ids), WebsiteVisit.visited_at >= week_start)
        .group_by(extract("hour", WebsiteVisit.visited_at)).all()
    )
    hourly_map: dict[int, int] = {h: 0 for h in range(24)}
    for row in hourly_rows:
        hourly_map[int(row.hr)] = row.cnt
    hourly_heatmap = [{"hour": h, "count": hourly_map[h]} for h in range(24)]
    peak_hour = max(hourly_map, key=hourly_map.get) if any(hourly_map.values()) else 0

    # ── 2 queries: per-site totals (replaces N×2 queries) ────────────────────
    site_totals = dict(
        db.query(WebsiteVisit.business_id, sqlfunc.count(WebsiteVisit.id))
        .filter(WebsiteVisit.business_id.in_(business_ids))
        .group_by(WebsiteVisit.business_id).all()
    )
    site_today_map = dict(
        db.query(WebsiteVisit.business_id, sqlfunc.count(WebsiteVisit.id))
        .filter(WebsiteVisit.business_id.in_(business_ids), WebsiteVisit.visited_at >= today_start)
        .group_by(WebsiteVisit.business_id).all()
    )
    per_site = [
        {
            "business_id": b.id, "name": b.name, "category": b.category, "slug": b.slug,
            "total_visits": site_totals.get(b.id, 0),
            "visits_today": site_today_map.get(b.id, 0),
        }
        for b in businesses
    ]

    return {
        "total_visits": total,
        "visits_today": visits_today,
        "visits_this_week": visits_this_week,
        "avg_daily_visits": avg_daily,
        "visits_by_day": visits_by_day,
        "visits_by_day_30": visits_by_day_30,
        "device_breakdown": device_breakdown,
        "referrer_sources": referrer_sources,
        "hourly_heatmap": hourly_heatmap,
        "peak_hour": peak_hour,
        "per_site": per_site,
    }
