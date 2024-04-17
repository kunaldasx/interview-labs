from datetime import datetime, date
from enum import Enum
from typing import Optional, List

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
    address: Optional[str] = Field(default=None, max_length=500)
    date_of_birth: Optional[date] = Field(default=None)
    resume_path: Optional[str] = Field(default=None, max_length=500)
    resume_text: Optional[str] = Field(default=None)
    skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    experience_years: Optional[float] = Field(default=None)
    education: Optional[str] = Field(default=None)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    portfolio_url: Optional[str] = Field(default=None, max_length=500)
    job_id: Optional[int] = Field(default=None, foreign_key="job_descriptions.id")
    domain_id: Optional[int] = Field(default=None, foreign_key="domains.id")
    status: CandidateStatus = Field(default=CandidateStatus.REGISTERED)
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship()
    job: Optional["JobDescription"] = Relationship()
    domain: Optional["Domain"] = Relationship()
    work_experiences: List["WorkExperience"] = Relationship(back_populates="candidate")

    @property
    def domain_name(self) -> Optional[str]:
        return self.domain.name if self.domain else None


class WorkExperience(SQLModel, table=True):
    __tablename__ = "work_experiences"

    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidates.id", index=True)
    company_name: str = Field(max_length=255)
    job_title: str = Field(max_length=255)
    start_date: Optional[str] = Field(default=None, max_length=50)
    end_date: Optional[str] = Field(default=None, max_length=50)
    is_current: bool = Field(default=False)
    location: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    candidate: Optional[Candidate] = Relationship(back_populates="work_experiences")
