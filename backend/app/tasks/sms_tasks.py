"""SMS sending Celery tasks."""
import logging

from app.tasks.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.send_sms", bind=True, max_retries=3)
def send_sms(self, to_phone: str, body: str):
    try:
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
            logger.warning(f"Twilio not configured. SMS to {to_phone} not sent.")
            return {"status": "skipped", "reason": "Twilio not configured"}

        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone,
        )

        logger.info(f"SMS sent to {to_phone}: {message.sid}")
        return {"status": "sent", "sid": message.sid}

    except Exception as exc:
        logger.error(f"Failed to send SMS to {to_phone}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
