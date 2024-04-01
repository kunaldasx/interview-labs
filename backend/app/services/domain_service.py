"""Domain and question bank service."""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException
from app.models.domain import Domain, QuestionBank


class DomainService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, sector_slug: Optional[str] = None) -> List[Domain]:
        query = select(Domain).where(Domain.is_active == True)
        if sector_slug:
            query = query.where(Domain.sector_slug == sector_slug)
        query = query.order_by(Domain.sector, Domain.name)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, domain_id: int) -> Domain:
        result = await self.db.execute(select(Domain).where(Domain.id == domain_id))
        domain = result.scalar_one_or_none()
        if not domain:
            raise NotFoundException(f"Domain {domain_id} not found")
        return domain

    async def get_sectors(self) -> List[dict]:
        query = select(
            Domain.sector,
            Domain.sector_slug,
            func.count(Domain.id).label("domain_count"),
        ).where(Domain.is_active == True).group_by(Domain.sector, Domain.sector_slug)
        result = await self.db.execute(query)
        return [
            {"sector": row.sector, "sector_slug": row.sector_slug, "domain_count": row.domain_count}
            for row in result.all()
        ]

    async def get_questions(
        self,
        domain_id: int,
        question_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        limit: int = 50,
    ) -> List[QuestionBank]:
        query = select(QuestionBank).where(QuestionBank.domain_id == domain_id)
        if question_type:
            query = query.where(QuestionBank.question_type == question_type)
        if difficulty:
            query = query.where(QuestionBank.difficulty == difficulty)
        query = query.limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count_questions(self, domain_id: Optional[int] = None) -> int:
        query = select(func.count(QuestionBank.id))
        if domain_id:
            query = query.where(QuestionBank.domain_id == domain_id)
        result = await self.db.execute(query)
        return result.scalar_one()
