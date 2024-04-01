"""Department service."""
from typing import Optional, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.exceptions import NotFoundException, ConflictException
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Department]:
        result = await self.db.execute(select(Department).order_by(Department.name))
        return result.scalars().all()

    async def get_by_id(self, department_id: int) -> Department:
        result = await self.db.execute(select(Department).where(Department.id == department_id))
        dept = result.scalar_one_or_none()
        if not dept:
            raise NotFoundException(f"Department {department_id} not found")
        return dept

    async def create(self, data: DepartmentCreate) -> Department:
        result = await self.db.execute(select(Department).where(Department.name == data.name))
        if result.scalar_one_or_none():
            raise ConflictException(f"Department '{data.name}' already exists")

        dept = Department(**data.model_dump())
        self.db.add(dept)
        await self.db.flush()
        await self.db.refresh(dept)
        return dept

    async def update(self, department_id: int, data: DepartmentUpdate) -> Department:
        dept = await self.get_by_id(department_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(dept, key, value)
        self.db.add(dept)
        await self.db.flush()
        await self.db.refresh(dept)
        return dept

    async def delete(self, department_id: int) -> None:
        dept = await self.get_by_id(department_id)
        await self.db.delete(dept)
        await self.db.flush()
