from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class ScreeningRecommendation(str, Enum):
    STRONGLY_RECOMMEND = "strongly_recommend"
    RECOMMEND = "recommend"
    MAYBE = "maybe"
    NOT_RECOMMEND = "not_recommend"


class ResumeScreening(SQLModel, table=True):
    __tablename__ = "resume_screenings"

    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidates.id", index=True)
    job_id: int = Field(foreign_key="job_descriptions.id", index=True)
    keyword_match_score: float = Field(default=0.0)
    skill_relevance_score: float = Field(default=0.0)
    experience_match_score: float = Field(default=0.0)
    education_match_score: float = Field(default=0.0)
    overall_score: float = Field(default=0.0)
    recommendation: ScreeningRecommendation = Field(default=ScreeningRecommendation.MAYBE)
    matched_skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    missing_skills: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    strengths: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    concerns: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    summary: Optional[str] = Field(default=None)
    screened_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    candidate: Optional["Candidate"] = Relationship()
    job: Optional["JobDescription"] = Relationship()
