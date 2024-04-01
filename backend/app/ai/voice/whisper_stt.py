"""Whisper Speech-to-Text handler."""
import tempfile
import os

from app.ai.openai_client import ai_client


async def transcribe_audio_bytes(
    audio_bytes: bytes,
    language: str = "en",
    filename: str = "audio.webm",
) -> str:
    return await ai_client.transcribe_audio(
        audio_bytes=audio_bytes,
        language=language,
        filename=filename,
    )


async def transcribe_audio_file(
    file_path: str,
    language: str = "en",
) -> str:
    with open(file_path, "rb") as f:
        audio_bytes = f.read()
    filename = os.path.basename(file_path)
    return await ai_client.transcribe_audio(
        audio_bytes=audio_bytes,
        language=language,
        filename=filename,
    )
