"""Audio processing endpoints (Whisper transcription)."""
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Transcribe an audio file using OpenAI Whisper."""
    audio_bytes = await file.read()
    logger.info(f"Transcribe: received {len(audio_bytes)} bytes, filename={file.filename}, content_type={file.content_type}")

    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail=f"Audio file too small ({len(audio_bytes)} bytes)")

    try:
        from app.ai.voice.whisper_stt import transcribe_audio_bytes
        text = await transcribe_audio_bytes(
            audio_bytes=audio_bytes,
            language="en",
            filename=file.filename or "audio.webm",
        )
        logger.info(f"Transcribe: result = {text[:100]!r}")
        return {"text": text}
    except Exception as e:
        logger.error(f"Transcribe failed: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
