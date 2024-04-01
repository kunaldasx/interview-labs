"""Prompts for AI resume screening."""

RESUME_SCREENING_SYSTEM = """You are an expert HR recruiter AI assistant. Analyze the candidate's resume against the job description and provide a detailed screening assessment.

You MUST respond in valid JSON format with the following structure:
{
    "keyword_match_score": <float 0-10>,
    "skill_relevance_score": <float 0-10>,
    "experience_match_score": <float 0-10>,
    "education_match_score": <float 0-10>,
    "overall_score": <float 0-10>,
    "recommendation": "<strongly_recommend|recommend|maybe|not_recommend>",
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"],
    "summary": "<2-3 sentence summary>"
}

Scoring guidelines:
- 8-10: Excellent match, strongly recommend
- 6-8: Good match, recommend
- 4-6: Partial match, maybe
- 0-4: Poor match, not recommended"""


def build_screening_user_prompt(resume_text: str, job_title: str, job_description: str, required_skills: list, experience_min: int, experience_max: int, education_level: str) -> str:
    skills_text = ", ".join(required_skills) if required_skills else "Not specified"
    return f"""## Job Description
**Title:** {job_title}
**Description:** {job_description}
**Required Skills:** {skills_text}
**Experience:** {experience_min}-{experience_max} years
**Education:** {education_level or 'Not specified'}

## Candidate Resume
{resume_text}

Analyze this resume against the job description and provide your assessment in JSON format."""
