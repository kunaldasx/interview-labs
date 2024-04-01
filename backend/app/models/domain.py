from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"
    DOMAIN_SPECIFIC = "domain_specific"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Domain(SQLModel, table=True):
    __tablename__ = "domains"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    slug: str = Field(max_length=255, index=True, unique=True)
    sector: str = Field(max_length=255)
    sector_slug: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    questions: List["QuestionBank"] = Relationship(back_populates="domain")


class QuestionBank(SQLModel, table=True):
    __tablename__ = "question_bank"

    id: Optional[int] = Field(default=None, primary_key=True)
    domain_id: int = Field(foreign_key="domains.id", index=True)
    question_text: str = Field(max_length=1000)
    question_type: QuestionType = Field(default=QuestionType.TECHNICAL)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.MEDIUM)
    expected_answer: Optional[str] = Field(default=None)
    keywords: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    domain: Optional[Domain] = Relationship(back_populates="questions")
