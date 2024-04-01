"""Question generation API endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.services.question_generator_service import QuestionGeneratorService

router = APIRouter()


class GenerateForJobRequest(BaseModel):
    job_id: int
    num_questions: int = 10


class GenerateForDomainRequest(BaseModel):
    domain_id: int
    job_title: str
    job_description: str
    experience_years: int = 3
    num_questions: int = 10


@router.post("/generate/job")
async def generate_for_job(
    data: GenerateForJobRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "interviewer")),
):
    service = QuestionGeneratorService(db)
    questions = await service.generate_for_job(data.job_id, data.num_questions)
    return {"questions": questions, "count": len(questions)}


@router.post("/generate/domain")
async def generate_for_domain(
    data: GenerateForDomainRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "interviewer")),
):
    service = QuestionGeneratorService(db)
    questions = await service.generate_for_domain(
        domain_id=data.domain_id,
        job_title=data.job_title,
        job_description=data.job_description,
        experience_years=data.experience_years,
        num_questions=data.num_questions,
    )
    return {"questions": questions, "count": len(questions)}
