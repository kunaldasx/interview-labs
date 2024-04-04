"""Interview conductor service — the heart of the application.
Manages real-time AI interview conversations with Redis session state.
"""
import json
import logging
from datetime import datetime
from typing import Optional, List

logger = logging.getLogger(__name__)

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.config import settings
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.interview import (
    Interview, InterviewQuestion, InterviewAnswer, InterviewTranscript,
    InterviewStatus, SpeakerType, MessageType, AnswerMode,
)
from app.models.candidate import Candidate
from app.models.job import JobDescription
from app.ai.chains.interview_chain import (
    get_interview_greeting,
    get_interview_response,
    get_interview_closing,
)
from app.services.question_generator_service import QuestionGeneratorService
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType, NotificationChannel
from app.tasks.email_tasks import send_interview_invite


class InterviewConductorService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self._redis: Optional[aioredis.Redis] = None

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    def _session_key(self, interview_id: int) -> str:
        return f"interview:session:{interview_id}"

    async def _get_session(self, interview_id: int) -> dict:
        r = await self._get_redis()
        data = await r.get(self._session_key(interview_id))
        if data:
            return json.loads(data)
        return {}

    async def _save_session(self, interview_id: int, session: dict):
        r = await self._get_redis()
        await r.set(
            self._session_key(interview_id),
            json.dumps(session, default=str),
            ex=7200,  # 2 hour expiry
        )

    async def create_interview(
        self,
        candidate_id: int,
        job_id: int,
        interview_type: str = "ai_chat",
        scheduled_at: Optional[datetime] = None,
        duration_limit_min: int = 30,
        language: str = "en",
        created_by: Optional[int] = None,
    ) -> Interview:
        interview = Interview(
            candidate_id=candidate_id,
            job_id=job_id,
            interview_type=interview_type,
            scheduled_at=scheduled_at,
            duration_limit_min=duration_limit_min,
            language=language,
            created_by=created_by,
        )
        self.db.add(interview)
        await self.db.flush()
        await self.db.refresh(interview)

        # Fetch candidate resume for question generation
        c_result = await self.db.execute(select(Candidate).where(Candidate.id == candidate_id))
        candidate = c_result.scalar_one_or_none()
        resume_text = candidate.resume_text if candidate else None

        # Generate questions
        qg_service = QuestionGeneratorService(self.db)
        questions_data = await qg_service.generate_for_job(
            job_id, num_questions=10, candidate_resume=resume_text
        )
        questions = await qg_service.save_generated_questions(interview.id, questions_data)

        interview.total_questions = len(questions)
        self.db.add(interview)
        await self.db.flush()

        # Send interview invite email and in-app notification
        try:
            # Fetch job title for the email
            j_result = await self.db.execute(
                select(JobDescription).where(JobDescription.id == job_id)
            )
            job = j_result.scalar_one_or_none()
            job_title = job.title if job else "the position"

            interview_link = f"{settings.FRONTEND_URL}/interviews/{interview.id}/room"

            if interview.scheduled_at:
                interview_date = interview.scheduled_at.strftime("%B %d, %Y at %I:%M %p")
            else:
                interview_date = "To be confirmed"

            if candidate and candidate.email:
                send_interview_invite.delay(
                    candidate_email=candidate.email,
                    candidate_name=candidate.full_name,
                    job_title=job_title,
                    interview_date=interview_date,
                    interview_link=interview_link,
                )

            # Create in-app notification if candidate has a user account
            if candidate and candidate.user_id:
                notification_service = NotificationService(self.db)
                await notification_service.create_notification(
                    recipient_id=candidate.user_id,
                    notification_type=NotificationType.INTERVIEW_INVITE,
                    channel=NotificationChannel.IN_APP,
                    subject=f"Interview Invitation - {job_title}",
                    body=f"You have been invited to an interview for {job_title}. Date: {interview_date}.",
                )
        except Exception:
            logger.warning(
                f"Failed to send interview notification for interview {interview.id}",
                exc_info=True,
            )

        return interview

    async def start_interview(self, interview_id: int) -> dict:
        result = await self.db.execute(
            select(Interview)
            .where(Interview.id == interview_id)
            .options(selectinload(Interview.questions))
        )
        interview = result.scalar_one_or_none()
        if not interview:
            raise NotFoundException(f"Interview {interview_id} not found")

        if interview.status not in (InterviewStatus.SCHEDULED, InterviewStatus.IN_PROGRESS):
            raise BadRequestException(f"Interview cannot be started. Status: {interview.status}")

        # Get candidate and job info
        c_result = await self.db.execute(select(Candidate).where(Candidate.id == interview.candidate_id))
        candidate = c_result.scalar_one_or_none()
        j_result = await self.db.execute(select(JobDescription).where(JobDescription.id == interview.job_id))
        job = j_result.scalar_one_or_none()

        # Generate greeting
        greeting = await get_interview_greeting(
            candidate_name=candidate.full_name if candidate else "Candidate",
            job_title=job.title if job else "the position",
            domain=job.description[:100] if job else "general",
            duration_min=interview.duration_limit_min,
        )

        # Update interview status
        interview.status = InterviewStatus.IN_PROGRESS
        interview.started_at = datetime.utcnow()
        self.db.add(interview)

        # Save greeting transcript
        transcript = InterviewTranscript(
            interview_id=interview_id,
            speaker=SpeakerType.AI,
            message_type=MessageType.TEXT,
            content=greeting,
            sequence_order=1,
        )
        self.db.add(transcript)
        await self.db.flush()

        # Initialize session in Redis
        question_list = sorted(interview.questions, key=lambda q: q.question_order)
        session = {
            "interview_id": interview_id,
            "current_question_index": 0,
            "questions": [{"id": q.id, "text": q.question_text, "type": q.question_type} for q in question_list],
            "conversation_history": [
                {"role": "assistant", "content": greeting}
            ],
            "started_at": datetime.utcnow().isoformat(),
            "sequence_counter": 2,
            "candidate_resume": (candidate.resume_text[:2000] if candidate and candidate.resume_text else None),
        }
        await self._save_session(interview_id, session)

        return {
            "interview_id": interview_id,
            "greeting": greeting,
            "total_questions": interview.total_questions,
            "duration_limit_min": interview.duration_limit_min,
        }

    async def process_message(
        self,
        interview_id: int,
        candidate_message: str,
        answer_mode: str = "text",
    ) -> dict:
        session = await self._get_session(interview_id)
        if not session:
            raise BadRequestException("Interview session not found. Start the interview first.")

        result = await self.db.execute(select(Interview).where(Interview.id == interview_id))
        interview = result.scalar_one_or_none()
        if not interview or interview.status != InterviewStatus.IN_PROGRESS:
            raise BadRequestException("Interview is not in progress.")

        questions = session.get("questions", [])
        current_idx = session.get("current_question_index", 0)
        history = session.get("conversation_history", [])
        seq = session.get("sequence_counter", 2)

        current_question = questions[current_idx]["text"] if current_idx < len(questions) else "General discussion"
        questions_remaining = len(questions) - current_idx - 1

        # Calculate time remaining
        started = datetime.fromisoformat(session["started_at"])
        elapsed = (datetime.utcnow() - started).total_seconds() / 60
        time_remaining = max(0, interview.duration_limit_min - elapsed)

        # Save candidate message as transcript
        candidate_transcript = InterviewTranscript(
            interview_id=interview_id,
            speaker=SpeakerType.CANDIDATE,
            message_type=MessageType.TEXT,
            content=candidate_message,
            sequence_order=seq,
        )
        self.db.add(candidate_transcript)
        seq += 1

        # Save answer
        if current_idx < len(questions):
            answer = InterviewAnswer(
                interview_id=interview_id,
                question_id=questions[current_idx]["id"],
                answer_text=candidate_message,
                answer_mode=AnswerMode.TEXT if answer_mode == "text" else AnswerMode.VOICE,
            )
            self.db.add(answer)
            interview.questions_asked = current_idx + 1
            self.db.add(interview)

        # Update conversation history
        history.append({"role": "user", "content": candidate_message})

        # Check if interview should end
        if time_remaining <= 0 or current_idx >= len(questions) - 1:
            c_result = await self.db.execute(select(Candidate).where(Candidate.id == interview.candidate_id))
            candidate = c_result.scalar_one_or_none()
            closing = await get_interview_closing(candidate.full_name if candidate else "Candidate")

            ai_transcript = InterviewTranscript(
                interview_id=interview_id,
                speaker=SpeakerType.AI,
                message_type=MessageType.TEXT,
                content=closing,
                sequence_order=seq,
            )
            self.db.add(ai_transcript)
            await self.db.flush()

            await self._end_interview(interview_id)

            return {
                "message": closing,
                "is_complete": True,
                "questions_asked": interview.questions_asked,
            }

        # Get AI response
        candidate_resume = session.get("candidate_resume")
        ai_response = await get_interview_response(
            conversation_history=history,
            current_question=current_question,
            candidate_response=candidate_message,
            questions_remaining=questions_remaining,
            time_remaining_min=int(time_remaining),
            candidate_resume=candidate_resume,
        )

        # Save AI response transcript
        ai_transcript = InterviewTranscript(
            interview_id=interview_id,
            speaker=SpeakerType.AI,
            message_type=MessageType.TEXT,
            content=ai_response,
            sequence_order=seq,
        )
        self.db.add(ai_transcript)
        seq += 1

        # Move to next question
        history.append({"role": "assistant", "content": ai_response})
        session["current_question_index"] = current_idx + 1
        session["conversation_history"] = history
        session["sequence_counter"] = seq
        await self._save_session(interview_id, session)

        await self.db.flush()

        return {
            "message": ai_response,
            "is_complete": False,
            "question_number": current_idx + 2,
            "total_questions": len(questions),
            "time_remaining_min": int(time_remaining),
        }

    async def _end_interview(self, interview_id: int):
        result = await self.db.execute(select(Interview).where(Interview.id == interview_id))
        interview = result.scalar_one_or_none()
        if interview:
            interview.status = InterviewStatus.COMPLETED
            interview.completed_at = datetime.utcnow()
            self.db.add(interview)
            await self.db.flush()

        # Clean up Redis session
        r = await self._get_redis()
        await r.delete(self._session_key(interview_id))

    async def end_interview(self, interview_id: int) -> Interview:
        await self._end_interview(interview_id)
        result = await self.db.execute(select(Interview).where(Interview.id == interview_id))
        return result.scalar_one_or_none()

    async def get_interview(self, interview_id: int) -> Interview:
        result = await self.db.execute(
            select(Interview)
            .where(Interview.id == interview_id)
            .options(
                selectinload(Interview.questions),
                selectinload(Interview.answers),
                selectinload(Interview.transcripts),
            )
        )
        interview = result.scalar_one_or_none()
        if not interview:
            raise NotFoundException(f"Interview {interview_id} not found")
        return interview
