"""Text-to-Speech handler using OpenAI TTS."""
import os
import tempfile

from app.ai.openai_client import ai_client


async def text_to_speech_bytes(
    text: str,
    voice: str = "alloy",
) -> bytes:
    return await ai_client.text_to_speech(text=text, voice=voice)


async def text_to_speech_file(
    text: str,
    output_path: str,
    voice: str = "alloy",
) -> str:
    audio_bytes = await ai_client.text_to_speech(text=text, voice=voice)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)
    return output_path
