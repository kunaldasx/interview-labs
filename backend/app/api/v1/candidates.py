"""Candidate API endpoints."""
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from sqlmodel import select

from app.core.dependencies import get_db, get_current_user, require_role
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.candidate import CandidateStatus
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse
from app.services.candidate_service import CandidateService
from app.tasks.email_tasks import send_credentials_email

router = APIRouter()


@router.get("/", response_model=CandidateListResponse)
async def list_candidates(
    status: Optional[CandidateStatus] = Query(None),
    job_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
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
    # Link to existing user or auto-create one with role=CANDIDATE
    result = await db.execute(select(User).where(User.email == data.email))
    candidate_user = result.scalar_one_or_none()

    if not candidate_user:
        candidate_user = User(
            email=data.email,
            hashed_password=get_password_hash(secrets.token_urlsafe(16)),
            full_name=data.full_name,
            phone=data.phone,
            role=UserRole.CANDIDATE,
        )
        db.add(candidate_user)
        await db.flush()

    service = CandidateService(db)
    return await service.create(data, user_id=candidate_user.id)


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
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = CandidateService(db)
    candidate = await service.update_status(candidate_id, status)

    # Send login credentials when HR verifies (screens or shortlists)
    if status in (CandidateStatus.SCREENED, CandidateStatus.SHORTLISTED) and candidate.user_id:
        result = await db.execute(select(User).where(User.id == candidate.user_id))
        user = result.scalar_one_or_none()
        if user:
            temp_password = secrets.token_urlsafe(6)  # ~8 chars
            user.hashed_password = get_password_hash(temp_password)
            db.add(user)
            await db.flush()

            login_url = "https://hireez.online/login"
            send_credentials_email.delay(
                candidate.email, candidate.full_name, temp_password, login_url
            )

    return candidate
