"""Resume screening AI chain."""
from app.ai.openai_client import ai_client
from app.ai.prompts.resume_screening import RESUME_SCREENING_SYSTEM, build_screening_user_prompt


async def run_resume_screening(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: list,
    experience_min: int,
    experience_max: int,
    education_level: str,
) -> dict:
    user_prompt = build_screening_user_prompt(
        resume_text=resume_text,
        job_title=job_title,
        job_description=job_description,
        required_skills=required_skills,
        experience_min=experience_min,
        experience_max=experience_max,
        education_level=education_level,
    )

    messages = [
        {"role": "system", "content": RESUME_SCREENING_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]

    result = await ai_client.chat_completion_json(
        messages=messages,
        temperature=0.3,
        max_tokens=2000,
    )

    # Normalize scores to 0-10 range
    for key in ["keyword_match_score", "skill_relevance_score", "experience_match_score", "education_match_score", "overall_score"]:
        if key in result:
            result[key] = max(0.0, min(10.0, float(result[key])))

    # Normalize lists
    for key in ["matched_skills", "missing_skills", "strengths", "concerns"]:
        if key in result and not isinstance(result[key], list):
            result[key] = []

    return result
