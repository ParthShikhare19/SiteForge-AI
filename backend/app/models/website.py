from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    template_id = Column(String, nullable=False)
    website_json = Column(JSON, nullable=False, default={})
    is_published = Column(Boolean, default=True)
    edit_history = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    business = relationship("Business", back_populates="website")
