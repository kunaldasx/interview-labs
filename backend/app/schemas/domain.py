from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.domain import QuestionType, DifficultyLevel


class DomainCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    sector: str = Field(min_length=1, max_length=255)
    sector_slug: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None


class DomainResponse(BaseModel):
    id: int
    name: str
    slug: str
    sector: str
    sector_slug: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionBankCreate(BaseModel):
    domain_id: int
    question_text: str = Field(min_length=1, max_length=2000)
    question_type: QuestionType = QuestionType.TECHNICAL
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    expected_answer: Optional[str] = None
    keywords: Optional[dict] = None


class QuestionBankResponse(BaseModel):
    id: int
    domain_id: int
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    expected_answer: Optional[str] = None
    keywords: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DomainWithQuestionsResponse(DomainResponse):
    questions: List[QuestionBankResponse] = []


class SectorResponse(BaseModel):
    sector: str
    sector_slug: str
    domain_count: int
