"""Authentication API endpoints."""
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.dependencies import get_db, get_current_user
from app.core.security import get_password_hash, create_access_token, create_refresh_token
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, TokenRefresh
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
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


@router.post("/demo", response_model=TokenResponse)
async def demo_login(db: AsyncSession = Depends(get_db)):
    """One-click demo login. Creates demo user if needed and returns tokens."""
    try:
        result = await db.execute(select(User).where(User.email == "demo@hireez.com"))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email="demo@hireez.com",
                hashed_password=get_password_hash("DemoPass123"),
                full_name="Demo User",
                role=UserRole.HR_MANAGER,
                is_active=True,
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)

        access_token = create_access_token({"sub": str(user.id)})
        new_refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user": user,
        }
    except Exception as e:
        logger.exception("Demo login failed")
        raise HTTPException(status_code=500, detail=f"Demo login failed: {str(e)}")


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
