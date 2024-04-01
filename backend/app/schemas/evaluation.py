from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.evaluation import AIRecommendation, HRDecision


class EvaluationTrigger(BaseModel):
    interview_id: int


class HRDecisionUpdate(BaseModel):
    hr_decision: HRDecision
    hr_notes: Optional[str] = None


class EvaluationResponse(BaseModel):
    id: int
    interview_id: int
    candidate_id: int
    communication_score: float
    technical_score: float
    confidence_score: float
    domain_knowledge_score: float
    problem_solving_score: float
    overall_score: float
    strengths: Optional[dict] = None
    weaknesses: Optional[dict] = None
    detailed_feedback: Optional[str] = None
    ai_recommendation: AIRecommendation
    hr_decision: HRDecision
    hr_notes: Optional[str] = None
    evaluated_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
