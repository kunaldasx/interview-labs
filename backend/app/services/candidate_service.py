"""Candidate management service."""
from typing import Optional
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.candidate import Candidate, CandidateStatus
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.utils.file_handler import validate_file, save_upload, extract_resume_text


class CandidateService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        status: Optional[CandidateStatus] = None,
        job_id: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = select(Candidate)
        count_query = select(func.count(Candidate.id))

        if status:
            query = query.where(Candidate.status == status)
            count_query = count_query.where(Candidate.status == status)
        if job_id:
            query = query.where(Candidate.job_id == job_id)
            count_query = count_query.where(Candidate.job_id == job_id)
        if search:
            query = query.where(
                (Candidate.full_name.ilike(f"%{search}%")) |
                (Candidate.email.ilike(f"%{search}%"))
            )
            count_query = count_query.where(
                (Candidate.full_name.ilike(f"%{search}%")) |
                (Candidate.email.ilike(f"%{search}%"))
            )

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(Candidate.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)

        return {
            "items": result.scalars().all(),
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def get_by_id(self, candidate_id: int) -> Candidate:
        result = await self.db.execute(select(Candidate).where(Candidate.id == candidate_id))
        candidate = result.scalar_one_or_none()
        if not candidate:
            raise NotFoundException(f"Candidate {candidate_id} not found")
        return candidate

    async def create(self, data: CandidateCreate, user_id: Optional[int] = None) -> Candidate:
        candidate = Candidate(**data.model_dump(), user_id=user_id)
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

    async def update(self, candidate_id: int, data: CandidateUpdate) -> Candidate:
        candidate = await self.get_by_id(candidate_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(candidate, key, value)
        candidate.updated_at = datetime.utcnow()
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

    async def upload_resume(self, candidate_id: int, file: UploadFile) -> Candidate:
        if not validate_file(file):
            raise BadRequestException("Invalid file type. Only PDF and DOCX are allowed.")

        candidate = await self.get_by_id(candidate_id)
        file_path = await save_upload(file, subdir="resumes")
        resume_text = extract_resume_text(file_path)

        candidate.resume_path = file_path
        candidate.resume_text = resume_text
        candidate.updated_at = datetime.utcnow()
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

    async def update_status(self, candidate_id: int, status: CandidateStatus) -> Candidate:
        candidate = await self.get_by_id(candidate_id)
        candidate.status = status
        candidate.updated_at = datetime.utcnow()
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate
