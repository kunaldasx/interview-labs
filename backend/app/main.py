from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="HireEz for Non-IT Industries",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "HireEz"}


# Import and include routers
from app.api.v1 import router as api_v1_router
app.include_router(api_v1_router, prefix="/api/v1")


# Direct transcribe endpoint (workaround for route matching issue)
from fastapi import UploadFile, File, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.models.user import User


@app.post("/api/v1/audio/transcribe", tags=["Audio"])
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Transcribe an audio file using OpenAI Whisper."""
    import logging
    logger = logging.getLogger(__name__)

    audio_bytes = await file.read()
    logger.info(f"Transcribe: received {len(audio_bytes)} bytes, filename={file.filename}")

    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail=f"Audio file too small ({len(audio_bytes)} bytes)")

    try:
        from app.ai.voice.whisper_stt import transcribe_audio_bytes
        text = await transcribe_audio_bytes(
            audio_bytes=audio_bytes,
            language="en",
            filename=file.filename or "audio.webm",
        )
        logger.info(f"Transcribe result: {text[:100]!r}")
        return {"text": text}
    except Exception as e:
        logger.error(f"Transcribe failed: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
