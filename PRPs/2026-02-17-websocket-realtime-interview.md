# PRP: WebSocket-Based Real-Time Interview Enhancement

> **Description:** Harden and enhance the existing WebSocket interview system with auth, reconnection, streaming AI responses, heartbeat, and typing indicators
> **Author:** HireEz Team
> **Date:** 2026-02-17
> **Status:** Draft

---

## Core Principles

1. **Context is King** — Include ALL necessary documentation, examples, and caveats
2. **Validation Loops** — Provide executable tests/lints the AI can run and fix
3. **Information Dense** — Use keywords and patterns from the codebase
4. **Progressive Success** — Start simple, validate, then enhance
5. **Global Rules** — Follow all rules in `CLAUDE.md` and patterns in `MEMORY.md`

---

## Goal

Harden the existing WebSocket interview infrastructure into a production-ready real-time system with JWT authentication, automatic reconnection with session recovery, streaming AI responses (token-by-token), heartbeat/keepalive, typing indicators, and a connection manager for multi-interview awareness.

## Why

- **Security gap** — Current WebSocket endpoints accept ALL connections with zero authentication. Anyone with an interview ID can connect and interact with the interview.
- **Reliability** — No reconnection logic means a brief network drop kills the interview with no recovery. Candidates lose progress mid-interview.
- **User experience** — AI responses arrive as a single block after full generation (3-8 seconds of silence). Streaming token-by-token gives instant feedback and feels conversational.
- **Operational visibility** — No heartbeat means the server can't detect stale connections. No typing indicators means the candidate stares at a blank screen while AI generates.
- **Production readiness** — The current implementation works for demos but would fail under real interview conditions (unstable networks, concurrent interviews, auth requirements).

## What

### User-Visible Behavior
1. **Candidate connects** → WebSocket authenticates via JWT token passed as query param → Rejected if invalid/expired
2. **Interview starts** → AI greeting streams word-by-word into the chat → Candidate sees text appearing in real-time
3. **Candidate speaks** → "AI is thinking..." indicator appears → AI response streams token-by-token
4. **Network drops** → Frontend auto-reconnects (up to 5 attempts with exponential backoff) → Conversation resumes from where it left off (Redis session intact)
5. **Connection stale** → Server pings every 30s → Client responds with pong → No pong in 60s = connection closed and cleaned up
6. **HR observes** (future) — Connection manager tracks active interviews for potential live monitoring

### Technical Requirements
- JWT auth on WebSocket via query parameter (`?token=xxx`)
- Streaming AI responses using existing `stream_interview_response()` async generator
- Heartbeat ping/pong every 30 seconds
- Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s — max 5 attempts)
- Session recovery on reconnect (Redis session persists, conversation history restored)
- Typing/thinking indicators via WebSocket message types
- Connection manager singleton for tracking active WebSocket connections
- Graceful error handling with structured error codes

### Success Criteria

- [ ] WebSocket rejects connections without a valid JWT token
- [ ] WebSocket rejects connections where user is not the interview's candidate (or an admin)
- [ ] AI responses stream token-by-token to the frontend (visible incremental text)
- [ ] Frontend automatically reconnects after simulated network drop (disconnect WiFi → reconnect)
- [ ] Conversation history is restored on reconnect (no duplicate messages, no lost messages)
- [ ] Heartbeat pings keep connection alive; stale connections are cleaned up after 60s no-pong
- [ ] "AI is thinking..." indicator shows while AI generates response
- [ ] Connection manager tracks active connections per interview
- [ ] All existing interview functionality (start, message, end, voice) continues to work
- [ ] No regressions in InterviewRoomPage behavior

---

## All Needed Context

### Documentation & References

