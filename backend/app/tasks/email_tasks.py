"""Email sending Celery tasks."""
import logging

from app.tasks.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.send_email", bind=True, max_retries=3)
def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
    try:
        if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY.startswith("your-"):
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


@celery_app.task(name="tasks.send_credentials_email")
def send_credentials_email(
    to_email: str,
    candidate_name: str,
    temp_password: str,
    login_url: str,
):
    subject = "Your HireEz Interview Portal Credentials"
    body = f"""Dear {candidate_name},

Your profile has been verified. You can now log in to the HireEz Interview Portal.

Login URL: {login_url}
Email: {to_email}
Temporary Password: {temp_password}

Please log in and change your password at your earliest convenience.

Best regards,
HireEz Team"""

    html_body = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4F46E5;">Welcome to HireEz</h2>
    <p>Dear {candidate_name},</p>
    <p>Your profile has been verified. You can now log in to the HireEz Interview Portal.</p>
    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="{login_url}">{login_url}</a></p>
        <p style="margin: 5px 0;"><strong>Email:</strong> {to_email}</p>
        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">{temp_password}</code></p>
    </div>
    <p>Please log in and change your password at your earliest convenience.</p>
    <p>Best regards,<br>HireEz Team</p>
</div>"""

    return send_email.delay(to_email, subject, body, html_body)


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
