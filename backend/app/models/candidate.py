from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class CandidateStatus(str, Enum):
    REGISTERED = "registered"
    SCREENED = "screened"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWED = "interviewed"
    EVALUATED = "evaluated"
    OFFERED = "offered"
    HIRED = "hired"
    REJECTED = "rejected"


class Candidate(SQLModel, table=True):
    __tablename__ = "candidates"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    full_name: str = Field(max_length=255, index=True)
    email: str = Field(max_length=255, index=True)
    phone: Optional[str] = Field(default=None, max_length=20)
    resume_path: Optional[str] = Field(default=None, max_length=500)
    resume_text: Optional[str] = Field(default=None)
    skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    experience_years: Optional[float] = Field(default=None)
    education: Optional[str] = Field(default=None)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    portfolio_url: Optional[str] = Field(default=None, max_length=500)
    job_id: Optional[int] = Field(default=None, foreign_key="job_descriptions.id")
    status: CandidateStatus = Field(default=CandidateStatus.REGISTERED)
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship()
    job: Optional["JobDescription"] = Relationship()
