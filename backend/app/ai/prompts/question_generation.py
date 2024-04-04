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
    candidate_resume: str = None,
) -> str:
    existing = ""
    if existing_questions:
        existing = "\n\n## Existing Questions (DO NOT duplicate these):\n"
        for q in existing_questions:
            existing += f"- {q}\n"

    resume_section = ""
    if candidate_resume:
        truncated = candidate_resume[:2000]
        resume_section = f"""

## Candidate Resume
{truncated}

Generate questions that probe the candidate's claimed experience and skills from their resume.
Focus on verifying key claims, exploring depth of experience, and connecting resume content to the job requirements."""

    return f"""## Context
**Domain:** {domain}
**Sector:** {sector}
**Job Title:** {job_title}
**Job Description:** {job_description}
**Candidate Experience:** {experience_years} years
{resume_section}

## Requirements
Generate {num_questions} unique interview questions for this role.
- Mix of question types: technical (40%), behavioral (20%), situational (20%), domain-specific (20%)
- Difficulty appropriate for {experience_years} years of experience
- Industry-specific to {sector} / {domain}
- If a candidate resume is provided, at least 30% of questions should reference their specific background
{existing}
Respond with the questions in JSON format."""
