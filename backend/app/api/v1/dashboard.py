"""Dashboard API endpoints."""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/kpis")
async def get_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = DashboardService(db)
    return await service.get_kpis()


@router.get("/upcoming-interviews")
async def get_upcoming_interviews(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = DashboardService(db)
    interviews = await service.get_upcoming_interviews(limit=limit)
    return {"items": interviews}


@router.get("/pending-reviews")
async def get_pending_reviews(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = DashboardService(db)
    reviews = await service.get_pending_reviews(limit=limit)
    return {"items": reviews}


@router.get("/hiring-trends")
async def get_hiring_trends(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = DashboardService(db)
    return await service.get_hiring_trends(days=days)


@router.get("/status-distribution")
async def get_status_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager")),
):
    service = DashboardService(db)
    return await service.get_status_distribution()
