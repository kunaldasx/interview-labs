from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


from app.models.candidate import CandidateStatus


class WorkExperienceCreate(BaseModel):
    company_name: str
    job_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    location: Optional[str] = None
    description: Optional[str] = None


class WorkExperienceResponse(BaseModel):
    id: int
    candidate_id: int
    company_name: str
    job_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    location: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    job_id: Optional[int] = None
    domain_id: Optional[int] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[dict] = None
    work_experiences: Optional[List[WorkExperienceCreate]] = None


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    job_id: Optional[int] = None
    domain_id: Optional[int] = None
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
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_path: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: Optional[int] = None
    domain_id: Optional[int] = None
    domain_name: Optional[str] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[dict] = None
    status: CandidateStatus
    work_experiences: List[WorkExperienceResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateListResponse(BaseModel):
    items: List[CandidateResponse]
    total: int
    page: int
    page_size: int
