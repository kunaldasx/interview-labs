"""Email sending Celery tasks using Gmail SMTP."""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.tasks.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.send_email", bind=True, max_retries=3)
def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
    try:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(f"SMTP not configured. Email to {to_email} not sent: {subject}")
            return {"status": "skipped", "reason": "SMTP credentials not configured"}

        msg = MIMEMultipart("alternative")
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))
        if html_body:
            msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

        logger.info(f"Email sent to {to_email} via SMTP")
        return {"status": "sent"}

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
    login_url: str = None,
    temp_password: str = None,
):
    subject = f"Interview Invitation - {job_title}"

    credentials_text = ""
    if temp_password:
        credentials_text = f"""
Your Login Credentials:
- Login URL: {login_url}
- Email: {candidate_email}
- Temporary Password: {temp_password}

Please log in and change your password at your earliest convenience.
"""

    body = f"""Dear {candidate_name},

You have been invited to an interview for the position of {job_title}.

Interview Details:
- Date: {interview_date}
- Interview Link: {interview_link}
{credentials_text}
Please click the interview link above to join your AI-powered interview at the scheduled time.

Best regards,
HireEz Team"""

    credentials_html = ""
    if temp_password:
        credentials_html = f"""
    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #374151;">Your Login Credentials</h3>
        <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="{login_url}">{login_url}</a></p>
        <p style="margin: 5px 0;"><strong>Email:</strong> {candidate_email}</p>
        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">{temp_password}</code></p>
    </div>
    <p style="color: #6B7280; font-size: 13px;">Please log in and change your password at your earliest convenience.</p>"""

    html_body = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4F46E5;">Interview Invitation</h2>
    <p>Dear {candidate_name},</p>
    <p>You have been invited to an interview for the position of <strong>{job_title}</strong>.</p>
    <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #4F46E5;">Interview Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> {interview_date}</p>
        <p style="margin: 5px 0;"><strong>Interview Link:</strong> <a href="{interview_link}">{interview_link}</a></p>
    </div>
    {credentials_html}
    <p>Please click the interview link to join your AI-powered interview at the scheduled time.</p>
    <p>Best regards,<br>HireEz Team</p>
</div>"""

    return send_email.delay(candidate_email, subject, body, html_body)
