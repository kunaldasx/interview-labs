"""Contact / Demo Request API endpoints."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.dependencies import get_db, require_role
from app.models.demo_request import DemoRequest, DemoRequestStatus
from app.schemas.demo_request import DemoRequestCreate, DemoRequestResponse, DemoRequestStatusUpdate
from app.tasks.email_tasks import send_demo_request_notification, send_demo_request_confirmation

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=DemoRequestResponse)
async def submit_demo_request(
    data: DemoRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — submit a demo request / contact form."""
    demo_request = DemoRequest(
        name=data.name,
        email=data.email,
        company=data.company,
        phone=data.phone,
        message=data.message,
    )
    db.add(demo_request)
    await db.commit()
    await db.refresh(demo_request)

    # Send email notifications asynchronously via Celery
    try:
        send_demo_request_notification.delay(
            requester_name=data.name,
            requester_email=data.email,
            company=data.company or "",
            phone=data.phone or "",
            message=data.message or "",
        )
        send_demo_request_confirmation.delay(
            to_email=data.email,
            requester_name=data.name,
        )
    except Exception:
        logger.warning("Failed to queue demo request emails (Celery may be down)")

    return demo_request


@router.get("/", response_model=list[DemoRequestResponse])
async def list_demo_requests(
    status: Optional[DemoRequestStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("super_admin")),
):
    """Admin-only — list all demo requests with optional status filter."""
    query = select(DemoRequest)
    if status:
        query = query.where(DemoRequest.status == status)
    query = query.order_by(DemoRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{request_id}/status", response_model=DemoRequestResponse)
async def update_demo_request_status(
    request_id: int,
    data: DemoRequestStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("super_admin")),
):
    """Admin-only — update the status of a demo request."""
    result = await db.execute(select(DemoRequest).where(DemoRequest.id == request_id))
    demo_request = result.scalar_one_or_none()
    if not demo_request:
        raise HTTPException(status_code=404, detail="Demo request not found")

    demo_request.status = data.status
    db.add(demo_request)
    await db.commit()
    await db.refresh(demo_request)
    return demo_request
