"""Offer letter service."""
from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.candidate import Candidate, CandidateStatus
from app.models.evaluation import Evaluation, AIRecommendation, HRDecision
from app.models.interview import Interview
from app.models.job import JobDescription
from app.models.notification import NotificationType, NotificationChannel
from app.models.offer_letter import OfferLetter, OfferLetterStatus
from app.models.user import User, UserRole
from app.schemas.offer_letter import (
    OfferLetterCreate,
    OfferLetterUpdate,
    OfferLetterResponse,
)
from app.services.notification_service import NotificationService
from app.tasks.email_tasks import send_offer_letter_email


class OfferLetterService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_response(self, offer: OfferLetter) -> OfferLetterResponse:
        candidate_name = offer.candidate.full_name if offer.candidate else None
        candidate_email = offer.candidate.email if offer.candidate else None
        job_title = offer.job.title if offer.job else None
        return OfferLetterResponse(
            **{
                k: v
                for k, v in offer.__dict__.items()
                if not k.startswith("_") and k not in ("candidate", "job", "interview", "creator", "approver")
            },
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            job_title=job_title,
        )

    async def _get_offer(self, offer_id: int) -> OfferLetter:
        result = await self.db.execute(
            select(OfferLetter)
            .where(OfferLetter.id == offer_id)
            .options(
                selectinload(OfferLetter.candidate),
                selectinload(OfferLetter.job),
            )
        )
        offer = result.scalar_one_or_none()
        if not offer:
            raise NotFoundException(f"Offer letter {offer_id} not found")
        return offer

    async def create_offer(
        self, data: OfferLetterCreate, created_by: int
    ) -> OfferLetterResponse:
        # Validate: interview exists and has a HIRE/STRONGLY_HIRE evaluation with APPROVED hr_decision
        result = await self.db.execute(
            select(Interview)
            .where(Interview.id == data.interview_id)
            .options(selectinload(Interview.candidate), selectinload(Interview.job))
        )
        interview = result.scalar_one_or_none()
        if not interview:
            raise NotFoundException(f"Interview {data.interview_id} not found")

        eval_result = await self.db.execute(
            select(Evaluation).where(Evaluation.interview_id == data.interview_id)
        )
        evaluation = eval_result.scalar_one_or_none()
        if not evaluation:
            raise BadRequestException("No evaluation found for this interview")

        if evaluation.ai_recommendation not in (
            AIRecommendation.HIRE,
            AIRecommendation.STRONGLY_HIRE,
        ):
            raise BadRequestException(
                "Offer letters can only be created for HIRE or STRONGLY_HIRE recommendations"
            )

        if evaluation.hr_decision != HRDecision.APPROVED:
            raise BadRequestException(
                "HR decision must be APPROVED before creating an offer letter"
            )

        # Check for existing offer letter for this interview
        existing = await self.db.execute(
            select(OfferLetter).where(OfferLetter.interview_id == data.interview_id)
        )
        if existing.scalar_one_or_none():
            raise BadRequestException("An offer letter already exists for this interview")

        offer = OfferLetter(
            interview_id=data.interview_id,
            candidate_id=interview.candidate_id,
            job_id=interview.job_id,
            created_by=created_by,
            salary=data.salary,
            currency=data.currency,
            start_date=data.start_date,
            end_date=data.end_date,
            benefits=data.benefits,
            reporting_manager=data.reporting_manager,
            department=data.department,
            location=data.location,
            additional_terms=data.additional_terms,
            status=OfferLetterStatus.DRAFT,
        )
        self.db.add(offer)
        await self.db.flush()
        await self.db.refresh(offer)

        # Reload with relationships
        return self._to_response(await self._get_offer(offer.id))

    async def update_offer(
        self, offer_id: int, data: OfferLetterUpdate
    ) -> OfferLetterResponse:
        offer = await self._get_offer(offer_id)
        if offer.status != OfferLetterStatus.DRAFT:
            raise BadRequestException("Only draft offer letters can be edited")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(offer, key, value)
        offer.updated_at = datetime.utcnow()

        self.db.add(offer)
        await self.db.flush()
        await self.db.refresh(offer)
        return self._to_response(await self._get_offer(offer.id))

    async def submit_for_approval(self, offer_id: int) -> OfferLetterResponse:
        offer = await self._get_offer(offer_id)
        if offer.status != OfferLetterStatus.DRAFT:
            raise BadRequestException("Only draft offer letters can be submitted for approval")

        offer.status = OfferLetterStatus.PENDING_APPROVAL
        offer.updated_at = datetime.utcnow()
        self.db.add(offer)
        await self.db.flush()

        # Notify all SuperAdmins
        admin_result = await self.db.execute(
            select(User).where(User.role == UserRole.SUPER_ADMIN, User.is_active == True)
        )
        admins = admin_result.scalars().all()
        notification_svc = NotificationService(self.db)

        candidate_name = offer.candidate.full_name if offer.candidate else "Unknown"
        job_title = offer.job.title if offer.job else "Unknown"

        for admin in admins:
            await notification_svc.create_notification(
                recipient_id=admin.id,
                notification_type=NotificationType.OFFER_LETTER,
                channel=NotificationChannel.IN_APP,
                subject="Offer Letter Pending Approval",
                body=f"An offer letter for {candidate_name} ({job_title}) requires your approval.",
                metadata={"offer_letter_id": offer.id},
            )

        await self.db.refresh(offer)
        return self._to_response(await self._get_offer(offer.id))

    async def approve_or_reject(
        self,
        offer_id: int,
        approved: bool,
        approved_by: int,
        rejection_reason: Optional[str] = None,
    ) -> OfferLetterResponse:
        offer = await self._get_offer(offer_id)
        if offer.status != OfferLetterStatus.PENDING_APPROVAL:
            raise BadRequestException("Only pending offer letters can be approved or rejected")

        if approved:
            offer.status = OfferLetterStatus.APPROVED
            offer.approved_by = approved_by
            offer.approved_at = datetime.utcnow()

            # Update candidate status to OFFERED
            candidate_result = await self.db.execute(
                select(Candidate).where(Candidate.id == offer.candidate_id)
            )
            candidate = candidate_result.scalar_one_or_none()
            if candidate:
                candidate.status = CandidateStatus.OFFERED
                candidate.updated_at = datetime.utcnow()
                self.db.add(candidate)
        else:
            offer.status = OfferLetterStatus.REJECTED
            offer.rejection_reason = rejection_reason

        offer.updated_at = datetime.utcnow()
        self.db.add(offer)
        await self.db.flush()

        # Notify the HR who created the offer
        notification_svc = NotificationService(self.db)
        status_text = "approved" if approved else "rejected"
        candidate_name = offer.candidate.full_name if offer.candidate else "Unknown"

        await notification_svc.create_notification(
            recipient_id=offer.created_by,
            notification_type=NotificationType.OFFER_LETTER,
            channel=NotificationChannel.IN_APP,
            subject=f"Offer Letter {status_text.title()}",
            body=f"The offer letter for {candidate_name} has been {status_text}.",
            metadata={"offer_letter_id": offer.id},
        )

        await self.db.refresh(offer)
        return self._to_response(await self._get_offer(offer.id))

    async def send_offer(self, offer_id: int) -> OfferLetterResponse:
        offer = await self._get_offer(offer_id)
        if offer.status != OfferLetterStatus.APPROVED:
            raise BadRequestException("Only approved offer letters can be sent")

        candidate_email = offer.candidate.email if offer.candidate else None
        if not candidate_email:
            raise BadRequestException("Candidate email not found")

        candidate_name = offer.candidate.full_name if offer.candidate else "Candidate"
        job_title = offer.job.title if offer.job else "Position"

        send_offer_letter_email.delay(
            candidate_email=candidate_email,
            candidate_name=candidate_name,
            job_title=job_title,
            salary=str(offer.salary),
            currency=offer.currency,
            start_date=offer.start_date.isoformat(),
            benefits=offer.benefits,
            reporting_manager=offer.reporting_manager,
            department=offer.department,
            location=offer.location,
            additional_terms=offer.additional_terms or "",
        )

        offer.status = OfferLetterStatus.SENT
        offer.sent_at = datetime.utcnow()
        offer.updated_at = datetime.utcnow()
        self.db.add(offer)
        await self.db.flush()
        await self.db.refresh(offer)
        return self._to_response(await self._get_offer(offer.id))

    async def get_offer(self, offer_id: int) -> OfferLetterResponse:
        offer = await self._get_offer(offer_id)
        return self._to_response(offer)

    async def list_offers(
        self,
        status: Optional[OfferLetterStatus] = None,
        candidate_id: Optional[int] = None,
        job_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = select(OfferLetter).options(
            selectinload(OfferLetter.candidate),
            selectinload(OfferLetter.job),
        )
        count_query = select(func.count(OfferLetter.id))

        if status:
            query = query.where(OfferLetter.status == status)
            count_query = count_query.where(OfferLetter.status == status)
        if candidate_id:
            query = query.where(OfferLetter.candidate_id == candidate_id)
            count_query = count_query.where(OfferLetter.candidate_id == candidate_id)
        if job_id:
            query = query.where(OfferLetter.job_id == job_id)
            count_query = count_query.where(OfferLetter.job_id == job_id)

        total = (await self.db.execute(count_query)).scalar_one()
        offset = (page - 1) * page_size
        query = query.order_by(OfferLetter.created_at.desc()).offset(offset).limit(page_size)
        items = (await self.db.execute(query)).scalars().all()

        return {
            "items": [self._to_response(item) for item in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
