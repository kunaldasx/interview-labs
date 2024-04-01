"""Job description service."""
from typing import Optional, List
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException
from app.models.job import JobDescription, JobStatus
from app.schemas.job import JobCreate, JobUpdate


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        status: Optional[JobStatus] = None,
        domain_id: Optional[int] = None,
        department_id: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = select(JobDescription)
        count_query = select(func.count(JobDescription.id))

        if status:
            query = query.where(JobDescription.status == status)
            count_query = count_query.where(JobDescription.status == status)
        if domain_id:
            query = query.where(JobDescription.domain_id == domain_id)
            count_query = count_query.where(JobDescription.domain_id == domain_id)
        if department_id:
            query = query.where(JobDescription.department_id == department_id)
            count_query = count_query.where(JobDescription.department_id == department_id)
        if search:
            query = query.where(JobDescription.title.ilike(f"%{search}%"))
            count_query = count_query.where(JobDescription.title.ilike(f"%{search}%"))

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(JobDescription.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)

        return {
            "items": result.scalars().all(),
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def get_by_id(self, job_id: int) -> JobDescription:
        result = await self.db.execute(select(JobDescription).where(JobDescription.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            raise NotFoundException(f"Job {job_id} not found")
        return job

    async def create(self, data: JobCreate, created_by: int) -> JobDescription:
        job = JobDescription(**data.model_dump(), created_by=created_by)
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job

    async def update(self, job_id: int, data: JobUpdate) -> JobDescription:
        job = await self.get_by_id(job_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(job, key, value)
        job.updated_at = datetime.utcnow()
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job

    async def delete(self, job_id: int) -> None:
        job = await self.get_by_id(job_id)
        await self.db.delete(job)
        await self.db.flush()
