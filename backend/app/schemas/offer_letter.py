from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.offer_letter import OfferLetterStatus


class OfferLetterCreate(BaseModel):
    interview_id: int
    salary: float = Field(gt=0)
    currency: str = Field(default="USD", max_length=10)
    start_date: date
    end_date: Optional[date] = None
    benefits: str = Field(min_length=1)
    reporting_manager: str = Field(min_length=1, max_length=255)
    department: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=255)
    additional_terms: Optional[str] = None


class OfferLetterUpdate(BaseModel):
    salary: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, max_length=10)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    benefits: Optional[str] = None
    reporting_manager: Optional[str] = Field(default=None, max_length=255)
    department: Optional[str] = Field(default=None, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)
    additional_terms: Optional[str] = None


class OfferLetterApproval(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


class OfferLetterResponse(BaseModel):
    id: int
    interview_id: int
    candidate_id: int
    job_id: int
    created_by: int
    approved_by: Optional[int] = None
    status: OfferLetterStatus
    salary: float
    currency: str
    start_date: date
    end_date: Optional[date] = None
    benefits: str
    reporting_manager: str
    department: str
    location: str
    additional_terms: Optional[str] = None
    rejection_reason: Optional[str] = None
    sent_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Enriched fields from relationships
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None

    model_config = {"from_attributes": True}


class OfferLetterListResponse(BaseModel):
    items: List[OfferLetterResponse]
    total: int
    page: int
    page_size: int
