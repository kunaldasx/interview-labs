"""Domain API endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.domain import DomainResponse, DomainWithQuestionsResponse, QuestionBankResponse, SectorResponse
from app.services.domain_service import DomainService

router = APIRouter()


@router.get("/", response_model=List[DomainResponse])
async def list_domains(
    sector_slug: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = DomainService(db)
    return await service.get_all(sector_slug=sector_slug)


@router.get("/sectors", response_model=List[SectorResponse])
async def list_sectors(db: AsyncSession = Depends(get_db)):
    service = DomainService(db)
    return await service.get_sectors()


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(domain_id: int, db: AsyncSession = Depends(get_db)):
    service = DomainService(db)
    return await service.get_by_id(domain_id)


@router.get("/{domain_id}/questions", response_model=List[QuestionBankResponse])
async def get_domain_questions(
    domain_id: int,
    question_type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    service = DomainService(db)
    return await service.get_questions(
        domain_id=domain_id,
        question_type=question_type,
        difficulty=difficulty,
        limit=limit,
    )


@router.get("/stats/count")
async def question_count(
    domain_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = DomainService(db)
    count = await service.count_questions(domain_id=domain_id)
    return {"count": count}
