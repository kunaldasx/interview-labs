"""PDF report generation using ReportLab."""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def generate_candidate_report(
    candidate_name: str,
    job_title: str,
    evaluation: dict,
    interview_date: str = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("CustomTitle", parent=styles["Title"], fontSize=18, spaceAfter=20)
    heading_style = ParagraphStyle("CustomHeading", parent=styles["Heading2"], fontSize=14, spaceAfter=10)

    elements = []

    # Title
    elements.append(Paragraph("Interview Evaluation Report", title_style))
    elements.append(Spacer(1, 12))

    # Candidate Info
    elements.append(Paragraph("Candidate Information", heading_style))
    info_data = [
        ["Candidate:", candidate_name],
        ["Position:", job_title],
        ["Date:", interview_date or datetime.utcnow().strftime("%Y-%m-%d")],
        ["AI Recommendation:", evaluation.get("ai_recommendation", "N/A")],
        ["HR Decision:", evaluation.get("hr_decision", "Pending")],
    ]
    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    # Scores
    elements.append(Paragraph("Evaluation Scores", heading_style))
    score_data = [
        ["Dimension", "Score (1-10)"],
        ["Communication", str(evaluation.get("communication_score", 0))],
        ["Technical Knowledge", str(evaluation.get("technical_score", 0))],
        ["Confidence", str(evaluation.get("confidence_score", 0))],
        ["Domain Knowledge", str(evaluation.get("domain_knowledge_score", 0))],
        ["Problem Solving", str(evaluation.get("problem_solving_score", 0))],
        ["Overall", str(evaluation.get("overall_score", 0))],
    ]
    score_table = Table(score_data, colWidths=[3 * inch, 2 * inch])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 20))

    # Strengths & Weaknesses
    strengths = evaluation.get("strengths", [])
    if isinstance(strengths, list) and strengths:
        elements.append(Paragraph("Strengths", heading_style))
        for s in strengths:
            elements.append(Paragraph(f"  • {s}", styles["Normal"]))
        elements.append(Spacer(1, 12))

    weaknesses = evaluation.get("weaknesses", [])
    if isinstance(weaknesses, list) and weaknesses:
        elements.append(Paragraph("Areas for Improvement", heading_style))
        for w in weaknesses:
            elements.append(Paragraph(f"  • {w}", styles["Normal"]))
        elements.append(Spacer(1, 12))

    # Detailed Feedback
    feedback = evaluation.get("detailed_feedback", "")
    if feedback:
        elements.append(Paragraph("Detailed Feedback", heading_style))
        elements.append(Paragraph(feedback, styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
