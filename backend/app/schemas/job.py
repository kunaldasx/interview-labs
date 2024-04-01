from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.job import JobStatus


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    department_id: Optional[int] = None
    domain_id: Optional[int] = None
    description: str
    requirements: Optional[str] = None
    required_skills: Optional[dict] = None
    preferred_skills: Optional[dict] = None
    experience_min: int = Field(default=0, ge=0)
    experience_max: int = Field(default=0, ge=0)
    education_level: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    domain_id: Optional[int] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    required_skills: Optional[dict] = None
    preferred_skills: Optional[dict] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    education_level: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[JobStatus] = None


class JobResponse(BaseModel):
    id: int
    title: str
    department_id: Optional[int] = None
    domain_id: Optional[int] = None
    description: str
    requirements: Optional[str] = None
    required_skills: Optional[dict] = None
    preferred_skills: Optional[dict] = None
    experience_min: int
    experience_max: int
    education_level: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: JobStatus
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    page_size: int
