"""Evaluation AI chain."""
from app.ai.openai_client import ai_client
from app.ai.prompts.evaluation import EVALUATION_SYSTEM, build_evaluation_prompt


async def run_evaluation(
    candidate_name: str,
    job_title: str,
    domain: str,
    transcript: list[dict],
    questions_answers: list[dict],
) -> dict:
    user_prompt = build_evaluation_prompt(
        candidate_name=candidate_name,
        job_title=job_title,
        domain=domain,
        transcript=transcript,
        questions_answers=questions_answers,
    )

    messages = [
        {"role": "system", "content": EVALUATION_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]

    result = await ai_client.chat_completion_json(
        messages=messages,
        temperature=0.2,
        max_tokens=4000,
    )

    # Normalize scores
    score_fields = [
        "communication_score", "technical_score", "confidence_score",
        "domain_knowledge_score", "problem_solving_score", "overall_score",
    ]
    for key in score_fields:
        if key in result:
            result[key] = max(1.0, min(10.0, float(result[key])))

    # Calculate weighted overall if not provided
    if "overall_score" not in result or result["overall_score"] == 0:
        result["overall_score"] = round(
            result.get("technical_score", 5) * 0.25
            + result.get("domain_knowledge_score", 5) * 0.25
            + result.get("communication_score", 5) * 0.20
            + result.get("problem_solving_score", 5) * 0.20
            + result.get("confidence_score", 5) * 0.10,
            2,
        )

    # Map recommendation
    valid_recs = {"strongly_hire", "hire", "maybe", "no_hire"}
    if result.get("recommendation") not in valid_recs:
        score = result.get("overall_score", 5)
        if score >= 8:
            result["recommendation"] = "strongly_hire"
        elif score >= 6.5:
            result["recommendation"] = "hire"
        elif score >= 5:
            result["recommendation"] = "maybe"
        else:
            result["recommendation"] = "no_hire"

    return result
