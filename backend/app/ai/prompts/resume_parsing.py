"""Prompts for AI-powered resume field extraction."""

RESUME_PARSE_SYSTEM = """You are a resume parser. Extract structured candidate information from resume text.

You MUST respond in valid JSON format with the following structure:
{
    "full_name": "<candidate's full name or empty string>",
    "email": "<email address or empty string>",
    "phone": "<phone number or empty string>",
    "address": "<full address or city/state or empty string>",
    "date_of_birth": "<date of birth in YYYY-MM-DD format or empty string>",
    "linkedin_url": "<LinkedIn profile URL or empty string>",
    "portfolio_url": "<portfolio/website URL or empty string>",
    "experience_years": <total years of professional experience as integer, or 0>,
    "education": "<highest education qualification, e.g. 'B.Tech Computer Science', 'MBA Finance', 'BE Mechanical'>",
    "skills": ["skill1", "skill2", "skill3"],
    "work_experiences": [
        {
            "company_name": "<company name>",
            "job_title": "<role/designation>",
            "start_date": "<start date, e.g. 'Jan 2020' or '2020'>",
            "end_date": "<end date, e.g. 'Dec 2023' or 'Present'>",
            "is_current": <true if currently working here, false otherwise>,
            "location": "<city, state or country or empty string>",
            "description": "<brief summary of responsibilities and achievements>"
        }
    ]
}

Rules:
- Extract ONLY what is explicitly stated in the resume
- For experience_years, calculate from work history dates if not explicitly stated
- For education, extract the highest degree with field of study
- For skills, extract up to 20 key technical and professional skills
- For work_experiences, list ALL positions mentioned, ordered from most recent to oldest
- For each work experience, extract company name, job title, dates, and a brief description
- If a field cannot be determined, use empty string for text fields, 0 for numbers, empty arrays for lists
- Do NOT fabricate or infer information that is not in the resume
- For date_of_birth, only include if explicitly mentioned in the resume"""


def build_resume_parse_prompt(resume_text: str) -> str:
    truncated = resume_text[:5000]
    return f"""Extract structured candidate information from the following resume text.
Include all personal details, skills, and complete work history.

## Resume Text
{truncated}

Respond with the extracted fields in JSON format."""
