"""Report generation Celery tasks."""
import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.generate_report")
def generate_report(report_type: str, params: dict):
    logger.info(f"Generating report: {report_type} with params: {params}")

    if report_type == "candidate_pdf":
        from app.utils.pdf_generator import generate_candidate_report
        return generate_candidate_report(**params)
    elif report_type == "candidates_excel":
        from app.utils.excel_generator import generate_candidates_excel
        return generate_candidates_excel(params.get("candidates", []))
    elif report_type == "evaluations_excel":
        from app.utils.excel_generator import generate_evaluation_excel
        return generate_evaluation_excel(params.get("evaluations", []))

    logger.error(f"Unknown report type: {report_type}")
    return None
