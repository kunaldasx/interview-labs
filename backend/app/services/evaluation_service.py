"""Evaluation service."""
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.interview import Interview, InterviewStatus
from app.models.candidate import Candidate
from app.models.job import JobDescription
from app.models.evaluation import Evaluation, AIRecommendation, HRDecision
from app.ai.chains.evaluation_chain import run_evaluation


class EvaluationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate_interview(self, interview_id: int) -> Evaluation:
        # Check if already evaluated
        result = await self.db.execute(
            select(Evaluation).where(Evaluation.interview_id == interview_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise BadRequestException("Interview already evaluated")

        # Get interview with related data
        result = await self.db.execute(
            select(Interview)
            .where(Interview.id == interview_id)
            .options(
                selectinload(Interview.transcripts),
                selectinload(Interview.questions),
                selectinload(Interview.answers),
            )
        )
        interview = result.scalar_one_or_none()
        if not interview:
            raise NotFoundException(f"Interview {interview_id} not found")
        if interview.status != InterviewStatus.COMPLETED:
            raise BadRequestException("Interview must be completed before evaluation")

        # Get candidate and job
        c_result = await self.db.execute(select(Candidate).where(Candidate.id == interview.candidate_id))
        candidate = c_result.scalar_one_or_none()
        j_result = await self.db.execute(select(JobDescription).where(JobDescription.id == interview.job_id))
        job = j_result.scalar_one_or_none()

        # Build transcript and Q&A data
        transcript_data = [
            {"speaker": t.speaker.value, "content": t.content}
            for t in sorted(interview.transcripts, key=lambda x: x.sequence_order)
        ]

        answer_map = {a.question_id: a for a in interview.answers}
        qa_data = []
        for q in sorted(interview.questions, key=lambda x: x.question_order):
            ans = answer_map.get(q.id)
            qa_data.append({
                "question": q.question_text,
                "answer": ans.answer_text if ans else "No response",
                "question_type": q.question_type,
            })

        # Run AI evaluation
        ai_result = await run_evaluation(
            candidate_name=candidate.full_name if candidate else "Unknown",
            job_title=job.title if job else "Unknown",
            domain=job.description[:100] if job else "general",
            transcript=transcript_data,
            questions_answers=qa_data,
        )

        # Map recommendation
        rec_map = {
            "strongly_hire": AIRecommendation.STRONGLY_HIRE,
            "hire": AIRecommendation.HIRE,
            "maybe": AIRecommendation.MAYBE,
            "no_hire": AIRecommendation.NO_HIRE,
        }

        evaluation = Evaluation(
            interview_id=interview_id,
            candidate_id=interview.candidate_id,
            communication_score=ai_result.get("communication_score", 5),
            technical_score=ai_result.get("technical_score", 5),
            confidence_score=ai_result.get("confidence_score", 5),
            domain_knowledge_score=ai_result.get("domain_knowledge_score", 5),
            problem_solving_score=ai_result.get("problem_solving_score", 5),
            overall_score=ai_result.get("overall_score", 5),
            strengths={"items": ai_result.get("strengths", [])},
            weaknesses={"items": ai_result.get("weaknesses", [])},
            detailed_feedback=ai_result.get("detailed_feedback", ""),
            ai_recommendation=rec_map.get(
                ai_result.get("recommendation", "maybe"),
                AIRecommendation.MAYBE,
            ),
        )

        self.db.add(evaluation)
        await self.db.flush()
        await self.db.refresh(evaluation)
        return evaluation

    async def get_evaluation(self, evaluation_id: int) -> Evaluation:
        result = await self.db.execute(
            select(Evaluation).where(Evaluation.id == evaluation_id)
        )
        evaluation = result.scalar_one_or_none()
        if not evaluation:
            raise NotFoundException(f"Evaluation {evaluation_id} not found")
        return evaluation

    async def get_by_interview(self, interview_id: int) -> Optional[Evaluation]:
        result = await self.db.execute(
            select(Evaluation).where(Evaluation.interview_id == interview_id)
        )
        return result.scalar_one_or_none()

    async def update_hr_decision(
        self,
        evaluation_id: int,
        hr_decision: HRDecision,
        hr_notes: Optional[str] = None,
    ) -> Evaluation:
        evaluation = await self.get_evaluation(evaluation_id)
        evaluation.hr_decision = hr_decision
        evaluation.hr_notes = hr_notes
        evaluation.updated_at = datetime.utcnow()
        self.db.add(evaluation)
        await self.db.flush()
        await self.db.refresh(evaluation)
        return evaluation
