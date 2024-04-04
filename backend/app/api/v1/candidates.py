"""Candidate API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from sqlmodel import select

from app.core.dependencies import get_db, get_current_user, require_role
from app.models.user import User
from app.models.candidate import CandidateStatus
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse
from app.services.candidate_service import CandidateService

router = APIRouter()


@router.get("/", response_model=CandidateListResponse)
async def list_candidates(
    status: Optional[CandidateStatus] = Query(None),
    job_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = CandidateService(db)
    return await service.get_all(
        status=status,
        job_id=job_id,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: int, db: AsyncSession = Depends(get_db)):
    service = CandidateService(db)
    return await service.get_by_id(candidate_id)


@router.post("/", response_model=CandidateResponse)
async def create_candidate(
    data: CandidateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Link to the candidate's own user account if one exists, otherwise null
    result = await db.execute(select(User).where(User.email == data.email))
    candidate_user = result.scalar_one_or_none()
    linked_user_id = candidate_user.id if candidate_user else None
    service = CandidateService(db)
    return await service.create(data, user_id=linked_user_id)


@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: int,
    data: CandidateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CandidateService(db)
    return await service.update(candidate_id, data)


@router.post("/{candidate_id}/resume", response_model=CandidateResponse)
async def upload_resume(
    candidate_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CandidateService(db)
    return await service.upload_resume(candidate_id, file)


@router.patch("/{candidate_id}/status", response_model=CandidateResponse)
async def update_status(
    candidate_id: int,
    status: CandidateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = CandidateService(db)
    return await service.update_status(candidate_id, status)
