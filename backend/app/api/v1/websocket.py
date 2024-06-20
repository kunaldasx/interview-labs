"""WebSocket endpoints for real-time interview chat and voice."""
import json
import logging
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.core.security import decode_token
from app.models.user import User
from app.models.interview import Interview
from app.models.candidate import Candidate
from app.services.interview_conductor_service import InterviewConductorService
from app.services.ws_connection_manager import ws_manager
from app.ai.voice.whisper_stt import transcribe_audio_bytes
from app.ai.voice.tts_handler import text_to_speech_bytes

logger = logging.getLogger(__name__)

router = APIRouter()


async def _get_db_session() -> AsyncSession:
    """Get a fresh database session."""
    async for session in get_session():
        return session


async def authenticate_ws(token: str, db: AsyncSession) -> Optional[User]:
    """Validate JWT token and return user, or None if invalid."""
    if not token:
        return None
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


async def _verify_interview_access(
    interview_id: int, user: User, db: AsyncSession
) -> Optional[Interview]:
    """Check that the user has access to this interview. Returns interview or None."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    if not interview:
        return None

    # Admins and HR can access any interview
    if user.role in ("super_admin", "hr_manager", "interviewer"):
        return interview

    # Candidates can only access their own interviews
    if user.role == "candidate":
        c_result = await db.execute(select(Candidate).where(Candidate.user_id == user.id))
        candidate = c_result.scalar_one_or_none()
        if candidate and candidate.id == interview.candidate_id:
            return interview

    return None


@router.websocket("/interview/{interview_id}")
async def interview_chat_ws(
    websocket: WebSocket,
    interview_id: int,
    token: str = Query(default=""),
):
    # --- Auth before accept ---
    db = await _get_db_session()
    user = await authenticate_ws(token, db)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    interview = await _verify_interview_access(interview_id, user, db)
    if not interview:
        await websocket.close(code=4004, reason="Access denied")
        return

    await websocket.accept()
    await ws_manager.connect(interview_id, websocket)
    logger.info(f"Chat WS connected: interview={interview_id} user={user.id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type", "")

            # --- Heartbeat ---
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # --- Reconnect: restore conversation history ---
            if msg_type == "reconnect":
                db = await _get_db_session()
                service = InterviewConductorService(db)
                session_data = await service._get_session(interview_id)
                history = session_data.get("conversation_history", [])
                await websocket.send_json({
                    "type": "reconnected",
                    "conversation_history": history,
                    "current_question_index": session_data.get("current_question_index", 0),
                })
                continue

            # Fresh DB session per message cycle
            db = await _get_db_session()
            service = InterviewConductorService(db)

            if msg_type == "start":
                result = await service.start_interview(interview_id)
                await db.commit()
                await websocket.send_json({
                    "type": "greeting",
                    "content": result["greeting"],
                    "total_questions": result["total_questions"],
                    "duration_limit_min": result["duration_limit_min"],
                })

            elif msg_type == "message":
                content = message.get("content", "")

                # Thinking indicator
                await websocket.send_json({"type": "thinking"})

                # Stream start
                await websocket.send_json({"type": "stream_start"})

                # Stream AI response chunk by chunk
                async for event in service.stream_process_message(
                    interview_id=interview_id,
                    candidate_message=content,
                    answer_mode="text",
                ):
                    await websocket.send_json(event)

                await db.commit()

            elif msg_type == "end":
                await service.end_interview(interview_id)
                await db.commit()
                await websocket.send_json({"type": "ended", "content": "Interview ended."})
                break

    except WebSocketDisconnect:
        logger.info(f"Chat WS disconnected: interview={interview_id} user={user.id}")
    except Exception as e:
        logger.error(f"Chat WS error: interview={interview_id}: {e}", exc_info=True)
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


@router.websocket("/interview/{interview_id}/voice")
async def interview_voice_ws(
    websocket: WebSocket,
    interview_id: int,
    token: str = Query(default=""),
):
    # --- Auth before accept ---
    db = await _get_db_session()
    user = await authenticate_ws(token, db)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    interview = await _verify_interview_access(interview_id, user, db)
    if not interview:
        await websocket.close(code=4004, reason="Access denied")
        return

    await websocket.accept()
    await ws_manager.connect(interview_id, websocket)
    logger.info(f"Voice WS connected: interview={interview_id} user={user.id}")

    try:
        while True:
            # Receive binary audio data
            audio_bytes = await websocket.receive_bytes()

            # Thinking indicator
            await websocket.send_json({"type": "thinking"})

            # Transcribe audio using Whisper
            transcript = await transcribe_audio_bytes(audio_bytes)

            if not transcript.strip():
                await websocket.send_json({
                    "type": "transcription_empty",
                    "content": "No speech detected.",
                })
                continue

            # Send transcription back to client
            await websocket.send_json({
                "type": "transcription",
                "content": transcript,
            })

            # Fresh DB session per message
            db = await _get_db_session()
            service = InterviewConductorService(db)

            # Process as interview message (non-streaming for voice — TTS needs full text)
            result = await service.process_message(
                interview_id=interview_id,
                candidate_message=transcript,
                answer_mode="voice",
            )

            # Generate TTS for AI response
            ai_audio = await text_to_speech_bytes(result["message"])

            # Send text response
            await websocket.send_json({
                "type": "complete" if result.get("is_complete") else "response",
                "content": result["message"],
                **{k: v for k, v in result.items() if k != "message"},
            })

            # Send audio response
            await websocket.send_bytes(ai_audio)

            await db.commit()

            if result.get("is_complete"):
                break

    except WebSocketDisconnect:
        logger.info(f"Voice WS disconnected: interview={interview_id} user={user.id}")
    except Exception as e:
        logger.error(f"Voice WS error: interview={interview_id}: {e}", exc_info=True)
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
