"""Schemas for demo request / contact form."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.demo_request import DemoRequestStatus


class DemoRequestCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None


class DemoRequestResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    status: DemoRequestStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DemoRequestStatusUpdate(BaseModel):
    status: DemoRequestStatus
