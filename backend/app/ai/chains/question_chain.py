"""Question generation AI chain."""
from app.ai.openai_client import ai_client
from app.ai.prompts.question_generation import QUESTION_GENERATION_SYSTEM, build_question_generation_prompt


async def generate_interview_questions(
    domain: str,
    sector: str,
    job_title: str,
    job_description: str,
    experience_years: int,
    num_questions: int = 10,
    existing_questions: list = None,
) -> list[dict]:
    user_prompt = build_question_generation_prompt(
        domain=domain,
        sector=sector,
        job_title=job_title,
        job_description=job_description,
        experience_years=experience_years,
        num_questions=num_questions,
        existing_questions=existing_questions,
    )

    messages = [
        {"role": "system", "content": QUESTION_GENERATION_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]

    result = await ai_client.chat_completion_json(
        messages=messages,
        temperature=0.7,
        max_tokens=4000,
    )

    questions = result.get("questions", [])

    # Validate and normalize each question
    validated = []
    for q in questions:
        validated.append({
            "question_text": q.get("question_text", ""),
            "question_type": q.get("question_type", "technical"),
            "difficulty": q.get("difficulty", "medium"),
            "expected_answer": q.get("expected_answer", ""),
            "keywords": q.get("keywords", []),
        })

    return validated
