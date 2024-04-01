"""Resume screening service."""
from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.candidate import Candidate
from app.models.job import JobDescription
from app.models.resume_screening import ResumeScreening, ScreeningRecommendation
from app.ai.chains.screening_chain import run_resume_screening


class ScreeningService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def screen_candidate(self, candidate_id: int, job_id: int) -> ResumeScreening:
        # Get candidate
        result = await self.db.execute(select(Candidate).where(Candidate.id == candidate_id))
        candidate = result.scalar_one_or_none()
        if not candidate:
            raise NotFoundException(f"Candidate {candidate_id} not found")
        if not candidate.resume_text:
            raise BadRequestException("Candidate has no resume text. Upload a resume first.")

        # Get job
        result = await self.db.execute(select(JobDescription).where(JobDescription.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            raise NotFoundException(f"Job {job_id} not found")

        # Run AI screening
        skills_list = list(job.required_skills.get("skills", [])) if job.required_skills else []
        ai_result = await run_resume_screening(
            resume_text=candidate.resume_text,
            job_title=job.title,
            job_description=job.description,
            required_skills=skills_list,
            experience_min=job.experience_min,
            experience_max=job.experience_max,
            education_level=job.education_level or "",
        )

        # Map recommendation
        rec_map = {
            "strongly_recommend": ScreeningRecommendation.STRONGLY_RECOMMEND,
            "recommend": ScreeningRecommendation.RECOMMEND,
            "maybe": ScreeningRecommendation.MAYBE,
            "not_recommend": ScreeningRecommendation.NOT_RECOMMEND,
        }
        recommendation = rec_map.get(ai_result.get("recommendation", "maybe"), ScreeningRecommendation.MAYBE)

        screening = ResumeScreening(
            candidate_id=candidate_id,
            job_id=job_id,
            keyword_match_score=ai_result.get("keyword_match_score", 0),
            skill_relevance_score=ai_result.get("skill_relevance_score", 0),
            experience_match_score=ai_result.get("experience_match_score", 0),
            education_match_score=ai_result.get("education_match_score", 0),
            overall_score=ai_result.get("overall_score", 0),
            recommendation=recommendation,
            matched_skills={"skills": ai_result.get("matched_skills", [])},
            missing_skills={"skills": ai_result.get("missing_skills", [])},
            strengths={"items": ai_result.get("strengths", [])},
            concerns={"items": ai_result.get("concerns", [])},
            summary=ai_result.get("summary", ""),
        )

        self.db.add(screening)
        await self.db.flush()
        await self.db.refresh(screening)
        return screening

    async def get_screening(self, screening_id: int) -> ResumeScreening:
        result = await self.db.execute(select(ResumeScreening).where(ResumeScreening.id == screening_id))
        screening = result.scalar_one_or_none()
        if not screening:
            raise NotFoundException(f"Screening {screening_id} not found")
        return screening

    async def get_screenings_for_job(self, job_id: int) -> List[ResumeScreening]:
        result = await self.db.execute(
            select(ResumeScreening)
            .where(ResumeScreening.job_id == job_id)
            .order_by(ResumeScreening.overall_score.desc())
        )
        return result.scalars().all()

    async def get_screening_for_candidate(self, candidate_id: int, job_id: int) -> Optional[ResumeScreening]:
        result = await self.db.execute(
            select(ResumeScreening).where(
                ResumeScreening.candidate_id == candidate_id,
                ResumeScreening.job_id == job_id,
            )
        )
        return result.scalar_one_or_none()
