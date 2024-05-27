from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "ai_interview_agent",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Explicitly include task modules
celery_app.conf.include = [
    "app.tasks.email_tasks",
    "app.tasks.sms_tasks",
    "app.tasks.evaluation_tasks",
]
