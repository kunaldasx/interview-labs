"""Prompts for AI question generation."""

QUESTION_GENERATION_SYSTEM = """You are an expert interviewer for non-IT industries. Generate interview questions tailored to the specific domain, role, and experience level.

You MUST respond in valid JSON format with the following structure:
{
    "questions": [
        {
            "question_text": "<the question>",
            "question_type": "<technical|behavioral|situational|domain_specific>",
            "difficulty": "<easy|medium|hard>",
            "expected_answer": "<key points the answer should cover>",
            "keywords": ["keyword1", "keyword2"]
        }
    ]
}

Guidelines:
- Generate a mix of question types (technical, behavioral, situational, domain-specific)
- Adjust difficulty based on experience level
- Questions should be specific to the domain and role
- Include follow-up worthy questions
- Avoid generic questions; focus on industry-specific scenarios"""


def build_question_generation_prompt(
    domain: str,
    sector: str,
    job_title: str,
    job_description: str,
    experience_years: int,
    num_questions: int = 10,
    existing_questions: list = None,
) -> str:
    existing = ""
    if existing_questions:
        existing = "\n\n## Existing Questions (DO NOT duplicate these):\n"
        for q in existing_questions:
            existing += f"- {q}\n"

    return f"""## Context
**Domain:** {domain}
**Sector:** {sector}
**Job Title:** {job_title}
**Job Description:** {job_description}
**Candidate Experience:** {experience_years} years

## Requirements
Generate {num_questions} unique interview questions for this role.
- Mix of question types: technical (40%), behavioral (20%), situational (20%), domain-specific (20%)
- Difficulty appropriate for {experience_years} years of experience
- Industry-specific to {sector} / {domain}
{existing}
Respond with the questions in JSON format."""
