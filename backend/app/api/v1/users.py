"""User management REST API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.services.user_service import UserService

router = APIRouter()


class StatusUpdate(BaseModel):
    is_active: bool


@router.get("/", response_model=UserListResponse)
async def list_users(
    role: Optional[UserRole] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = UserService(db)
    return await service.get_all(
        role=role, search=search, is_active=is_active, page=page, page_size=page_size
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = UserService(db)
    return await service.get_by_id(user_id)


@router.post("/", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = UserService(db)
    return await service.create(data)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = UserService(db)
    return await service.update(user_id, data)


@router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    data: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = UserService(db)
    return await service.update_status(user_id, data.is_active)
