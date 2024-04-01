from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from app.models.notification import NotificationType, NotificationChannel, NotificationStatus


class NotificationCreate(BaseModel):
    recipient_id: int
    notification_type: NotificationType
    channel: NotificationChannel = NotificationChannel.EMAIL
    subject: Optional[str] = None
    body: str


class NotificationResponse(BaseModel):
    id: int
    recipient_id: int
    notification_type: NotificationType
    channel: NotificationChannel
    subject: Optional[str] = None
    body: str
    status: NotificationStatus
    metadata: Optional[dict] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
