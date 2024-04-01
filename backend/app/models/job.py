from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class JobStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    ON_HOLD = "on_hold"


class JobDescription(SQLModel, table=True):
    __tablename__ = "job_descriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255, index=True)
    department_id: Optional[int] = Field(default=None, foreign_key="departments.id")
    domain_id: Optional[int] = Field(default=None, foreign_key="domains.id")
    description: Optional[str] = Field(default=None)
    required_skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    preferred_skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    experience_min: int = Field(default=0)
    experience_max: int = Field(default=0)
    salary_min: Optional[float] = Field(default=None)
    salary_max: Optional[float] = Field(default=None)
    location: Optional[str] = Field(default=None, max_length=255)
    employment_type: Optional[str] = Field(default="full_time", max_length=50)
    status: JobStatus = Field(default=JobStatus.DRAFT)
    openings: int = Field(default=1)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    department: Optional["Department"] = Relationship()
    domain: Optional["Domain"] = Relationship()