```yaml
# MUST READ before implementing
- file: CLAUDE.md
  why: Project conventions, commands, architecture

- file: backend/app/api/v1/websocket.py
  why: CURRENT WebSocket implementation to enhance (not replace)

- file: backend/app/services/interview_conductor_service.py
  why: Core business logic — start_interview(), process_message(), end_interview()
  note: Uses Redis sessions, manages conversation state

- file: backend/app/ai/chains/interview_chain.py
  why: Has stream_interview_response() async generator — USE THIS for streaming

- file: backend/app/ai/openai_client.py
  why: chat_completion_stream() yields string chunks — streaming already works

- file: backend/app/core/dependencies.py
  why: get_current_user() and require_role() patterns for HTTP auth
  note: WebSocket can't use Depends(get_current_user) directly — need manual token extraction

- file: backend/app/core/security.py
  why: decode_token() function to validate JWT from query param

- file: frontend/src/hooks/useWebSocket.ts
  why: CURRENT frontend WebSocket hook to enhance

- file: frontend/src/pages/interviews/InterviewRoomPage.tsx
  why: CURRENT interview room UI — consumes useWebSocket hook

- file: frontend/src/types/interview.ts
  why: ChatMessage and ChatResponse type definitions — will need new types

- url: https://fastapi.tiangolo.com/advanced/websockets/
  why: FastAPI WebSocket docs — query params, auth patterns, exception handling

- url: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  why: Browser WebSocket API — readyState, close codes, events
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
| WebSocket | FastAPI native + browser native | `websockets==12.0` in requirements |

### Current Codebase Tree (Interview-Related)

```
backend/
  app/
    api/v1/
      websocket.py              ← MODIFY: Add auth, streaming, heartbeat, connection manager
      interviews.py             ← READ ONLY: REST endpoints (no changes)
    services/
      interview_conductor_service.py  ← MODIFY: Add stream_process_message() method
    ai/
      chains/interview_chain.py       ← READ ONLY: stream_interview_response() already exists
      openai_client.py                ← READ ONLY: chat_completion_stream() already exists
      voice/
        whisper_stt.py                ← READ ONLY
        tts_handler.py                ← READ ONLY
    core/
      dependencies.py           ← READ ONLY: Auth pattern reference
      security.py               ← READ ONLY: decode_token()
      config.py                 ← MODIFY: Add WS_HEARTBEAT_INTERVAL, WS_MAX_RECONNECT settings
    models/
      interview.py              ← READ ONLY: Interview, InterviewTranscript, etc.
    schemas/
      interview.py              ← READ ONLY: ChatMessage, ChatResponse schemas

frontend/
  src/
    hooks/
      useWebSocket.ts           ← MODIFY: Add auth, reconnect, heartbeat, streaming
    pages/interviews/
      InterviewRoomPage.tsx     ← MODIFY: Add streaming display, typing indicator, reconnect UI
    types/
      interview.ts              ← MODIFY: Add new message types (stream_start, stream_chunk, etc.)
    components/interview/
      ConversationDisplay.tsx   ← MODIFY: Support streaming text render
```

### Desired Codebase Tree

```
backend/app/api/v1/websocket.py         ← Enhanced: auth, streaming, heartbeat, error codes
backend/app/services/ws_connection_manager.py  ← NEW: Connection tracking singleton
backend/app/services/interview_conductor_service.py  ← Enhanced: stream_process_message()
backend/app/core/config.py              ← Enhanced: WS settings

