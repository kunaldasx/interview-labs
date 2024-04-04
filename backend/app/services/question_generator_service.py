"""Question generation service."""
import logging
import random
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException
from app.models.domain import Domain, QuestionBank
from app.models.job import JobDescription
from app.models.interview import InterviewQuestion
from app.ai.chains.question_chain import generate_interview_questions

logger = logging.getLogger(__name__)


class QuestionGeneratorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _fallback_from_question_bank(
        self, domain_id: Optional[int], num_questions: int
    ) -> List[dict]:
        """Pick random pre-seeded questions from the question bank."""
        query = select(QuestionBank).where(QuestionBank.is_active == True)
        if domain_id:
            query = query.where(QuestionBank.domain_id == domain_id)
        query = query.order_by(func.random()).limit(num_questions)
        result = await self.db.execute(query)
        rows = result.scalars().all()
        return [
            {
                "question_text": q.question_text,
                "question_type": q.question_type.value if q.question_type else "technical",
                "difficulty": q.difficulty.value if q.difficulty else "medium",
                "expected_answer": q.expected_answer,
                "keywords": q.keywords.get("keywords", []) if q.keywords else [],
            }
            for q in rows
        ]

    async def generate_for_job(
        self,
        job_id: int,
        num_questions: int = 10,
    ) -> List[dict]:
        result = await self.db.execute(select(JobDescription).where(JobDescription.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            raise NotFoundException(f"Job {job_id} not found")

        domain_name = "General"
        sector_name = "General"
        if job.domain_id:
            result = await self.db.execute(select(Domain).where(Domain.id == job.domain_id))
            domain = result.scalar_one_or_none()
            if domain:
                domain_name = domain.name
                sector_name = domain.sector

        # Try AI generation first, fall back to question bank
        try:
            existing = []
            if job.domain_id:
                result = await self.db.execute(
                    select(QuestionBank.question_text)
                    .where(QuestionBank.domain_id == job.domain_id)
                    .limit(50)
                )
                existing = [row[0] for row in result.all()]

            questions = await generate_interview_questions(
                domain=domain_name,
                sector=sector_name,
                job_title=job.title,
                job_description=job.description,
                experience_years=job.experience_min,
                num_questions=num_questions,
                existing_questions=existing,
            )
            return questions
        except Exception as e:
            logger.warning("AI question generation failed, using question bank: %s", e)
            return await self._fallback_from_question_bank(job.domain_id, num_questions)

    async def generate_for_domain(
        self,
        domain_id: int,
        job_title: str,
        job_description: str,
        experience_years: int = 3,
        num_questions: int = 10,
    ) -> List[dict]:
        result = await self.db.execute(select(Domain).where(Domain.id == domain_id))
        domain = result.scalar_one_or_none()
        if not domain:
            raise NotFoundException(f"Domain {domain_id} not found")

        result = await self.db.execute(
            select(QuestionBank.question_text)
            .where(QuestionBank.domain_id == domain_id)
            .limit(50)
        )
        existing = [row[0] for row in result.all()]

        return await generate_interview_questions(
            domain=domain.name,
            sector=domain.sector,
            job_title=job_title,
            job_description=job_description,
            experience_years=experience_years,
            num_questions=num_questions,
            existing_questions=existing,
        )

    async def save_generated_questions(
        self,
        interview_id: int,
        questions: List[dict],
    ) -> List[InterviewQuestion]:
        saved = []
        for idx, q in enumerate(questions):
            iq = InterviewQuestion(
                interview_id=interview_id,
                question_text=q.get("question_text", ""),
                question_type=q.get("question_type", "technical"),
                difficulty=q.get("difficulty", "medium"),
                question_order=idx + 1,
                expected_answer=q.get("expected_answer"),
                keywords={"keywords": q.get("keywords", [])},
            )
            self.db.add(iq)
            saved.append(iq)
        await self.db.flush()
        for iq in saved:
            await self.db.refresh(iq)
        return saved
