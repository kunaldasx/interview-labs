"""Department API endpoints."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.department_service import DepartmentService

router = APIRouter()


@router.get("/", response_model=List[DepartmentResponse])
async def list_departments(db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    return await service.get_all()


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: int, db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    return await service.get_by_id(department_id)


@router.post("/", response_model=DepartmentResponse)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = DepartmentService(db)
    return await service.create(data)


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = DepartmentService(db)
    return await service.update(department_id, data)


@router.delete("/{department_id}")
async def delete_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    service = DepartmentService(db)
    await service.delete(department_id)
    return {"message": "Department deleted"}
