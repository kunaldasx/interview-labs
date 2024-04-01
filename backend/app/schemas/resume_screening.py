from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.resume_screening import ScreeningRecommendation


class ScreeningRequest(BaseModel):
    candidate_id: int
    job_id: int


class ScreeningResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    keyword_match_score: float
    skill_relevance_score: float
    experience_match_score: float
    education_match_score: float
    overall_score: float
    recommendation: ScreeningRecommendation
    matched_skills: Optional[dict] = None
    missing_skills: Optional[dict] = None
    strengths: Optional[dict] = None
    concerns: Optional[dict] = None
    summary: Optional[str] = None
    screened_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
