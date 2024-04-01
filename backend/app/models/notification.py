from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship


class NotificationType(str, Enum):
    INTERVIEW_INVITE = "interview_invite"
    INTERVIEW_REMINDER = "interview_reminder"
    EVALUATION_RESULT = "evaluation_result"
    STATUS_UPDATE = "status_update"
    OFFER_LETTER = "offer_letter"


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    recipient_id: int = Field(foreign_key="users.id", index=True)
    notification_type: NotificationType
    channel: NotificationChannel = Field(default=NotificationChannel.EMAIL)
    subject: Optional[str] = Field(default=None, max_length=500)
    body: str
    status: NotificationStatus = Field(default=NotificationStatus.PENDING)
    extra_data: Optional[dict] = Field(default=None, sa_column=Column("metadata", JSON))
    sent_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    recipient: Optional["User"] = Relationship()


class NotificationTemplate(SQLModel, table=True):
    __tablename__ = "notification_templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=255)
    notification_type: NotificationType
    channel: NotificationChannel
    subject_template: Optional[str] = Field(default=None, max_length=500)
    body_template: str
    variables: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
