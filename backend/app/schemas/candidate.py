from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field

from app.models.candidate import CandidateStatus


class CandidateCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    job_id: Optional[int] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[dict] = None


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_id: Optional[int] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[dict] = None
    status: Optional[CandidateStatus] = None


class CandidateResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    resume_path: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: Optional[int] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[dict] = None
    status: CandidateStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateListResponse(BaseModel):
    items: List[CandidateResponse]
    total: int
    page: int
    page_size: int
