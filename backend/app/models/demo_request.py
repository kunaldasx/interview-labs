"""Demo request model for contact form submissions."""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class DemoRequestStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    CLOSED = "closed"


class DemoRequest(SQLModel, table=True):
    __tablename__ = "demo_requests"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    email: str = Field(max_length=255, index=True)
    company: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    message: Optional[str] = Field(default=None)
    status: DemoRequestStatus = Field(default=DemoRequestStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
