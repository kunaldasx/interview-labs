"""Offer letter API routes."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.core.exceptions import NotFoundException
from app.models.offer_letter import OfferLetterStatus
from app.models.user import User
from app.schemas.offer_letter import (
    OfferLetterCreate,
    OfferLetterUpdate,
    OfferLetterApproval,
    OfferLetterResponse,
    OfferLetterListResponse,
)
from app.services.offer_letter_service import OfferLetterService

router = APIRouter()


@router.get("/", response_model=OfferLetterListResponse)
async def list_offer_letters(
    status: Optional[OfferLetterStatus] = Query(default=None),
    candidate_id: Optional[int] = Query(default=None),
    job_id: Optional[int] = Query(default=None),
    interview_id: Optional[int] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.list_offers(
        status=status,
        candidate_id=candidate_id,
        job_id=job_id,
        interview_id=interview_id,
        page=page,
        page_size=page_size,
    )


@router.get("/interview/{interview_id}", response_model=OfferLetterResponse)
async def get_offer_by_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    offer = await service.get_by_interview(interview_id)
    if not offer:
        raise NotFoundException(f"No offer letter found for interview {interview_id}")
    return offer


@router.get("/{offer_id}", response_model=OfferLetterResponse)
async def get_offer_letter(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.get_offer(offer_id)


@router.post("/", response_model=OfferLetterResponse)
async def create_offer_letter(
    data: OfferLetterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.create_offer(data, created_by=current_user.id)


@router.put("/{offer_id}", response_model=OfferLetterResponse)
async def update_offer_letter(
    offer_id: int,
    data: OfferLetterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.update_offer(offer_id, data)


@router.post("/{offer_id}/submit", response_model=OfferLetterResponse)
async def submit_for_approval(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.submit_for_approval(offer_id)


@router.post("/{offer_id}/approve", response_model=OfferLetterResponse)
async def approve_or_reject(
    offer_id: int,
    data: OfferLetterApproval,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    service = OfferLetterService(db)
    return await service.approve_or_reject(
        offer_id,
        approved=data.approved,
        approved_by=current_user.id,
        rejection_reason=data.rejection_reason,
    )


@router.post("/{offer_id}/send", response_model=OfferLetterResponse)
async def send_offer_letter(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = OfferLetterService(db)
    return await service.send_offer(offer_id)