frontend/src/hooks/useWebSocket.ts      ← Enhanced: auth, reconnect, heartbeat, streaming
frontend/src/pages/interviews/InterviewRoomPage.tsx  ← Enhanced: streaming UI, reconnect banner
frontend/src/types/interview.ts         ← Enhanced: new WS message types
frontend/src/components/interview/ConversationDisplay.tsx  ← Enhanced: streaming text
```

### Known Gotchas — HireEz Specific

```
CRITICAL — FastAPI Trailing Slash 307 Redirect:
  - NOT relevant to WebSocket routes (ws:// does not redirect)
  - But keep in mind for any REST fallback endpoints

CRITICAL — Async Database Operations:
  - All DB operations use asyncpg driver with SQLAlchemy async engine
  - NEVER use synchronous DB calls inside async WebSocket handlers
  - The current websocket.py gets a DB session via `async for session in get_session()`
  - This pattern works but consider session lifecycle carefully for long-lived WS connections

IMPORTANT — Windows Dev Environment:
  - Claude Code Bash runs under Git Bash (/usr/bin/bash)
  - Windows path commands (cd /d) don't work
  - Use python -c "import subprocess; ..." for reliable command execution
```

### Additional Gotchas for This Task

```
CRITICAL — WebSocket Auth Cannot Use Depends():
  - FastAPI's Depends() injection does NOT work inside WebSocket handlers the same
    way as HTTP routes. You CAN use Query() params for token.
  - Pattern: async def ws_endpoint(websocket: WebSocket, token: str = Query(...))
  - Then manually call decode_token(token) and load user from DB
  - Reject with websocket.close(code=4001, reason="Unauthorized") BEFORE accept()

CRITICAL — DB Session Lifecycle in WebSocket:
  - Current code does `async for session in get_session(): db = session; break`
  - This creates ONE session for the entire WebSocket lifetime (could be 30+ minutes)
  - Long-lived sessions can hit connection pool exhaustion or stale data
  - CONSIDER: Create fresh session per message cycle, or use session-per-operation pattern

CRITICAL — Streaming + Transcript Save:
  - stream_interview_response() yields chunks but we need the FULL response text
    to save as InterviewTranscript
  - Must accumulate chunks into full_response while simultaneously sending to client
  - Pattern: full_text = ""; async for chunk in stream: full_text += chunk; send(chunk)

IMPORTANT — Redis Session Survives Reconnect:
  - Interview session in Redis has 2-hour TTL (key: interview:session:{id})
  - On reconnect, session state (current_question_index, conversation_history) is intact
  - Frontend must request conversation history on reconnect to re-render messages
  - Add a "reconnect" message type that returns conversation history from Redis

IMPORTANT — WebSocket Close Codes:
  - 1000 = Normal close
  - 1001 = Going away (browser tab close)
  - 1006 = Abnormal (network drop — no close frame)
  - 4001 = Custom: Unauthorized (invalid/expired token)
  - 4002 = Custom: Interview not found
  - 4003 = Custom: Interview not in valid state
  - 4004 = Custom: Access denied (not the candidate or admin)

IMPORTANT — Browser WebSocket has no custom headers:
  - Cannot send Authorization: Bearer <token> header with WebSocket
  - MUST pass token as query parameter: ws://host/api/v1/ws/interview/123?token=xxx
  - This is standard practice but token appears in server access logs — use short-lived tokens

IMPORTANT — Concurrent Connection Guard:
  - Only ONE WebSocket connection per interview should be active at a time
  - On reconnect, the old connection (if still alive) must be closed first
  - Connection manager handles this: if interview_id already has a connection, close old one
```

---

## Implementation Blueprint

### Data Models & Structure

```python
# No new database models needed — we enhance existing WebSocket protocol

# New WebSocket message types (extend existing ChatMessage/ChatResponse):

# Server → Client message types:
# "greeting"       — Initial AI greeting (existing)
# "response"       — Complete AI response (existing, keep for non-streaming fallback)
# "complete"       — Interview complete (existing)
# "ended"          — Interview manually ended (existing)
# "error"          — Error occurred (existing, enhance with error codes)
# "candidate"      — Echo of candidate message (frontend-only, existing)
# "stream_start"   — AI response streaming begins (NEW)
# "stream_chunk"   — Single token/chunk of AI response (NEW)
# "stream_end"     — AI response streaming complete, includes full text + metadata (NEW)
# "thinking"       — AI is processing, show typing indicator (NEW)
# "pong"           — Heartbeat response (NEW)
# "reconnected"    — Reconnection successful, includes conversation history (NEW)
# "transcription"  — Whisper STT result (existing, voice WS only)

# Client → Server message types:
# "start"          — Begin interview (existing)
# "message"        — Candidate's text answer (existing)
# "end"            — End interview (existing)
# "ping"           — Heartbeat ping (NEW)
# "reconnect"      — Reconnection request (NEW)

# Error payload structure:
# { "type": "error", "code": "SESSION_EXPIRED", "content": "human-readable message" }
# Error codes: AUTH_FAILED, SESSION_EXPIRED, INTERVIEW_NOT_FOUND, INTERVIEW_INVALID_STATE,
#              ACCESS_DENIED, RATE_LIMITED, INTERNAL_ERROR
```

### Task List

```yaml
Task 1: Create WebSocket Connection Manager
  action: CREATE backend/app/services/ws_connection_manager.py
  description: >
    Singleton class that tracks active WebSocket connections per interview_id.
    Provides connect(interview_id, websocket), disconnect(interview_id),
    get_connection(interview_id), and is_connected(interview_id) methods.
    On connect, if existing connection for same interview, close the old one.
  mirror_pattern: Singleton like OpenAIClient in backend/app/ai/openai_client.py

Task 2: Add WebSocket Auth Helper
  action: MODIFY backend/app/api/v1/websocket.py
  description: >
    Add async helper function authenticate_websocket(websocket, token) that:
    1. Calls decode_token(token) from app.core.security
    2. Loads user from DB
    3. Validates user.is_active
    4. Returns user object or None
    Add to both chat and voice WebSocket endpoints as first step before accept().
  depends_on: none

Task 3: Add Streaming to Interview Conductor Service
  action: MODIFY backend/app/services/interview_conductor_service.py
  description: >
    Add stream_process_message() method that mirrors process_message() but:
    1. Uses stream_interview_response() instead of get_interview_response()
    2. Yields chunks as they arrive from OpenAI
    3. After streaming completes, saves full accumulated response as InterviewTranscript
    4. Updates Redis session with full response in conversation_history
    Keep existing process_message() as fallback for non-streaming clients.
  depends_on: none

Task 4: Enhance Backend WebSocket Handler — Chat
  action: MODIFY backend/app/api/v1/websocket.py
  description: >
    Rewrite interview_chat_ws() to include:
    1. Token from query param: token: str = Query(...)
    2. Auth check before websocket.accept()
    3. Connection manager registration
    4. Heartbeat: handle "ping" messages, respond with "pong"
    5. "reconnect" message type: return conversation_history from Redis session
    6. "thinking" indicator sent before AI processing
    7. Streaming: use stream_process_message(), send stream_start → stream_chunk* → stream_end
    8. Structured error responses with error codes
    9. Proper cleanup in finally block (connection manager disconnect, DB session close)
    10. Fresh DB session per message cycle (not one for entire WS lifetime)
  depends_on: [Task 1, Task 2, Task 3]

Task 5: Enhance Backend WebSocket Handler — Voice
  action: MODIFY backend/app/api/v1/websocket.py
  description: >
    Apply same auth, heartbeat, connection manager, and error handling to voice WS.
    Voice WS does NOT stream AI text (it sends full TTS audio), but still needs:
    1. Auth via query param
    2. Connection manager
    3. Heartbeat
    4. "thinking" indicator while processing
    5. Structured errors
    6. Reconnect support
  depends_on: [Task 1, Task 2]

Task 6: Add WebSocket Config Settings
  action: MODIFY backend/app/core/config.py
  description: >
    Add settings:
    - WS_HEARTBEAT_INTERVAL_SEC: int = 30
    - WS_HEARTBEAT_TIMEOUT_SEC: int = 60
    - WS_MAX_RECONNECT_ATTEMPTS: int = 5
  depends_on: none

Task 7: Enhance Frontend WebSocket Hook — Auth & Reconnect
  action: MODIFY frontend/src/hooks/useWebSocket.ts
  description: >
    Enhance useWebSocket() hook:
    1. Accept token parameter, append as ?token=xxx to WS URL
    2. Auto-reconnect on close codes 1006 (abnormal) with exponential backoff
    3. On reconnect, send {type: "reconnect"} to restore conversation history
    4. Heartbeat: send "ping" every 25s, expect "pong" within 10s
    5. Track connection state: connecting, connected, reconnecting, disconnected
    6. Expose reconnectAttempt count for UI display
    7. Do NOT auto-reconnect on 4001 (auth failed) or 1000 (normal close)
  depends_on: none (frontend work can parallel backend)

Task 8: Enhance Frontend WebSocket Hook — Streaming Support
  action: MODIFY frontend/src/hooks/useWebSocket.ts
  description: >
    Handle new message types:
    1. "stream_start" → create new message entry with empty content, set isStreaming=true
    2. "stream_chunk" → append chunk to current streaming message content
    3. "stream_end" → finalize streaming message with full content + metadata
    4. "thinking" → set isThinking=true (show typing indicator)
    5. "pong" → reset heartbeat timeout
    6. "reconnected" → replace messages array with restored conversation history
    Expose: isStreaming, isThinking, connectionState, reconnectAttempt
  depends_on: [Task 7]

Task 9: Update Frontend Interview Types
  action: MODIFY frontend/src/types/interview.ts
  description: >
    Add new types for enhanced WebSocket protocol:
    - Extend ChatMessage type with 'ping' | 'reconnect'
    - Extend ChatResponse type with 'stream_start' | 'stream_chunk' | 'stream_end' |
      'thinking' | 'pong' | 'reconnected'
    - Add StreamChunk interface: { type, content, chunk_index }
    - Add ReconnectData interface: { type, conversation_history, current_question, ... }
    - Add ConnectionState type: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  depends_on: none

Task 10: Update InterviewRoomPage — Streaming & Reconnect UI
  action: MODIFY frontend/src/pages/interviews/InterviewRoomPage.tsx
  description: >
    1. Pass auth token to useWebSocket (from auth context / localStorage)
    2. Show reconnection banner when connectionState === 'reconnecting'
       ("Connection lost. Reconnecting... (attempt 2/5)")
    3. Show "AI is thinking..." indicator when isThinking === true
    4. Streaming text renders incrementally in ConversationDisplay
    5. Disable "Start Speaking" button while AI is streaming
    6. Show "Disconnected" state with manual reconnect button after max attempts
  depends_on: [Task 8, Task 9]

Task 11: Update ConversationDisplay — Streaming Text Render
  action: MODIFY frontend/src/components/interview/ConversationDisplay.tsx
  description: >
    Support messages with isStreaming=true:
    1. Render partial content with blinking cursor at the end
    2. Auto-scroll as streaming text grows
    3. Remove cursor when streaming completes
    Keep existing non-streaming message rendering intact.
  depends_on: [Task 9]

Task 12: Integration Testing
  action: Manual testing
  description: >
    1. Start interview via UI — verify JWT is sent as query param
    2. Verify unauthorized connection is rejected (use invalid token)
    3. Send messages — verify AI response streams token-by-token
    4. Simulate disconnect (disable network in DevTools) — verify auto-reconnect
    5. Verify conversation history restored after reconnect
    6. Verify heartbeat pings in DevTools Network tab
    7. Verify voice WS still works with auth
    8. Verify end interview still triggers evaluation
  depends_on: [Task 4, Task 5, Task 10, Task 11]
```

### Per-Task Pseudocode

```python
# ═══════════════════════════════════════════════════════════════
# Task 1 — Connection Manager
# ═══════════════════════════════════════════════════════════════

class ConnectionManager:
    """Singleton tracking active WebSocket connections per interview."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._connections: dict[int, WebSocket] = {}
        return cls._instance

    async def connect(self, interview_id: int, websocket: WebSocket):
        # If existing connection for this interview, close it
        if interview_id in self._connections:
            old_ws = self._connections[interview_id]
            try:
                await old_ws.close(code=1001, reason="Replaced by new connection")
            except Exception:
                pass
        self._connections[interview_id] = websocket

    def disconnect(self, interview_id: int):
        self._connections.pop(interview_id, None)

    def get(self, interview_id: int) -> WebSocket | None:
        return self._connections.get(interview_id)

    @property
    def active_count(self) -> int:
        return len(self._connections)


ws_manager = ConnectionManager()


# ═══════════════════════════════════════════════════════════════
# Task 2 — WebSocket Auth Helper
# ═══════════════════════════════════════════════════════════════

async def authenticate_ws(token: str, db: AsyncSession) -> User | None:
    """Validate JWT token and return user. Returns None if invalid."""
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None
    return user


# ═══════════════════════════════════════════════════════════════
# Task 3 — Streaming Process Message
# ═══════════════════════════════════════════════════════════════

# In InterviewConductorService:
async def stream_process_message(self, interview_id, candidate_message, answer_mode="text"):
    # ... (same setup as process_message: get session, save candidate transcript, etc.)

    # Instead of get_interview_response(), use streaming:
    full_response = ""
    async for chunk in stream_interview_response(
        conversation_history=history,
        current_question=current_question,
        candidate_response=candidate_message,
        questions_remaining=questions_remaining,
        time_remaining_min=int(time_remaining),
        candidate_resume=candidate_resume,
    ):
        full_response += chunk
        yield {"type": "stream_chunk", "content": chunk}

    # After stream completes, save full response as transcript
    # Update Redis session with full_response in conversation_history
    # Yield final stream_end with metadata (question_number, time_remaining, etc.)
    yield {
        "type": "stream_end",
        "content": full_response,
        "question_number": current_idx + 2,
        "total_questions": len(questions),
        "time_remaining_min": int(time_remaining),
        "is_complete": False,
    }


# ═══════════════════════════════════════════════════════════════
# Task 4 — Enhanced Chat WebSocket Handler
# ═══════════════════════════════════════════════════════════════

@router.websocket("/interview/{interview_id}")
async def interview_chat_ws(
    websocket: WebSocket,
    interview_id: int,
    token: str = Query(default=""),
):
    # 1. Auth BEFORE accept
    async for session in get_session():
        db = session
        break
    user = await authenticate_ws(token, db)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    # 2. Verify user has access to this interview (is candidate or admin)
    # ... check interview.candidate_id matches user's candidate record, or user is admin

    # 3. Accept and register
    await websocket.accept()
    await ws_manager.connect(interview_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg_type == "reconnect":
                session_data = await service._get_session(interview_id)
                history = session_data.get("conversation_history", [])
                await websocket.send_json({
                    "type": "reconnected",
                    "conversation_history": history,
                    "current_question": session_data.get("current_question_index", 0),
                })
                continue

            if msg_type == "start":
                # ... existing start logic
                pass

            elif msg_type == "message":
                # Send thinking indicator
                await websocket.send_json({"type": "thinking"})

                # Send stream_start
                await websocket.send_json({"type": "stream_start"})

                # Stream AI response
                # CRITICAL: get fresh DB session per message
                async for session in get_session():
                    msg_db = session
                    break
                service = InterviewConductorService(msg_db)

                async for event in service.stream_process_message(
                    interview_id=interview_id,
                    candidate_message=message.get("content", ""),
                ):
                    await websocket.send_json(event)

                await msg_db.commit()

            elif msg_type == "end":
                # ... existing end logic
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: interview={interview_id} user={user.id}")
    except Exception as e:
        logger.error(f"WebSocket error: interview={interview_id}: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "code": "INTERNAL_ERROR",
                "content": str(e),
            })
        except Exception:
            pass
    finally:
        ws_manager.disconnect(interview_id)


# ═══════════════════════════════════════════════════════════════
# Task 7+8 — Enhanced Frontend useWebSocket Hook
# ═══════════════════════════════════════════════════════════════

# function useWebSocket(interviewId, token):
#   state: connectionState, messages, isStreaming, isThinking, reconnectAttempt
#   ref: wsRef, heartbeatInterval, reconnectTimeout, streamingMessageRef
#
#   connect():
#     url = `${WS_URL}/api/v1/ws/interview/${interviewId}?token=${token}`
#     ws = new WebSocket(url)
#     ws.onopen → setConnectionState('connected'), startHeartbeat()
#     ws.onmessage → handleMessage(event.data)
#     ws.onclose → handleClose(event.code)
#
#   handleMessage(data):
#     switch data.type:
#       "pong" → resetHeartbeatTimeout()
#       "thinking" → setIsThinking(true)
#       "stream_start" → setIsStreaming(true), setIsThinking(false), addEmptyMessage()
#       "stream_chunk" → appendToLastMessage(data.content)
#       "stream_end" → setIsStreaming(false), finalizeLastMessage(data)
#       "reconnected" → rebuildMessagesFromHistory(data.conversation_history)
#       default → addMessage(data)  // existing behavior
#
#   handleClose(code):
#     stopHeartbeat()
#     if code === 4001 → setConnectionState('disconnected')  // don't retry auth failure
#     if code === 1000 → setConnectionState('disconnected')  // normal close
#     if code === 1006 → attemptReconnect()                  // abnormal = network drop
#
#   attemptReconnect():
#     if reconnectAttempt >= 5 → setConnectionState('disconnected'), return
#     setConnectionState('reconnecting')
#     delay = Math.min(1000 * 2^reconnectAttempt, 16000)
#     setTimeout(() → connect().then(() → sendMessage({type: "reconnect"})), delay)
#
#   startHeartbeat():
#     heartbeatInterval = setInterval(() → send({type: "ping"}), 25000)
```

### Integration Points

```yaml
DATABASE:
  migration: None — no schema changes needed
  note: All data still saved to InterviewTranscript, InterviewAnswer tables via service layer

CONFIG:
  add_to: backend/app/core/config.py
  settings:
    - WS_HEARTBEAT_INTERVAL_SEC = 30
    - WS_HEARTBEAT_TIMEOUT_SEC = 60
    - WS_MAX_RECONNECT_ATTEMPTS = 5

ROUTES:
  backend: No new routes — enhancing existing ws://api/v1/ws/interview/{id}
  note: Query parameter ?token=xxx added to existing WebSocket URL

AUTH:
  pattern: Manual token validation (not Depends) via decode_token() + DB lookup
  roles: Candidate (owns interview), SuperAdmin/HR Manager (can observe)
  close_codes: 4001=Unauthorized, 4004=Access Denied

REDIS:
  existing: interview:session:{id} — 2hr TTL, stores conversation_history
  used_for: Session recovery on reconnect
  new_key: None — existing session structure is sufficient

NGINX (if applicable):
  websocket_proxy: Ensure proxy_set_header Upgrade, Connection "upgrade"
  timeout: proxy_read_timeout 3600s for long-lived WS connections
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run FIRST — fix any errors before proceeding
cd backend && ruff check app/api/v1/websocket.py app/services/ws_connection_manager.py app/services/interview_conductor_service.py --fix
cd backend && mypy app/api/v1/websocket.py app/services/ws_connection_manager.py
cd frontend && npx tsc --noEmit
cd frontend && npm run build
```

### Level 2: Unit Tests

```python
# Backend tests for WebSocket auth and connection manager

import pytest
from unittest.mock import AsyncMock, MagicMock

# Test: WS auth rejects invalid token
async def test_ws_auth_invalid_token():
    result = await authenticate_ws("invalid_token", mock_db)
    assert result is None

# Test: WS auth accepts valid token
async def test_ws_auth_valid_token():
    # Mock decode_token to return valid payload
    result = await authenticate_ws(valid_token, mock_db)
    assert result is not None
    assert result.id == expected_user_id

# Test: Connection manager replaces old connection
async def test_connection_manager_replaces():
    manager = ConnectionManager()
    old_ws = AsyncMock()
    new_ws = AsyncMock()
    await manager.connect(1, old_ws)
    await manager.connect(1, new_ws)
    old_ws.close.assert_called_once()
    assert manager.get(1) == new_ws

# Test: Connection manager disconnect cleanup
async def test_connection_manager_disconnect():
    manager = ConnectionManager()
    ws = AsyncMock()
    await manager.connect(1, ws)
    manager.disconnect(1)
    assert manager.get(1) is None

# Test: Stream process message yields chunks then stream_end
async def test_stream_process_message():
    service = InterviewConductorService(mock_db)
    chunks = []
    async for event in service.stream_process_message(1, "test answer"):
        chunks.append(event)
    assert any(c["type"] == "stream_chunk" for c in chunks)
    assert chunks[-1]["type"] == "stream_end"
    assert "content" in chunks[-1]  # full accumulated response
```

```bash
cd backend && pytest tests/test_websocket.py -v
```

### Level 3: Integration Test

```bash
# Start backend
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate@example.com", "password": "password"}' \
  | jq -r '.access_token')

# Test WebSocket with auth (using websocat or similar tool):
# Authorized connection:
websocat "ws://localhost:8000/api/v1/ws/interview/1?token=$TOKEN"

# Unauthorized connection (should be rejected immediately):
websocat "ws://localhost:8000/api/v1/ws/interview/1?token=invalid"
# Expected: Connection closed with code 4001

# Test heartbeat:
# Send: {"type": "ping"}
# Expect: {"type": "pong"}

# Test streaming:
# Send: {"type": "start", "content": ""}
# Expect: {"type": "greeting", ...}
# Send: {"type": "message", "content": "I have 5 years of experience in healthcare"}
# Expect: {"type": "thinking"}
# Expect: {"type": "stream_start"}
# Expect: {"type": "stream_chunk", "content": "Thank"} (multiple chunks)
# Expect: {"type": "stream_end", "content": "full response...", "question_number": 2, ...}

# Test reconnect:
# Send: {"type": "reconnect"}
# Expect: {"type": "reconnected", "conversation_history": [...]}

# Frontend test:
cd frontend && npm run dev
# Open http://localhost:5173/interviews/1/room
# Verify:
# 1. WebSocket connects with token in DevTools Network tab
# 2. Start interview → greeting streams in
# 3. Speak → AI response streams token-by-token
# 4. Disable network in DevTools → "Reconnecting..." banner appears
# 5. Re-enable network → auto-reconnects, conversation restored
```

### Level 4: Deployment Validation

```bash
# On deployment server (82.29.164.69 / hireez.online):
ssh root@82.29.164.69
cd /root/AI_interview_agent  # or wherever the project lives
docker compose down && docker compose up -d --build
docker compose logs -f backend  # check for startup errors

# Verify nginx WebSocket proxy config includes:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";
# proxy_read_timeout 3600s;

# Smoke test:
# Open https://hireez.online, login as candidate, start interview
# Verify WebSocket connects via wss:// (check DevTools)
```

---

## Final Validation Checklist

- [ ] WebSocket rejects connection without valid JWT (close code 4001)
- [ ] WebSocket rejects connection for wrong user (close code 4004)
- [ ] AI responses stream token-by-token to frontend
- [ ] "AI is thinking..." indicator appears during processing
- [ ] Heartbeat pings sent every 25s from frontend, pongs received
- [ ] Auto-reconnect works after simulated network drop
- [ ] Conversation history restored on reconnect (no duplicates)
- [ ] Reconnecting banner visible during reconnect attempts
- [ ] "Disconnected" state shown after max reconnect attempts exceeded
- [ ] Connection manager closes old connection when same interview reconnects
- [ ] Voice WebSocket still works with auth
- [ ] Video recording upload still works
- [ ] End interview still triggers Celery evaluation task
- [ ] All backend tests pass: `cd backend && pytest -v`
- [ ] No linting errors: `cd backend && ruff check app/`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Frontend types pass: `cd frontend && npx tsc --noEmit`
- [ ] No hardcoded URLs, tokens, or credentials
- [ ] Async operations used throughout (no sync DB calls in WS handlers)

---

## Anti-Patterns to Avoid

### General
- Don't create new patterns when existing ones work — mirror existing code
- Don't skip validation because "it should work" — run every check
- Don't ignore failing tests — fix root cause, never mock to pass
- Don't catch all exceptions — be specific about what you handle

### WebSocket-Specific
- Don't use HTTP `Depends(get_current_user)` inside WebSocket handlers — manually validate token
- Don't accept WebSocket before validating auth — reject before `accept()` to avoid info leak
- Don't keep a single DB session for the entire WebSocket lifetime — create fresh per message cycle
- Don't accumulate streaming chunks only on frontend — backend MUST save full response to InterviewTranscript
- Don't auto-reconnect on auth failure (4001) or normal close (1000) — only on abnormal close (1006)
- Don't send `Authorization` header with WebSocket — browsers don't support it, use query param `?token=`
- Don't forget to clean up connection manager on disconnect (use `finally` block)
- Don't allow multiple simultaneous connections for the same interview — close the old one
- Don't send heartbeat faster than 25s — it adds overhead; 25-30s is standard
- Don't block the WebSocket event loop with synchronous operations (file I/O, CPU-bound work)

### HireEz-Specific
- Don't use sync functions in async context (`await session.execute()`, not `session.execute()`)
- Don't hardcode database URLs — use `settings.DATABASE_URL` from config/env
- Don't skip saving InterviewTranscript for streamed responses — evaluation needs the full transcript
- Don't break existing REST interview endpoints — WebSocket enhancement is additive
- Don't use synchronous Redis calls inside async WebSocket handlers — use `redis.asyncio`
- Don't forget that Redis session has 2-hour TTL — handle session expiry gracefully on reconnect
