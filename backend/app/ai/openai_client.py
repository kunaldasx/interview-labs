"""Singleton OpenAI client wrapper for all AI operations."""
import json
from typing import Optional, AsyncGenerator

import openai

from app.core.config import settings


class OpenAIClient:
    _instance: Optional["OpenAIClient"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._instance

    @property
    def client(self) -> openai.AsyncOpenAI:
        return self._client

    async def chat_completion(
        self,
        messages: list[dict],
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        response = await self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def chat_completion_json(
        self,
        messages: list[dict],
        model: str = "gpt-4",
        temperature: float = 0.3,
        max_tokens: int = 4000,
    ) -> dict:
        response = await self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)

    async def chat_completion_stream(
        self,
        messages: list[dict],
        model: str = "gpt-4",
        temperature: float = 0.6,
        max_tokens: int = 2000,
    ) -> AsyncGenerator[str, None]:
        stream = await self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        language: str = "en",
        filename: str = "audio.webm",
    ) -> str:
        audio_file = (filename, audio_bytes)
        response = await self._client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=language,
        )
        return response.text

    async def text_to_speech(
        self,
        text: str,
        voice: str = "alloy",
        model: str = "tts-1",
    ) -> bytes:
        response = await self._client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
        )
        return response.content


ai_client = OpenAIClient()
