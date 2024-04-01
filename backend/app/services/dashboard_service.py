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
