"""User management service."""
from typing import Optional
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select

from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        role: Optional[UserRole] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = select(User)
        count_query = select(func.count(User.id))

        if role:
            query = query.where(User.role == role)
            count_query = count_query.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)
            count_query = count_query.where(User.is_active == is_active)
        if search:
            query = query.where(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%"))
            )
            count_query = count_query.where(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%"))
            )

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(User.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)

        return {
            "items": result.scalars().all(),
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def get_by_id(self, user_id: int) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException(f"User {user_id} not found")
        return user

    async def create(self, data: UserCreate) -> User:
        # Check for duplicate email
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise ConflictException(f"User with email {data.email} already exists")

        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            full_name=data.full_name,
            role=data.role,
            phone=data.phone,
            department_id=data.department_id,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_by_id(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update_status(self, user_id: int, is_active: bool) -> User:
        user = await self.get_by_id(user_id)
        user.is_active = is_active
        user.updated_at = datetime.utcnow()
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
