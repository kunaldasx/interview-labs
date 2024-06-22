from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.departments import router as departments_router
from app.api.v1.domains import router as domains_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.resume import router as resume_router
from app.api.v1.screening import router as screening_router
from app.api.v1.questions import router as questions_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.audio import router as audio_router
from app.api.v1.websocket import router as websocket_router
from app.api.v1.evaluations import router as evaluations_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.users import router as users_router
from app.api.v1.offer_letters import router as offer_letters_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(departments_router, prefix="/departments", tags=["Departments"])
router.include_router(domains_router, prefix="/domains", tags=["Domains"])
router.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
router.include_router(resume_router, prefix="/resume", tags=["Resume"])
router.include_router(candidates_router, prefix="/candidates", tags=["Candidates"])
router.include_router(screening_router, prefix="/screening", tags=["Resume Screening"])
router.include_router(questions_router, prefix="/questions", tags=["Questions"])
router.include_router(interviews_router, prefix="/interviews", tags=["Interviews"])
router.include_router(audio_router, prefix="/audio", tags=["Audio"])
router.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])
router.include_router(evaluations_router, prefix="/evaluations", tags=["Evaluations"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(reports_router, prefix="/reports", tags=["Reports"])
router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(offer_letters_router, prefix="/offer-letters", tags=["Offer Letters"])
