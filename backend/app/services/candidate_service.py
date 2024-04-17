"""Candidate management service."""
import logging
from typing import Optional
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.candidate import Candidate, CandidateStatus, WorkExperience
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.utils.file_handler import validate_file, save_upload, extract_resume_text
from app.ai.openai_client import ai_client
from app.ai.prompts.resume_parsing import RESUME_PARSE_SYSTEM, build_resume_parse_prompt

logger = logging.getLogger(__name__)


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
        query = query.options(selectinload(Candidate.work_experiences), selectinload(Candidate.domain))
        result = await self.db.execute(query)

        return {
            "items": result.scalars().all(),
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def get_by_id(self, candidate_id: int) -> Candidate:
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.id == candidate_id)
            .options(selectinload(Candidate.work_experiences), selectinload(Candidate.domain))
        )
        candidate = result.scalar_one_or_none()
        if not candidate:
            raise NotFoundException(f"Candidate {candidate_id} not found")
        return candidate

    async def create(self, data: CandidateCreate, user_id: Optional[int] = None) -> Candidate:
        # Extract work_experiences before creating candidate
        create_data = data.model_dump(exclude={"work_experiences"})
        candidate = Candidate(**create_data, user_id=user_id)
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)

        # Save work experiences if provided
        if data.work_experiences:
            await self.save_work_experiences(
                candidate.id,
                [exp.model_dump() for exp in data.work_experiences],
            )

        # Reload with relationships
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.id == candidate.id)
            .options(selectinload(Candidate.work_experiences), selectinload(Candidate.domain))
        )
        return result.scalar_one()

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

        # Reload with relationships
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.id == candidate_id)
            .options(selectinload(Candidate.work_experiences), selectinload(Candidate.domain))
        )
        return result.scalar_one()

    async def parse_resume(self, file: UploadFile) -> dict:
        """Upload a resume file, extract text, and use AI to parse structured fields."""
        if not validate_file(file):
            raise BadRequestException("Invalid file type. Only PDF and DOCX are allowed.")

        file_path = await save_upload(file, subdir="resumes")
        resume_text = extract_resume_text(file_path)

        empty_response = {
            "full_name": "",
            "email": "",
            "phone": "",
            "address": "",
            "date_of_birth": "",
            "linkedin_url": "",
            "portfolio_url": "",
            "experience_years": 0,
            "education": "",
            "skills": [],
            "work_experiences": [],
            "resume_path": file_path,
            "resume_text": resume_text or "",
        }

        if not resume_text.strip():
            return empty_response

        try:
            prompt = build_resume_parse_prompt(resume_text)
            messages = [
                {"role": "system", "content": RESUME_PARSE_SYSTEM},
                {"role": "user", "content": prompt},
            ]
            parsed = await ai_client.chat_completion_json(
                messages=messages, temperature=0.1, max_tokens=3000
            )
        except Exception as e:
            logger.warning("AI resume parsing failed: %s", e)
            return empty_response

        # Normalize work experiences
        work_exps = []
        for exp in parsed.get("work_experiences", []):
            work_exps.append({
                "company_name": exp.get("company_name", ""),
                "job_title": exp.get("job_title", ""),
                "start_date": exp.get("start_date", ""),
                "end_date": exp.get("end_date", ""),
                "is_current": bool(exp.get("is_current", False)),
                "location": exp.get("location", ""),
                "description": exp.get("description", ""),
            })

        return {
            "full_name": parsed.get("full_name", ""),
            "email": parsed.get("email", ""),
            "phone": parsed.get("phone", ""),
            "address": parsed.get("address", ""),
            "date_of_birth": parsed.get("date_of_birth", ""),
            "linkedin_url": parsed.get("linkedin_url", ""),
            "portfolio_url": parsed.get("portfolio_url", ""),
            "experience_years": parsed.get("experience_years", 0),
            "education": parsed.get("education", ""),
            "skills": parsed.get("skills", []),
            "work_experiences": work_exps,
            "resume_path": file_path,
            "resume_text": resume_text,
        }

    async def save_work_experiences(
        self, candidate_id: int, work_experiences: list[dict]
    ) -> list[WorkExperience]:
        """Save parsed work experience records for a candidate."""
        saved = []
        for exp in work_experiences:
            we = WorkExperience(
                candidate_id=candidate_id,
                company_name=exp.get("company_name", ""),
                job_title=exp.get("job_title", ""),
                start_date=exp.get("start_date"),
                end_date=exp.get("end_date"),
                is_current=exp.get("is_current", False),
                location=exp.get("location"),
                description=exp.get("description"),
            )
            self.db.add(we)
            saved.append(we)
        await self.db.flush()
        for we in saved:
            await self.db.refresh(we)
        return saved

    async def update_status(self, candidate_id: int, status: CandidateStatus) -> Candidate:
        candidate = await self.get_by_id(candidate_id)
        candidate.status = status
        candidate.updated_at = datetime.utcnow()
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate
