"""Evaluation API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.evaluation import EvaluationTrigger, EvaluationResponse, HRDecisionUpdate
from app.services.evaluation_service import EvaluationService

router = APIRouter()


@router.post("/", response_model=EvaluationResponse)
async def evaluate_interview(
    data: EvaluationTrigger,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = EvaluationService(db)
    return await service.evaluate_interview(data.interview_id)


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = EvaluationService(db)
    return await service.get_evaluation(evaluation_id)


@router.get("/interview/{interview_id}", response_model=EvaluationResponse)
async def get_evaluation_by_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = EvaluationService(db)
    evaluation = await service.get_by_interview(interview_id)
    if not evaluation:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"No evaluation for interview {interview_id}")
    return evaluation


@router.put("/{evaluation_id}/decision", response_model=EvaluationResponse)
async def update_hr_decision(
    evaluation_id: int,
    data: HRDecisionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = EvaluationService(db)
    return await service.update_hr_decision(
        evaluation_id=evaluation_id,
        hr_decision=data.hr_decision,
        hr_notes=data.hr_notes,
    )
