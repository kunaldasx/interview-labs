"""Report API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/evaluation/{evaluation_id}/pdf")
async def download_evaluation_pdf(
    evaluation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = ReportService(db)
    try:
        pdf_bytes = await service.generate_evaluation_pdf(evaluation_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=evaluation_{evaluation_id}.pdf"},
    )


@router.get("/candidates/excel")
async def download_candidates_excel(
    job_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = ReportService(db)
    excel_bytes = await service.generate_candidates_report(job_id=job_id)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=candidates_report.xlsx"},
    )


@router.get("/pipeline/excel")
async def download_pipeline_excel(
    job_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = ReportService(db)
    excel_bytes = await service.generate_pipeline_report(job_id=job_id)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pipeline_report.xlsx"},
    )


@router.get("/evaluations/excel")
async def download_evaluations_excel(
    job_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "hr_manager", "placement_officer")),
):
    service = ReportService(db)
    excel_bytes = await service.generate_evaluations_report(job_id=job_id)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=evaluations_report.xlsx"},
    )
