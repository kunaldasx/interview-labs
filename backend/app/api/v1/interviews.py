"""Interview REST API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.dependencies import get_db, get_current_user, require_role
from app.models.user import User
from app.models.interview import Interview, InterviewStatus
from app.schemas.interview import (
    InterviewCreate, InterviewUpdate, InterviewResponse,
    InterviewListResponse, InterviewDetailResponse, ChatMessage, ChatResponse,
)
from app.services.interview_conductor_service import InterviewConductorService

router = APIRouter()


@router.get("/", response_model=InterviewListResponse)
async def list_interviews(
    status: Optional[InterviewStatus] = Query(None),
    candidate_id: Optional[int] = Query(None),
    job_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Interview)
    count_query = select(func.count(Interview.id))

    if status:
        query = query.where(Interview.status == status)
        count_query = count_query.where(Interview.status == status)
    if candidate_id:
        query = query.where(Interview.candidate_id == candidate_id)
        count_query = count_query.where(Interview.candidate_id == candidate_id)
    if job_id:
        query = query.where(Interview.job_id == job_id)
        count_query = count_query.where(Interview.job_id == job_id)

    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Interview.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{interview_id}", response_model=InterviewDetailResponse)
async def get_interview(interview_id: int, db: AsyncSession = Depends(get_db)):
    service = InterviewConductorService(db)
    return await service.get_interview(interview_id)


@router.post("/", response_model=InterviewResponse)
async def create_interview(
    data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = InterviewConductorService(db)
    return await service.create_interview(
        candidate_id=data.candidate_id,
        job_id=data.job_id,
        interview_type=data.interview_type.value,
        duration_limit_min=data.duration_limit_min,
        language=data.language,
        created_by=current_user.id,
    )


@router.post("/{interview_id}/start")
async def start_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = InterviewConductorService(db)
    return await service.start_interview(interview_id)


@router.post("/{interview_id}/message")
async def send_message(
    interview_id: int,
    data: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = InterviewConductorService(db)
    return await service.process_message(
        interview_id=interview_id,
        candidate_message=data.content,
        answer_mode=data.message_type,
    )


@router.post("/{interview_id}/end")
async def end_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = InterviewConductorService(db)
    interview = await service.end_interview(interview_id)
    return {"message": "Interview ended", "interview_id": interview_id}
