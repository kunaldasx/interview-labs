# HireEz - AI Interview Platform for Non-IT Industries

HireEz is an AI-powered interview platform purpose-built for **32 non-IT industry domains** across Healthcare, Finance, Manufacturing, Logistics, and Engineering. It automates the full hiring pipeline — from resume screening and question generation to conducting voice + chat interviews and evaluating candidates.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Features

### Core Modules
- **Registration & Auth** — JWT-based authentication with 4 roles: Super Admin, HR Manager, Interviewer, Candidate
- **Resume Screening** — AI-powered resume parsing and scoring against job requirements
- **JD Management** — Create and manage job descriptions with domain-specific requirements
- **Question Generator** — AI generates domain-relevant interview questions by difficulty level
- **Interview Conductor** — Real-time chat and voice interviews with AI interviewer
- **Evaluation Engine** — Automated scoring across communication, technical, confidence, domain knowledge, and problem-solving
- **Reports & Analytics** — Hiring trends, department distribution, candidate scoring with PDF/Excel export
- **Dashboard** — KPI overview, upcoming interviews, hiring trend charts
- **Notifications** — Email (SendGrid) and SMS (Twilio) notifications for interview scheduling

### Industry Domains (32)
| Healthcare | Finance | Manufacturing | Logistics | Engineering |
|---|---|---|---|---|
| Nursing | Banking | Quality Control | Warehouse Mgmt | Civil |
| Pharmacy | Insurance | Production Mgmt | Transportation | Mechanical |
| Medical Tech | Accounting | Supply Chain | Freight Forwarding | Electrical |
| Healthcare Admin | Financial Planning | Industrial Safety | Inventory Mgmt | Chemical |
| Physical Therapy | Auditing | Lean Manufacturing | Last Mile Delivery | Environmental |
| Dental Hygiene | | Process Engineering | | Structural |
| | | | | Project Mgmt |
| | | | | Construction Mgmt |
| | | | | Industrial |
| | | | | Biomedical |

Each domain ships with **25+ pre-seeded interview questions** covering technical, behavioral, and situational categories.

### Modern UI
- Glassmorphism effects, gradient backgrounds, and floating decorative elements
- Micro-interactions: hover-lift cards, button press effects, staggered entrance animations
- Gradient sidebar with glow logo and active state indicators
- Color-coded KPI cards with icon backgrounds
- Custom chart tooltips with SVG gradient fills
- Responsive design with TailwindCSS

### Pricing Page
- 3 subscription tiers: Starter, Professional, Enterprise
- Currency toggle: INR, USD, EUR, GBP
- Monthly / Annual billing with 20% annual discount
- Per-interview pricing for overages

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, React Router, TanStack Query, Recharts, Zustand |
| **Backend** | FastAPI, SQLModel, SQLAlchemy (async), Pydantic, Alembic |
| **Database** | PostgreSQL 16 (asyncpg), Redis 7 |
| **AI** | OpenAI GPT-4 (question generation, evaluation, screening), Whisper STT, TTS |
| **Task Queue** | Celery + Redis |
| **Auth** | JWT (access + refresh tokens), bcrypt password hashing, role-based access control |
| **Deploy** | Docker Compose, Nginx reverse proxy |

---

## Project Structure

```
HireEz_repo/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API endpoints
│   │   ├── ai/              # AI chains, prompts, voice handlers
│   │   ├── core/            # Config, database, security
│   │   ├── models/          # SQLModel database models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── seeds/           # 32 domain seed data (800+ questions)
│   │   ├── services/        # Business logic layer
│   │   ├── tasks/           # Celery async tasks
│   │   └── utils/           # PDF/Excel generators, file handling
│   ├── alembic/             # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API clients
│   │   ├── components/      # UI, layout, charts, interview, forms
│   │   ├── context/         # Auth context provider
│   │   ├── hooks/           # WebSocket, audio recorder, TTS hooks
│   │   ├── lib/             # Utilities, constants, formatters
│   │   ├── pages/           # All page components
│   │   └── types/           # TypeScript type definitions
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
├── nginx/                   # Nginx configs (dev + prod)
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development compose
└── .env.example             # Environment template
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- OpenAI API key

### Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/digitalkookiehub/HireEz_repo.git
cd HireEz_repo

# Create environment file
cp .env.example .env
# Edit .env with your OpenAI API key and other secrets

# Start all services
docker-compose -f docker-compose.dev.yml up --build
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Local Development

```bash
# Start database and Redis
docker-compose -f docker-compose.dev.yml up db redis -d

# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
python -m app.seeds.seed_runner       # Seed 32 domains + 800+ questions
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Seed Data

The seed runner loads interview questions for all 32 domains:

```bash
cd backend
python -m app.seeds.seed_runner
```

---

## API Overview

All endpoints are versioned under `/api/v1/`.

| Module | Endpoints | Auth |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` | Public |
| Jobs | `GET /jobs`, `POST /jobs`, `GET /jobs/:id` | Protected |
| Candidates | `GET /candidates`, `POST /candidates`, `GET /candidates/:id` | Protected |
| Interviews | `GET /interviews`, `POST /interviews/schedule`, `WS /interviews/:id/ws` | Protected |
| Evaluations | `GET /evaluations/:id`, `POST /evaluations` | Protected |
| Dashboard | `GET /dashboard/kpis`, `GET /dashboard/trends` | Protected |
| Reports | `GET /reports/export/pdf`, `GET /reports/export/excel` | Admin |
| Domains | `GET /domains`, `GET /domains/:id/questions` | Protected |

Full interactive docs available at `/docs` (Swagger UI) when the backend is running.

---

## User Roles

| Role | Permissions |
|---|---|
| **Super Admin** | Full access: all modules, domain management, user management |
| **HR Manager** | Jobs, candidates, interviews, reports, settings |
| **Interviewer** | Conduct interviews, view assigned candidates |
| **Candidate** | Take interviews, view own results |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | Secret for JWT token signing |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 and Whisper |
| `SENDGRID_API_KEY` | SendGrid key for email notifications |
| `TWILIO_*` | Twilio credentials for SMS notifications |

---

## Scripts

```bash
# Development
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

# Type check frontend
cd frontend && npx tsc --noEmit

# Production build
cd frontend && npm run build
```

---

## License

This project is proprietary. All rights reserved.
