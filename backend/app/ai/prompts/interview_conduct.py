"""Prompts for conducting AI interviews."""

INTERVIEW_CONDUCTOR_SYSTEM = """You are an AI interviewer conducting a professional interview for a non-IT industry role. Your role is to:

1. Ask questions clearly and professionally
2. Listen to candidate responses attentively
3. Ask relevant follow-up questions when answers are vague or incomplete
4. Maintain a conversational but professional tone
5. Keep track of time and question flow
6. Provide smooth transitions between topics
7. Reference the candidate's resume/background when relevant to probe deeper

Interview Rules:
- Be encouraging but objective
- Do not reveal expected answers
- Ask one question at a time
- Allow candidates to fully express their answers
- Probe deeper when answers lack specificity
- Stay within the domain context
- If the candidate seems nervous, be reassuring
- If the candidate goes off-topic, gently redirect
- When a candidate's resume is available, use it to ask targeted follow-ups about their claimed experience

Response format: Simply respond with your next message to the candidate as natural conversation text."""


def build_greeting_prompt(candidate_name: str, job_title: str, domain: str, duration_min: int) -> str:
    return f"""Generate a warm, professional greeting for the candidate starting their interview.

Candidate: {candidate_name}
Position: {job_title}
Domain: {domain}
Duration: {duration_min} minutes

Include:
- Welcome the candidate by name
- Mention the position they're interviewing for
- Briefly explain the interview format
- Set expectations for duration
- Ask if they're ready to begin"""


def build_interview_message_prompt(
    conversation_history: list[dict],
    current_question: str,
    candidate_response: str,
    questions_remaining: int,
    time_remaining_min: int,
    candidate_resume: str = None,
) -> list[dict]:
    messages = [{"role": "system", "content": INTERVIEW_CONDUCTOR_SYSTEM}]
    messages.extend(conversation_history)

    resume_context = ""
    if candidate_resume:
        truncated = candidate_resume[:1500]
        resume_context = f"""
Candidate Resume Summary: {truncated}
Use the resume to ask targeted follow-ups when relevant to the current topic."""

    context = f"""[Interview Context]
Current Question: {current_question}
Questions Remaining: {questions_remaining}
Time Remaining: {time_remaining_min} minutes
{resume_context}
The candidate just responded: "{candidate_response}"

Based on their response, either:
1. Ask a relevant follow-up if the answer needs clarification (reference their resume background when appropriate)
2. Acknowledge their answer and move to the next question
3. If running low on time, transition to the next question smoothly"""

    messages.append({"role": "user", "content": context})
    return messages


def build_closing_prompt(candidate_name: str) -> str:
    return f"""Generate a warm, professional closing message for {candidate_name}'s interview.

Include:
- Thank them for their time
- Let them know the evaluation process timeline
- Wish them well
- Keep it concise (2-3 sentences)"""
