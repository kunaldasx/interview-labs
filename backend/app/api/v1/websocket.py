"""WebSocket endpoints for real-time interview chat and voice."""
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.interview_conductor_service import InterviewConductorService
from app.ai.voice.whisper_stt import transcribe_audio_bytes
from app.ai.voice.tts_handler import text_to_speech_bytes

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/interview/{interview_id}")
async def interview_chat_ws(websocket: WebSocket, interview_id: int):
    await websocket.accept()
    logger.info(f"Chat WebSocket connected for interview {interview_id}")

    try:
        async for session in get_session():
            db = session
            break

        service = InterviewConductorService(db)

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            content = message.get("content", "")
            msg_type = message.get("type", "text")

            if msg_type == "start":
                result = await service.start_interview(interview_id)
                await websocket.send_json({
                    "type": "greeting",
                    "content": result["greeting"],
                    "total_questions": result["total_questions"],
                    "duration_limit_min": result["duration_limit_min"],
                })
            elif msg_type == "message":
                result = await service.process_message(
                    interview_id=interview_id,
                    candidate_message=content,
                    answer_mode="text",
                )
                await websocket.send_json({
                    "type": "complete" if result.get("is_complete") else "response",
                    "content": result["message"],
                    **{k: v for k, v in result.items() if k != "message"},
                })
            elif msg_type == "end":
                await service.end_interview(interview_id)
                await websocket.send_json({"type": "ended", "content": "Interview ended."})
                break

            await db.commit()

    except WebSocketDisconnect:
        logger.info(f"Chat WebSocket disconnected for interview {interview_id}")
    except Exception as e:
        logger.error(f"Chat WebSocket error for interview {interview_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass


@router.websocket("/interview/{interview_id}/voice")
async def interview_voice_ws(websocket: WebSocket, interview_id: int):
    await websocket.accept()
    logger.info(f"Voice WebSocket connected for interview {interview_id}")

    try:
        async for session in get_session():
            db = session
            break

        service = InterviewConductorService(db)

        while True:
            # Receive binary audio data
            audio_bytes = await websocket.receive_bytes()

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

            # Process as interview message
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
        logger.info(f"Voice WebSocket disconnected for interview {interview_id}")
    except Exception as e:
        logger.error(f"Voice WebSocket error for interview {interview_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
