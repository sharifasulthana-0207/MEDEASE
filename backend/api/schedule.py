from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from models.database import get_db
from schemas.pydantic_models import (
    ReminderDto, ReminderStatusUpdateRequest, AdherenceReportDto
)
from services.scheduling.schedule_service import ScheduleService

router = APIRouter(tags=["Schedule & Adherence"])

@router.get("/schedule/today")
def get_today_schedule(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    return ScheduleService.get_today_reminders(db)

@router.post("/reminders/{reminder_id}/status")
def update_reminder_status(
    reminder_id: str,
    payload: ReminderStatusUpdateRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    valid_statuses = ["taken", "skipped", "snoozed", "upcoming"]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_STATUS", "message": f"Status must be one of {valid_statuses}"}
        )

    updated = ScheduleService.update_reminder_status(db, reminder_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "REMINDER_NOT_FOUND", "message": "Reminder not found"}
        )

    return {
        "reminder_id": updated.id,
        "status": updated.status,
        "acted_at": updated.acted_at.isoformat() if updated.acted_at else None,
        "scheduled_for": updated.scheduled_for.isoformat()
    }

@router.get("/adherence", response_model=AdherenceReportDto)
def get_adherence_report(
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db)
):
    report = ScheduleService.calculate_adherence(db)
    report.date_from = date_from
    report.date_to = date_to
    return report

@router.post("/schedule/cleanup")
def cleanup_duplicate_schedules(db: Session = Depends(get_db)) -> Dict[str, Any]:
    deleted = ScheduleService.clean_database_duplicates(db)
    return {
        "status": "success",
        "message": "Cleaned up duplicate demo prescriptions, duplicate schedules, and duplicate reminders",
        "deleted": deleted
    }

@router.post("/schedule/reset")
def reset_all_schedules(db: Session = Depends(get_db)) -> Dict[str, Any]:
    ScheduleService.clean_all_duplicate_schedules(db)
    return {
        "status": "success",
        "message": "All medication schedules and adherence history reset"
    }

