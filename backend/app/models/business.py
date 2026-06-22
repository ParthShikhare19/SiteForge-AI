from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base



class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    timings = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="businesses")
    website = relationship("Website", back_populates="business", uselist=False, cascade="all, delete-orphan")
    products = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    visits = relationship("WebsiteVisit", back_populates="business", cascade="all, delete-orphan", passive_deletes=True)
