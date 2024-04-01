"""Interview conductor AI chain."""
from typing import AsyncGenerator

from app.ai.openai_client import ai_client
from app.ai.prompts.interview_conduct import (
    INTERVIEW_CONDUCTOR_SYSTEM,
    build_greeting_prompt,
    build_interview_message_prompt,
    build_closing_prompt,
)


async def get_interview_greeting(
    candidate_name: str,
    job_title: str,
    domain: str,
    duration_min: int,
) -> str:
    prompt = build_greeting_prompt(candidate_name, job_title, domain, duration_min)
    messages = [
        {"role": "system", "content": INTERVIEW_CONDUCTOR_SYSTEM},
        {"role": "user", "content": prompt},
    ]
    return await ai_client.chat_completion(
        messages=messages,
        temperature=0.6,
        max_tokens=500,
    )


async def get_interview_response(
    conversation_history: list[dict],
    current_question: str,
    candidate_response: str,
    questions_remaining: int,
    time_remaining_min: int,
) -> str:
    messages = build_interview_message_prompt(
        conversation_history=conversation_history,
        current_question=current_question,
        candidate_response=candidate_response,
        questions_remaining=questions_remaining,
        time_remaining_min=time_remaining_min,
    )
    return await ai_client.chat_completion(
        messages=messages,
        temperature=0.6,
        max_tokens=1000,
    )


async def stream_interview_response(
    conversation_history: list[dict],
    current_question: str,
    candidate_response: str,
    questions_remaining: int,
    time_remaining_min: int,
) -> AsyncGenerator[str, None]:
    messages = build_interview_message_prompt(
        conversation_history=conversation_history,
        current_question=current_question,
        candidate_response=candidate_response,
        questions_remaining=questions_remaining,
        time_remaining_min=time_remaining_min,
    )
    async for chunk in ai_client.chat_completion_stream(
        messages=messages,
        temperature=0.6,
        max_tokens=1000,
    ):
        yield chunk


async def get_interview_closing(candidate_name: str) -> str:
    prompt = build_closing_prompt(candidate_name)
    messages = [
        {"role": "system", "content": INTERVIEW_CONDUCTOR_SYSTEM},
        {"role": "user", "content": prompt},
    ]
    return await ai_client.chat_completion(
        messages=messages,
        temperature=0.6,
        max_tokens=300,
    )
