"""Notification service."""
from datetime import datetime
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException
from app.models.notification import (
    Notification, NotificationTemplate,
    NotificationType, NotificationChannel, NotificationStatus,
)
from app.tasks.email_tasks import send_email
from app.tasks.sms_tasks import send_sms


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        recipient_id: int,
        notification_type: NotificationType,
        channel: NotificationChannel,
        subject: Optional[str],
        body: str,
        metadata: Optional[dict] = None,
    ) -> Notification:
        notification = Notification(
            recipient_id=recipient_id,
            notification_type=notification_type,
            channel=channel,
            subject=subject,
            body=body,
            metadata=metadata,
        )
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification

    async def send_notification(self, notification_id: int, recipient_email: str = None, recipient_phone: str = None):
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notification = result.scalar_one_or_none()
        if not notification:
            raise NotFoundException(f"Notification {notification_id} not found")

        try:
            if notification.channel == NotificationChannel.EMAIL and recipient_email:
                send_email.delay(recipient_email, notification.subject or "", notification.body)
                notification.status = NotificationStatus.SENT
            elif notification.channel == NotificationChannel.SMS and recipient_phone:
                send_sms.delay(recipient_phone, notification.body)
                notification.status = NotificationStatus.SENT
            elif notification.channel == NotificationChannel.IN_APP:
                notification.status = NotificationStatus.SENT
            else:
                notification.status = NotificationStatus.FAILED

            notification.sent_at = datetime.utcnow()
            self.db.add(notification)
            await self.db.flush()
        except Exception:
            notification.status = NotificationStatus.FAILED
            self.db.add(notification)
            await self.db.flush()

    async def send_from_template(
        self,
        template_name: str,
        recipient_id: int,
        variables: dict,
        recipient_email: str = None,
        recipient_phone: str = None,
    ) -> Notification:
        result = await self.db.execute(
            select(NotificationTemplate).where(
                NotificationTemplate.name == template_name,
                NotificationTemplate.is_active == True,
            )
        )
        template = result.scalar_one_or_none()
        if not template:
            raise NotFoundException(f"Template '{template_name}' not found")

        subject = template.subject_template or ""
        body = template.body_template
        for key, value in variables.items():
            subject = subject.replace(f"{{{{{key}}}}}", str(value))
            body = body.replace(f"{{{{{key}}}}}", str(value))

        notification = await self.create_notification(
            recipient_id=recipient_id,
            notification_type=template.notification_type,
            channel=template.channel,
            subject=subject,
            body=body,
            metadata=variables,
        )

        await self.send_notification(notification.id, recipient_email, recipient_phone)
        return notification

    async def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
    ) -> dict:
        query = select(Notification).where(Notification.recipient_id == user_id)
        count_query = select(func.count(Notification.id)).where(Notification.recipient_id == user_id)
        unread_query = select(func.count(Notification.id)).where(
            Notification.recipient_id == user_id,
            Notification.read_at == None,
        )

        if unread_only:
            query = query.where(Notification.read_at == None)

        query = query.order_by(Notification.created_at.desc()).limit(limit)

        total = (await self.db.execute(count_query)).scalar_one()
        unread_count = (await self.db.execute(unread_query)).scalar_one()
        items = (await self.db.execute(query)).scalars().all()

        return {
            "items": items,
            "total": total,
            "unread_count": unread_count,
        }

    async def mark_read(self, notification_id: int, user_id: int) -> Notification:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.recipient_id == user_id,
            )
        )
        notification = result.scalar_one_or_none()
        if not notification:
            raise NotFoundException(f"Notification {notification_id} not found")

        notification.read_at = datetime.utcnow()
        notification.status = NotificationStatus.READ
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification
