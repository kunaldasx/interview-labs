# PRP: [Feature Name]

> **Description:** [One-line summary of what this PRP covers]
> **Author:** [Name]
> **Date:** [YYYY-MM-DD]
> **Status:** Draft | In Review | Approved | Implemented

---

## Core Principles

1. **Context is King** — Include ALL necessary documentation, examples, and caveats
2. **Validation Loops** — Provide executable tests/lints the AI can run and fix
3. **Information Dense** — Use keywords and patterns from the codebase
4. **Progressive Success** — Start simple, validate, then enhance
5. **Global Rules** — Follow all rules in `CLAUDE.md` and patterns in `MEMORY.md`

---

## Goal

[What needs to be built — be specific about the end state]

## Why

- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcome 1]
- [ ] [Specific measurable outcome 2]
- [ ] [Specific measurable outcome 3]

---

## All Needed Context

### Documentation & References

```yaml
# MUST READ — Include these in your context window before implementing
- file: CLAUDE.md
  why: Project conventions, commands, and architecture overview

- file: backend/app/models/
  why: Existing SQLModel patterns for new models

- file: backend/app/api/v1/
  why: Existing router patterns and endpoint conventions

- file: frontend/src/
  why: React component patterns, API service layer, auth context

# Add task-specific references below:
- url: [Official docs URL]
  why: [What you need from it]

- file: [path/to/relevant/file.py]
  why: [Pattern to follow or gotcha to avoid]

- docfile: [PRPs/ai_docs/file.md]
  why: [Pasted external docs relevant to this task]
```

### HireEz Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend Framework | FastAPI | Async, versioned under `/api/v1/` |
| ORM | SQLModel | Built on SQLAlchemy + Pydantic |
| Database | PostgreSQL 16 | Docker container, asyncpg driver |
| Task Queue | Celery + Redis | Background jobs in `app/tasks/` |
| AI | OpenAI GPT-4 + Whisper STT + TTS | Prompts in `app/ai/prompts/` |
| Frontend | React 18 + TypeScript | Vite bundler |
| Styling | TailwindCSS | Utility-first CSS |
| Auth | JWT | Role-based: SuperAdmin, HR Manager, Interviewer, Candidate |
| Deploy | Docker Compose | Prod on Hostinger VPS (hireez.online) |

### Current Codebase Tree

```bash
# Run: tree -L 2 in project root, paste output here
```

### Desired Codebase Tree

```bash
# Show new/modified files and their responsibilities
# Example:
# backend/app/api/v1/new_feature.py  — Router endpoints for [feature]
# backend/app/models/new_model.py    — SQLModel for [entity]
# frontend/src/pages/NewFeature.tsx  — Page component for [feature]
```

### Known Gotchas — HireEz Specific

```
CRITICAL — FastAPI Trailing Slash 307 Redirect:
  - Routes defined as @router.post("/") under a prefix like /candidates
    create the path /api/v1/candidates/
  - Frontend POST to /api/v1/candidates (no slash) gets 307 redirect
  - Browsers strip Authorization header on 307 → causes 401 → login redirect
  - redirect_slashes=False does NOT fully prevent this for sub-routers
  - FIX: Frontend URLs MUST include trailing slash for collection endpoints
    (/candidates/, /jobs/, etc.)
  - Routes with path segments (/auth/login, /dashboard/kpis) are NOT affected

CRITICAL — Async Database Operations:
  - All DB operations use asyncpg driver with SQLAlchemy async engine
  - NEVER use synchronous DB calls inside async endpoints
  - Dev DB: postgresql+asyncpg://postgres:HireEz2026@localhost:5433/hireez
  - Prod DB: postgresql+asyncpg://postgres:HireEz2026@db:5432/hireez
  - Use settings/env vars for connection strings, never hardcode

IMPORTANT — Windows Dev Environment:
  - Claude Code Bash runs under Git Bash (/usr/bin/bash)
  - Windows path commands (cd /d) don't work
  - Use python -c "import subprocess; ..." for reliable command execution
  - Use cmd.exe /c "..." for Windows-specific commands
```

### Additional Gotchas for This Task

```
# Add task-specific gotchas here:
# Example: "This API returns paginated results, max 100 per page"
```

---

## Implementation Blueprint

### Data Models & Structure

```python
# Define core data models for this feature
# Follow existing SQLModel patterns from backend/app/models/

# Example SQLModel:
# class NewEntity(SQLModel, table=True):
#     __tablename__ = "new_entities"
#     id: int | None = Field(default=None, primary_key=True)
#     name: str = Field(max_length=255)
#     created_at: datetime = Field(default_factory=datetime.utcnow)

# Example Pydantic Schema:
# class NewEntityCreate(SQLModel):
#     name: str = Field(max_length=255)
#
# class NewEntityRead(SQLModel):
#     id: int
#     name: str
#     created_at: datetime
```

### Task List

```yaml
Task 1: [Database model & migration]
  action: CREATE backend/app/models/new_entity.py
  mirror_pattern: backend/app/models/  # follow existing model patterns
  then: cd backend && alembic revision --autogenerate -m "add new_entity table"
  then: cd backend && alembic upgrade head

Task 2: [Pydantic schemas]
  action: CREATE backend/app/schemas/new_entity.py
  mirror_pattern: backend/app/schemas/  # follow existing schema patterns

Task 3: [CRUD operations]
  action: CREATE backend/app/crud/new_entity.py
  mirror_pattern: backend/app/crud/  # async operations only

Task 4: [API router]
  action: CREATE backend/app/api/v1/new_entity.py
  mirror_pattern: backend/app/api/v1/  # follow router patterns
  register_in: backend/app/api/v1/__init__.py or main router
  note: Use trailing slash for collection endpoints

Task 5: [Frontend API service]
  action: CREATE frontend/src/services/newEntityService.ts
  mirror_pattern: frontend/src/services/  # follow existing API service patterns
  note: Include trailing slash in collection endpoint URLs

Task 6: [Frontend page/component]
  action: CREATE frontend/src/pages/NewEntity.tsx
  mirror_pattern: frontend/src/pages/  # follow existing page patterns
  register_in: frontend/src/App.tsx  # add route

Task 7: [Tests]
  action: CREATE backend/tests/test_new_entity.py
  run: cd backend && pytest tests/test_new_entity.py -v

# Add/remove/modify tasks as needed for this feature
```

### Per-Task Pseudocode

```python
# Add pseudocode for complex tasks. Example:

# Task 4 — API Router
# async def create_entity(entity: NewEntityCreate, db: AsyncSession = Depends(get_db)):
#     # Validate input via Pydantic schema (automatic)
#     # Call CRUD create function (async)
#     # Return NewEntityRead schema
#     # GOTCHA: Router prefix + "/" = trailing slash endpoint

# Task 6 — React Component
# const NewEntityPage: React.FC = () => {
#   // useEffect to fetch data on mount
#   // useState for form/list state
#   // API calls through service layer (with trailing slashes)
#   // TailwindCSS for styling
#   // Handle auth token via context
# }
```

### Integration Points

```yaml
DATABASE:
  migration: "alembic revision --autogenerate -m '[description]'"
  apply: "alembic upgrade head"
  rollback: "alembic downgrade -1"

CONFIG:
  add_to: backend/app/core/config.py
  pattern: "NEW_SETTING = os.getenv('NEW_SETTING', 'default')"

ROUTES:
  backend: "router.include_router(new_router, prefix='/new-entity', tags=['new-entity'])"
  frontend: "<Route path='/new-entity' element={<NewEntityPage />} />"

AUTH:
  protect_with: "Depends(get_current_user)" or role-specific dependency
  roles: [SuperAdmin, HR Manager, Interviewer, Candidate]  # which roles can access

CELERY (if background tasks needed):
  add_to: backend/app/tasks/
  pattern: "@celery_app.task(bind=True)"
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run FIRST — fix any errors before proceeding
cd backend && ruff check app/ --fix          # Auto-fix linting
cd backend && mypy app/                       # Type checking
cd frontend && npx tsc --noEmit               # TypeScript type check
cd frontend && npm run build                  # Build check (catches import errors)
```

### Level 2: Unit Tests

```python
# CREATE tests following existing patterns in backend/tests/

# Example test cases to cover:
def test_create_entity_success():
    """Happy path: valid input creates entity"""
    pass

def test_create_entity_validation_error():
    """Invalid input returns 422"""
    pass

def test_get_entity_not_found():
    """Missing entity returns 404"""
    pass

def test_endpoint_requires_auth():
    """Unauthenticated request returns 401"""
    pass
```

```bash
# Run and iterate until passing:
cd backend && pytest tests/test_new_entity.py -v
cd frontend && npm test                       # if frontend tests exist
```

### Level 3: Integration Test

```bash
# Start backend
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test endpoints (replace with actual paths)
# Auth first:
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' \
  | jq -r '.access_token')

# Create:
curl -X POST http://localhost:8000/api/v1/new-entity/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# List:
curl http://localhost:8000/api/v1/new-entity/ \
  -H "Authorization: Bearer $TOKEN"

# NOTE: Collection endpoints use trailing slash!
```

### Level 4: Deployment Validation

```bash
# On deployment server (82.29.164.69 / hireez.online):
ssh root@82.29.164.69
cd /path/to/project
docker compose down && docker compose up -d --build
docker compose logs -f backend   # check for startup errors

# Smoke test production:
curl https://hireez.online/api/v1/new-entity/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Final Validation Checklist

- [ ] All backend tests pass: `cd backend && pytest -v`
- [ ] No linting errors: `cd backend && ruff check app/`
- [ ] No type errors: `cd backend && mypy app/`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Frontend types pass: `cd frontend && npx tsc --noEmit`
- [ ] Manual API test successful (see curl examples above)
- [ ] Frontend UI renders correctly
- [ ] Auth/RBAC works for all required roles
- [ ] Error cases handled gracefully (404, 422, 401, 500)
- [ ] Database migration runs cleanly
- [ ] No hardcoded URLs or credentials
- [ ] Trailing slashes correct on all collection endpoints
- [ ] Async operations used throughout (no sync DB calls)

---

## Anti-Patterns to Avoid

### General
- Don't create new patterns when existing ones work — mirror existing code
- Don't skip validation because "it should work" — run every check
- Don't ignore failing tests — fix root cause, never mock to pass
- Don't catch all exceptions — be specific about what you handle

### HireEz-Specific
- Don't use sync functions in async context (e.g., `session.execute()` instead of `await session.execute()`)
- Don't forget trailing slashes on collection endpoint URLs in frontend API calls
- Don't hardcode database URLs — use `settings.DATABASE_URL` from config/env
- Don't hardcode the server IP/domain — use environment variables
- Don't skip Alembic migrations — never modify DB schema manually
- Don't use `redirect_slashes=False` as a fix — match URLs instead
- Don't put business logic in route handlers — use service/CRUD layer
- Don't ignore RBAC — every endpoint must check user roles
- Don't use synchronous Redis/Celery calls inside async endpoints
- Don't commit `.env` files or credentials to git
