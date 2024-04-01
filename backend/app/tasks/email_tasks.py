"""Email sending Celery tasks."""
import logging

from app.tasks.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.send_email", bind=True, max_retries=3)
def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
    try:
        if not settings.SENDGRID_API_KEY:
            logger.warning(f"SendGrid not configured. Email to {to_email} not sent: {subject}")
            return {"status": "skipped", "reason": "SendGrid not configured"}

        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Content

        sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)

        content_type = "text/html" if html_body else "text/plain"
        content_body = html_body or body

        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            plain_text_content=body if not html_body else None,
            html_content=html_body,
        )

        response = sg.send(message)
        logger.info(f"Email sent to {to_email}: {response.status_code}")
        return {"status": "sent", "status_code": response.status_code}

    except Exception as exc:
        logger.error(f"Failed to send email to {to_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name="tasks.send_interview_invite")
def send_interview_invite(
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    interview_date: str,
    interview_link: str,
):
    subject = f"Interview Invitation - {job_title}"
    body = f"""Dear {candidate_name},

You have been invited to an interview for the position of {job_title}.

Interview Details:
- Date: {interview_date}
- Link: {interview_link}

Please click the link above to join your AI-powered interview at the scheduled time.

Best regards,
HireEz Team"""

    return send_email.delay(candidate_email, subject, body)
