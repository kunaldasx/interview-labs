"""Resume parsing API endpoint."""
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.candidate_service import CandidateService

router = APIRouter()


@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a resume and extract structured candidate data using AI."""
    service = CandidateService(db)
    return await service.parse_resume(file)
