"""Evaluation Celery tasks."""
import asyncio
import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.evaluate_interview", bind=True, max_retries=3, default_retry_delay=30)
def evaluate_interview_task(self, interview_id: int):
    logger.info(f"Starting auto-evaluation for interview {interview_id}")

    from app.core.database import async_session
    from app.services.evaluation_service import EvaluationService

    async def _run():
        async with async_session() as session:
            service = EvaluationService(session)
            result = await service.evaluate_interview(interview_id)
            await session.commit()
            return result

    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(_run())
        logger.info(f"Auto-evaluation completed for interview {interview_id}: score={result.overall_score}, rec={result.ai_recommendation}")
        return {"status": "completed", "interview_id": interview_id, "evaluation_id": result.id}
    except Exception as e:
        logger.error(f"Auto-evaluation failed for interview {interview_id}: {e}")
        raise self.retry(exc=e)
    finally:
        loop.close()
