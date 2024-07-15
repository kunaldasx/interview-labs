"""Resume screening API endpoints."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.resume_screening import ScreeningRequest, ScreeningResponse
from app.services.screening_service import ScreeningService
from app.tasks.screening_tasks import screen_candidate_resume

router = APIRouter()


@router.post("/", response_model=ScreeningResponse)
async def screen_candidate(
    data: ScreeningRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = ScreeningService(db)
    return await service.screen_candidate(data.candidate_id, data.job_id)


@router.post("/async")
async def screen_candidate_async(
    data: ScreeningRequest,
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    task = screen_candidate_resume.delay(data.candidate_id, data.job_id)
    return {"task_id": task.id, "status": "queued"}


@router.get("/{screening_id}", response_model=ScreeningResponse)
async def get_screening(
    screening_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = ScreeningService(db)
    return await service.get_screening(screening_id)


@router.get("/job/{job_id}", response_model=List[ScreeningResponse])
async def get_screenings_for_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = ScreeningService(db)
    return await service.get_screenings_for_job(job_id)
