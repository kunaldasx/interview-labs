from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class InterviewType(str, Enum):
    AI_CHAT = "ai_chat"
    AI_VOICE = "ai_voice"
    AI_BOTH = "ai_both"


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class AnswerMode(str, Enum):
    TEXT = "text"
    VOICE = "voice"


class SpeakerType(str, Enum):
    AI = "ai"
    CANDIDATE = "candidate"
    SYSTEM = "system"


class MessageType(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    SYSTEM = "system"


class Interview(SQLModel, table=True):
    __tablename__ = "interviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidates.id", index=True)
    job_id: int = Field(foreign_key="job_descriptions.id", index=True)
    interview_type: InterviewType = Field(default=InterviewType.AI_CHAT)
    status: InterviewStatus = Field(default=InterviewStatus.SCHEDULED)
    scheduled_at: Optional[datetime] = Field(default=None)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_limit_min: int = Field(default=30)
    language: str = Field(default="en", max_length=10)
    total_questions: int = Field(default=0)
    questions_asked: int = Field(default=0)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    candidate: Optional["Candidate"] = Relationship()
    job: Optional["JobDescription"] = Relationship()
    questions: List["InterviewQuestion"] = Relationship(back_populates="interview")
    answers: List["InterviewAnswer"] = Relationship(back_populates="interview")
    transcripts: List["InterviewTranscript"] = Relationship(back_populates="interview")


class InterviewQuestion(SQLModel, table=True):
    __tablename__ = "interview_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", index=True)
    question_text: str = Field(max_length=2000)
    question_type: str = Field(default="technical", max_length=50)
    difficulty: str = Field(default="medium", max_length=20)
    question_order: int = Field(default=0)
    is_follow_up: bool = Field(default=False)
    parent_question_id: Optional[int] = Field(default=None, foreign_key="interview_questions.id")
    expected_answer: Optional[str] = Field(default=None)
    keywords: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    asked_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    interview: Optional[Interview] = Relationship(back_populates="questions")


class InterviewAnswer(SQLModel, table=True):
    __tablename__ = "interview_answers"

    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", index=True)
    question_id: int = Field(foreign_key="interview_questions.id")
    answer_text: Optional[str] = Field(default=None)
    answer_audio_path: Optional[str] = Field(default=None, max_length=500)
    answer_mode: AnswerMode = Field(default=AnswerMode.TEXT)
    sentiment: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    confidence_score: Optional[float] = Field(default=None)
    answered_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    interview: Optional[Interview] = Relationship(back_populates="answers")
    question: Optional[InterviewQuestion] = Relationship()


class InterviewTranscript(SQLModel, table=True):
    __tablename__ = "interview_transcripts"

    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", index=True)
    speaker: SpeakerType = Field(default=SpeakerType.AI)
    message_type: MessageType = Field(default=MessageType.TEXT)
    content: str
    sequence_order: int = Field(default=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    interview: Optional[Interview] = Relationship(back_populates="transcripts")
