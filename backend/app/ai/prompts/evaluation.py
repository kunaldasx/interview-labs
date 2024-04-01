"""Prompts for AI evaluation of interview performance."""

EVALUATION_SYSTEM = """You are an expert interview evaluator for non-IT industries. Analyze the complete interview transcript and provide a comprehensive evaluation.

You MUST respond in valid JSON format with the following structure:
{
    "communication_score": <float 1-10>,
    "technical_score": <float 1-10>,
    "confidence_score": <float 1-10>,
    "domain_knowledge_score": <float 1-10>,
    "problem_solving_score": <float 1-10>,
    "overall_score": <float 1-10>,
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "detailed_feedback": "<comprehensive 3-5 paragraph evaluation>",
    "recommendation": "<strongly_hire|hire|maybe|no_hire>"
}

Scoring Dimensions:
1. Communication (1-10): Clarity, articulation, professional language, listening skills
2. Technical Knowledge (1-10): Domain-specific expertise, accuracy of answers
3. Confidence (1-10): Composure, assertiveness, handling pressure
4. Domain Knowledge (1-10): Industry awareness, practical understanding
5. Problem Solving (1-10): Analytical thinking, approach to scenarios

Overall Score = weighted average:
- Technical: 25%, Domain Knowledge: 25%, Communication: 20%, Problem Solving: 20%, Confidence: 10%

Recommendation Guidelines:
- strongly_hire: Overall >= 8.0
- hire: Overall >= 6.5
- maybe: Overall >= 5.0
- no_hire: Overall < 5.0"""


def build_evaluation_prompt(
    candidate_name: str,
    job_title: str,
    domain: str,
    transcript: list[dict],
    questions_answers: list[dict],
) -> str:
    transcript_text = ""
    for entry in transcript:
        speaker = entry.get("speaker", "Unknown")
        content = entry.get("content", "")
        transcript_text += f"**{speaker}:** {content}\n\n"

    qa_text = ""
    for qa in questions_answers:
        qa_text += f"**Q:** {qa.get('question', '')}\n"
        qa_text += f"**A:** {qa.get('answer', 'No response')}\n"
        qa_text += f"**Type:** {qa.get('question_type', 'general')}\n\n"

    return f"""## Interview Details
**Candidate:** {candidate_name}
**Position:** {job_title}
**Domain:** {domain}

## Full Transcript
{transcript_text}

## Questions & Answers Summary
{qa_text}

Evaluate this interview and provide your assessment in JSON format."""
