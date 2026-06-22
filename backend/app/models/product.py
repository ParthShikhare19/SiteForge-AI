from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2))
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="products")
