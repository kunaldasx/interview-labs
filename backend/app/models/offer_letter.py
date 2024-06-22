from datetime import datetime, date
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class OfferLetterStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    SENT = "sent"


class OfferLetter(SQLModel, table=True):
    __tablename__ = "offer_letters"

    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", index=True)
    candidate_id: int = Field(foreign_key="candidates.id", index=True)
    job_id: int = Field(foreign_key="job_descriptions.id", index=True)
    created_by: int = Field(foreign_key="users.id")
    approved_by: Optional[int] = Field(default=None, foreign_key="users.id")

    status: OfferLetterStatus = Field(default=OfferLetterStatus.DRAFT)

    salary: float
    currency: str = Field(default="USD", max_length=10)
    start_date: date
    end_date: Optional[date] = Field(default=None)
    benefits: str
    reporting_manager: str = Field(max_length=255)
    department: str = Field(max_length=255)
    location: str = Field(max_length=255)
    additional_terms: Optional[str] = Field(default=None)
    rejection_reason: Optional[str] = Field(default=None)

    sent_at: Optional[datetime] = Field(default=None)
    approved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    interview: Optional["Interview"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[OfferLetter.interview_id]"}
    )
    candidate: Optional["Candidate"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[OfferLetter.candidate_id]"}
    )
    job: Optional["JobDescription"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[OfferLetter.job_id]"}
    )
    creator: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[OfferLetter.created_by]"}
    )
    approver: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[OfferLetter.approved_by]"}
    )
