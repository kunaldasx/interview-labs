"""Report generation service."""
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models.candidate import Candidate
from app.models.evaluation import Evaluation
from app.models.interview import Interview
from app.models.job import JobDescription
from app.utils.pdf_generator import generate_candidate_report
from app.utils.excel_generator import generate_candidates_excel, generate_evaluation_excel, generate_pipeline_excel


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_evaluation_pdf(self, evaluation_id: int) -> bytes:
        result = await self.db.execute(
            select(Evaluation).where(Evaluation.id == evaluation_id)
        )
        evaluation = result.scalar_one_or_none()
        if not evaluation:
            raise ValueError(f"Evaluation {evaluation_id} not found")

        c_result = await self.db.execute(select(Candidate).where(Candidate.id == evaluation.candidate_id))
        candidate = c_result.scalar_one_or_none()

        i_result = await self.db.execute(select(Interview).where(Interview.id == evaluation.interview_id))
        interview = i_result.scalar_one_or_none()

        j_result = await self.db.execute(select(JobDescription).where(JobDescription.id == interview.job_id)) if interview else None
        job = j_result.scalar_one_or_none() if j_result else None

        eval_dict = {
            "communication_score": evaluation.communication_score,
            "technical_score": evaluation.technical_score,
            "confidence_score": evaluation.confidence_score,
            "domain_knowledge_score": evaluation.domain_knowledge_score,
            "problem_solving_score": evaluation.problem_solving_score,
            "overall_score": evaluation.overall_score,
            "strengths": evaluation.strengths.get("items", []) if evaluation.strengths else [],
            "weaknesses": evaluation.weaknesses.get("items", []) if evaluation.weaknesses else [],
            "detailed_feedback": evaluation.detailed_feedback or "",
            "ai_recommendation": evaluation.ai_recommendation.value,
            "hr_decision": evaluation.hr_decision.value,
        }

        return generate_candidate_report(
            candidate_name=candidate.full_name if candidate else "Unknown",
            job_title=job.title if job else "Unknown",
            evaluation=eval_dict,
            interview_date=evaluation.evaluated_at.strftime("%Y-%m-%d"),
        )

    async def generate_candidates_report(self, job_id: int = None) -> bytes:
        query = select(Candidate)
        if job_id:
            query = query.where(Candidate.job_id == job_id)
        query = query.order_by(Candidate.created_at.desc())
        result = await self.db.execute(query)
        candidates = result.scalars().all()

        data = []
        for c in candidates:
            data.append({
                "id": c.id,
                "full_name": c.full_name,
                "email": c.email,
                "phone": c.phone or "",
                "job_title": "",
                "experience_years": c.experience_years or 0,
                "status": c.status.value,
                "created_at": c.created_at.strftime("%Y-%m-%d"),
            })

        return generate_candidates_excel(data)

    async def generate_pipeline_report(self, job_id: int = None) -> bytes:
        from datetime import datetime as dt

        query = (
            select(Candidate, Evaluation, JobDescription)
            .outerjoin(Evaluation, Candidate.id == Evaluation.candidate_id)
            .outerjoin(JobDescription, Candidate.job_id == JobDescription.id)
        )
        if job_id:
            query = query.where(Candidate.job_id == job_id)
        query = query.order_by(Candidate.created_at.desc())
        result = await self.db.execute(query)
        rows = result.all()

        data = []
        now = dt.utcnow()
        for candidate, evaluation, job in rows:
            days_in_pipeline = (now - candidate.created_at).days
            data.append({
                "id": candidate.id,
                "full_name": candidate.full_name,
                "email": candidate.email,
                "phone": candidate.phone or "",
                "job_title": job.title if job else "",
                "status": candidate.status.value,
                "experience_years": candidate.experience_years or 0,
                "communication_score": evaluation.communication_score if evaluation else "",
                "technical_score": evaluation.technical_score if evaluation else "",
                "confidence_score": evaluation.confidence_score if evaluation else "",
                "domain_knowledge_score": evaluation.domain_knowledge_score if evaluation else "",
                "problem_solving_score": evaluation.problem_solving_score if evaluation else "",
                "overall_score": evaluation.overall_score if evaluation else "",
                "ai_recommendation": evaluation.ai_recommendation.value if evaluation else "",
                "created_at": candidate.created_at.strftime("%Y-%m-%d"),
                "days_in_pipeline": days_in_pipeline,
            })

        return generate_pipeline_excel(data)

    async def generate_evaluations_report(self, job_id: int = None) -> bytes:
        query = select(Evaluation)
        result = await self.db.execute(query.order_by(Evaluation.created_at.desc()))
        evaluations = result.scalars().all()

        data = []
        for e in evaluations:
            data.append({
                "id": e.id,
                "candidate_name": "",
                "job_title": "",
                "communication_score": e.communication_score,
                "technical_score": e.technical_score,
                "confidence_score": e.confidence_score,
                "domain_knowledge_score": e.domain_knowledge_score,
                "problem_solving_score": e.problem_solving_score,
                "overall_score": e.overall_score,
                "ai_recommendation": e.ai_recommendation.value,
                "hr_decision": e.hr_decision.value,
                "evaluated_at": e.evaluated_at.strftime("%Y-%m-%d"),
            })

        return generate_evaluation_excel(data)
