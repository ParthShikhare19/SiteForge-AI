from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class WebsiteVisit(Base):
    __tablename__ = "website_visits"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    visited_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    referrer = Column(String, nullable=True)
    device_type = Column(String(20), nullable=True)      # mobile / tablet / desktop
    referrer_source = Column(String(100), nullable=True)  # direct / google / instagram / etc.

    business = relationship("Business", back_populates="visits")
