from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BusinessCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    timings: Optional[str] = None


class BusinessOut(BaseModel):
    id: int
    name: str
    category: str
    slug: str
    description: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    timings: Optional[str]
    created_at: datetime
    is_published: Optional[bool] = None

    class Config:
        from_attributes = True


class TranscribeRequest(BaseModel):
    transcript: str


class ExtractedBusiness(BaseModel):
    business_name: str
    category: str
    description: Optional[str] = None
    products: Optional[list] = []
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    timings: Optional[str] = None
