from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class AIRecommendation(str, Enum):
    STRONGLY_HIRE = "strongly_hire"
    HIRE = "hire"
    MAYBE = "maybe"
    NO_HIRE = "no_hire"


class HRDecision(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ON_HOLD = "on_hold"


class Evaluation(SQLModel, table=True):
    __tablename__ = "evaluations"

    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", unique=True, index=True)
    candidate_id: int = Field(foreign_key="candidates.id", index=True)
    communication_score: float = Field(default=0.0)
    technical_score: float = Field(default=0.0)
    confidence_score: float = Field(default=0.0)
    domain_knowledge_score: float = Field(default=0.0)
    problem_solving_score: float = Field(default=0.0)
    overall_score: float = Field(default=0.0)
    strengths: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    weaknesses: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    detailed_feedback: Optional[str] = Field(default=None)
    ai_recommendation: AIRecommendation = Field(default=AIRecommendation.MAYBE)
    hr_decision: HRDecision = Field(default=HRDecision.PENDING)
    hr_notes: Optional[str] = Field(default=None)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    interview: Optional["Interview"] = Relationship()
    candidate: Optional["Candidate"] = Relationship()
