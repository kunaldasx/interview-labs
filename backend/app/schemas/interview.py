from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.interview import (
    InterviewType, InterviewStatus, AnswerMode, SpeakerType, MessageType,
)


class InterviewCreate(BaseModel):
    candidate_id: int
    job_id: int
    interview_type: InterviewType = InterviewType.AI_CHAT
    scheduled_at: Optional[datetime] = None
    duration_limit_min: int = Field(default=30, ge=5, le=120)
    language: str = Field(default="en", max_length=10)


class InterviewUpdate(BaseModel):
    status: Optional[InterviewStatus] = None
    scheduled_at: Optional[datetime] = None
    duration_limit_min: Optional[int] = None


class InterviewResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    interview_type: InterviewType
    status: InterviewStatus
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_limit_min: int
    language: str
    total_questions: int
    questions_asked: int
    recording_url: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InterviewListResponse(BaseModel):
    items: List[InterviewResponse]
    total: int
    page: int
    page_size: int


class ChatMessage(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    message_type: str = "text"


class ChatResponse(BaseModel):
    speaker: SpeakerType
    content: str
    message_type: MessageType
    timestamp: datetime


class TranscriptEntry(BaseModel):
    id: int
    speaker: SpeakerType
    message_type: MessageType
    content: str
    sequence_order: int
    timestamp: datetime

    model_config = {"from_attributes": True}


class InterviewQuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    difficulty: str
    question_order: int
    is_follow_up: bool
    asked_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InterviewAnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: Optional[str] = None
    answer_mode: AnswerMode
    confidence_score: Optional[float] = None
    answered_at: datetime

    model_config = {"from_attributes": True}


class InterviewDetailResponse(InterviewResponse):
    questions: List[InterviewQuestionResponse] = []
    answers: List[InterviewAnswerResponse] = []
    transcripts: List[TranscriptEntry] = []
