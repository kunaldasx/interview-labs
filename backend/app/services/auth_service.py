"""Authentication service."""
import logging
import secrets

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate
from app.tasks.email_tasks import send_password_reset_email

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> User:
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise ConflictException("Email already registered")

        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            full_name=data.full_name,
            role=data.role,
            department_id=data.department_id,
            phone=data.phone,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def login(self, data: UserLogin) -> dict:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("Account is disabled")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        user_id = payload.get("sub")
        result = await self.db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or disabled")

        new_access = create_access_token({"sub": str(user.id)})
        new_refresh = create_refresh_token({"sub": str(user.id)})

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "user": user,
        }

    async def update_user(self, user: User, data: UserUpdate) -> User:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def forgot_password(self, email: str) -> None:
        """Generate a password reset token and send reset email.
        Always returns success to avoid revealing whether email exists."""
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            return

        token = secrets.token_urlsafe(32)
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            await r.set(f"pwd_reset:{token}", str(user.id), ex=3600)  # 1 hour TTL
        finally:
            await r.aclose()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_password_reset_email.delay(user.email, user.full_name, reset_url)

    async def reset_password(self, token: str, new_password: str) -> None:
        """Validate reset token and update user's password."""
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            key = f"pwd_reset:{token}"
            user_id = await r.get(key)
            if not user_id:
                raise UnauthorizedException("Invalid or expired reset token")

            result = await self.db.execute(select(User).where(User.id == int(user_id)))
            user = result.scalar_one_or_none()
            if not user:
                raise UnauthorizedException("User not found")

            user.hashed_password = get_password_hash(new_password)
            self.db.add(user)
            await self.db.flush()

            await r.delete(key)
        finally:
            await r.aclose()
