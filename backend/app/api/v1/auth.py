"""Authentication API endpoints."""
import logging

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.core.dependencies import get_db, get_current_user
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, TokenRefresh, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()


SELF_REGISTER_ROLES = {UserRole.CANDIDATE, UserRole.PLACEMENT_OFFICER}


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    if data.role not in SELF_REGISTER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Self-registration is only allowed for candidate and placement_officer roles",
        )
    service = AuthService(db)
    user = await service.register(data)
    result = await service.login(UserLogin(email=data.email, password=data.password))
    return result


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(data.refresh_token)


class TokenLoginRequest(BaseModel):
    token: str


@router.post("/token-login", response_model=TokenResponse)
async def token_login(data: TokenLoginRequest, db: AsyncSession = Depends(get_db)):
    """Auto-login using a magic token sent via email."""
    r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        key = f"magic_login:{data.token}"
        user_id = await r.get(key)
        logger.info(f"Token-login attempt: key={key}, user_id={user_id}")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid or expired login link")

        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or disabled")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        logger.info(f"Token-login success for user {user.email} (id={user.id})")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }
    finally:
        await r.aclose()


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send a password reset email if the account exists."""
    service = AuthService(db)
    await service.forgot_password(data.email)
    return {"message": "If an account exists, a reset email has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using a valid token."""
    service = AuthService(db)
    await service.reset_password(data.token, data.new_password)
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.update_user(current_user, data)
