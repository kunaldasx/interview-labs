# AI Interview Agent

## Project Overview
AI-powered interview platform for 32 non-IT industry domains (Healthcare, Finance, Manufacturing, Logistics, Engineering). Conducts automated voice+chat interviews, screens resumes, generates questions, and evaluates candidates.

## Tech Stack
- Backend: FastAPI + SQLModel + PostgreSQL + Redis + Celery
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- AI: OpenAI GPT-4 + Whisper STT + TTS
- Deploy: Docker Compose

## Architecture
- 4 user roles: SuperAdmin, HR Manager, Interviewer, Candidate
- 9 modules: Registration, Resume Screening, JD Management, Question Generator, Interview Conductor, Evaluation, Reports, Dashboard, Notifications
- 32 non-IT domains with ~800+ pre-seeded questions

## Key Commands
```bash
# Dev environment
docker-compose -f docker-compose.dev.yml up --build

# Backend only
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
cd frontend && npm run dev

# Run migrations
cd backend && alembic upgrade head

# Seed data
cd backend && python -m app.seeds.seed_runner

# Run tests
cd backend && pytest
cd frontend && npm test
```

## Conventions
- Backend API versioned under /api/v1/
- All models use SQLModel
- Async database operations with asyncpg
- Pydantic schemas for request/response validation
- JWT auth with role-based access control
- AI prompts stored in app/ai/prompts/
- Celery tasks in app/tasks/
