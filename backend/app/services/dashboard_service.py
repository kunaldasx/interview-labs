"""Dashboard service for HR analytics."""
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.models.candidate import Candidate, CandidateStatus
from app.models.interview import Interview, InterviewStatus
from app.models.evaluation import Evaluation, HRDecision
from app.models.job import JobDescription, JobStatus


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_kpis(self) -> dict:
        total_candidates = (await self.db.execute(
            select(func.count(Candidate.id))
        )).scalar_one()

        active_jobs = (await self.db.execute(
            select(func.count(JobDescription.id)).where(JobDescription.status == JobStatus.OPEN)
        )).scalar_one()

        total_interviews = (await self.db.execute(
            select(func.count(Interview.id))
        )).scalar_one()

        completed_interviews = (await self.db.execute(
            select(func.count(Interview.id)).where(Interview.status == InterviewStatus.COMPLETED)
        )).scalar_one()

        pending_evaluations = (await self.db.execute(
            select(func.count(Evaluation.id)).where(Evaluation.hr_decision == HRDecision.PENDING)
        )).scalar_one()

        avg_score = (await self.db.execute(
            select(func.avg(Evaluation.overall_score))
        )).scalar_one()

        return {
            "total_candidates": total_candidates,
            "active_jobs": active_jobs,
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "pending_evaluations": pending_evaluations,
            "average_score": round(float(avg_score or 0), 2),
        }

    async def get_upcoming_interviews(self, limit: int = 10) -> List[Interview]:
        result = await self.db.execute(
            select(Interview)
            .where(
                Interview.status == InterviewStatus.SCHEDULED,
                Interview.scheduled_at >= datetime.utcnow(),
            )
            .order_by(Interview.scheduled_at.asc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_pending_reviews(self, limit: int = 10) -> List[Evaluation]:
        result = await self.db.execute(
            select(Evaluation)
            .where(Evaluation.hr_decision == HRDecision.PENDING)
            .order_by(Evaluation.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_hiring_trends(self, days: int = 30) -> List[dict]:
        start_date = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.date(Interview.created_at).label("date"),
                func.count(Interview.id).label("count"),
            )
            .where(Interview.created_at >= start_date)
            .group_by(func.date(Interview.created_at))
            .order_by(func.date(Interview.created_at))
        )
        return [{"date": str(row.date), "count": row.count} for row in result.all()]

    async def get_status_distribution(self) -> List[dict]:
        result = await self.db.execute(
            select(
                Candidate.status,
                func.count(Candidate.id).label("count"),
            ).group_by(Candidate.status)
        )
        return [{"status": row.status, "count": row.count} for row in result.all()]

    async def get_time_to_hire(self) -> List[dict]:
        result = await self.db.execute(
            select(
                JobDescription.id.label("job_id"),
                JobDescription.title.label("job_title"),
                func.avg(
                    func.extract("epoch", Candidate.updated_at)
                    - func.extract("epoch", Candidate.created_at)
                ).label("avg_seconds"),
                func.count(Candidate.id).label("hire_count"),
            )
            .join(JobDescription, Candidate.job_id == JobDescription.id)
            .where(Candidate.status == CandidateStatus.HIRED)
            .group_by(JobDescription.id, JobDescription.title)
        )
        return [
            {
                "job_title": row.job_title,
                "avg_days": round(float(row.avg_seconds or 0) / 86400, 1),
                "hire_count": row.hire_count,
            }
            for row in result.all()
        ]

    async def get_interview_completion_rate(self) -> dict:
        total = (await self.db.execute(
            select(func.count(Interview.id))
        )).scalar_one()

        completed = (await self.db.execute(
            select(func.count(Interview.id)).where(Interview.status == InterviewStatus.COMPLETED)
        )).scalar_one()

        scheduled = (await self.db.execute(
            select(func.count(Interview.id)).where(Interview.status == InterviewStatus.SCHEDULED)
        )).scalar_one()

        cancelled = (await self.db.execute(
            select(func.count(Interview.id)).where(Interview.status == InterviewStatus.CANCELLED)
        )).scalar_one()

        return {
            "total": total,
            "completed": completed,
            "scheduled": scheduled,
            "cancelled": cancelled,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
        }

    async def get_score_distribution(self, job_id: int = None) -> List[dict]:
        query = (
            select(
                Candidate.full_name.label("candidate_name"),
                Evaluation.overall_score,
                Evaluation.communication_score,
                Evaluation.technical_score,
                Evaluation.confidence_score,
                Evaluation.domain_knowledge_score,
                Evaluation.problem_solving_score,
            )
            .join(Interview, Evaluation.interview_id == Interview.id)
            .join(Candidate, Evaluation.candidate_id == Candidate.id)
        )
        if job_id:
            query = query.where(Interview.job_id == job_id)
        result = await self.db.execute(query)
        return [
            {
                "candidate_name": row.candidate_name,
                "overall_score": float(row.overall_score or 0),
                "communication_score": float(row.communication_score or 0),
                "technical_score": float(row.technical_score or 0),
                "confidence_score": float(row.confidence_score or 0),
                "domain_knowledge_score": float(row.domain_knowledge_score or 0),
                "problem_solving_score": float(row.problem_solving_score or 0),
            }
            for row in result.all()
        ]
