from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    HR_MANAGER = "hr_manager"
    INTERVIEWER = "interviewer"
    CANDIDATE = "candidate"
    PLACEMENT_OFFICER = "placement_officer"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    full_name: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.CANDIDATE)
    phone: Optional[str] = Field(default=None, max_length=20)
    department_id: Optional[int] = Field(default=None, foreign_key="departments.id")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    department: Optional["Department"] = Relationship(back_populates="users")
