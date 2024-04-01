"""Resume screening Celery tasks."""
import asyncio
import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.screen_candidate_resume")
def screen_candidate_resume(candidate_id: int, job_id: int):
    logger.info(f"Starting resume screening for candidate {candidate_id}, job {job_id}")

    from app.core.database import async_session
    from app.services.screening_service import ScreeningService

    async def _run():
        async with async_session() as session:
            service = ScreeningService(session)
            result = await service.screen_candidate(candidate_id, job_id)
            await session.commit()
            return result

    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(_run())
        logger.info(f"Screening completed for candidate {candidate_id}: {result.recommendation if result else 'failed'}")
        return {"status": "completed", "candidate_id": candidate_id, "job_id": job_id}
    except Exception as e:
        logger.error(f"Screening failed for candidate {candidate_id}: {e}")
        return {"status": "failed", "error": str(e)}
    finally:
        loop.close()
