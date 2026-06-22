from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


class HeroSection(BaseModel):
    headline: str = ""
    subheadline: str = ""
    cta_text: str = "Contact Us"
    cta_secondary: str = "Learn More"
    badge: str = ""
    background_color: str = "#1a1a2e"
    hero_image: str = ""


class AboutSection(BaseModel):
    title: str = "About Us"
    content: str = ""
    highlights: list[str] = []


class ContactSection(BaseModel):
    phone: str = ""
    email: str = ""
    address: str = ""
    timings: str = ""
    whatsapp: str = ""


class Social(BaseModel):
    instagram: str = ""
    facebook: str = ""
    twitter: str = ""
    youtube: str = ""


class Feature(BaseModel):
    id: str
    icon: str
    title: str
    description: str


class Testimonial(BaseModel):
    id: str
    name: str
    text: str
    rating: int = 5
    role: str = ""


class ProductItem(BaseModel):
    id: str
    name: str
    description: str = ""
    price: Optional[float] = None
    image_url: Optional[str] = None
    badge: str = ""


class WebsiteJSON(BaseModel):
    hero: HeroSection = HeroSection()
    about: AboutSection = AboutSection()
    features: list[Feature] = []
    products: list[ProductItem] = []
    testimonials: list[Testimonial] = []
    contact: ContactSection = ContactSection()
    social: Social = Social()
    theme_color: str = "#312e81"
    accent_color: str = "#7c3aed"
    font: str = "Inter"
    products_title: str = "Featured Products"
    products_subtitle: str = "Our Collection"
    logo_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class WebsiteGenerateRequest(BaseModel):
    business_id: int
    template_id: str


class WebsiteOut(BaseModel):
    id: int
    business_id: int
    template_id: str
    website_json: dict[str, Any]
    is_published: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class WebsiteEditRequest(BaseModel):
    business_id: int
    instruction: str


class DirectFieldUpdate(BaseModel):
    business_id: int
    section: str
    field: str
    value: Any


class DirectProductUpdate(BaseModel):
    business_id: int
    product_id: str
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    badge: Optional[str] = None
    image_url: Optional[str] = None


class VisitCreate(BaseModel):
    referrer: Optional[str] = None


class VisitDay(BaseModel):
    date: str
    count: int


class AnalyticsResponse(BaseModel):
    total_visits: int
    visits_today: int
    visits_this_week: int
    visits_by_day: list[VisitDay]


class EditAction(BaseModel):
    action: str
    section: Optional[str] = None
    content: Optional[Any] = None
    product: Optional[dict] = None
    product_id: Optional[str] = None
    testimonial: Optional[dict] = None
    testimonial_id: Optional[str] = None
    field: Optional[str] = None
    value: Optional[Any] = None
    language: Optional[str] = None
