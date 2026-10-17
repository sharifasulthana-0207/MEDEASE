from datetime import datetime, date, timedelta, time
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models.database import (
    Medication, MedicationSchedule, Reminder, AdherenceEvent
)
from schemas.pydantic_models import AdherenceReportDto, ReminderDto

class ScheduleService:
    @staticmethod
    def generate_schedule(
        db: Session,
        medication: Medication,
        start_dt: Optional[datetime] = None
    ) -> MedicationSchedule:
        """
        Creates a schedule and reminder slots for a verified medication.
        Must only be called AFTER Safety Gate has verified all critical fields.
        Automatically removes prior duplicate schedules for the same medicine.
        """
        if not start_dt:
            start_dt = datetime.utcnow()

        # 1. Clean existing schedule for this specific medication
        existing = db.query(MedicationSchedule).filter(MedicationSchedule.medication_id == medication.id).all()
        for old in existing:
            db.query(Reminder).filter(Reminder.schedule_id == old.id).delete()
            db.delete(old)
        db.flush()

        # 2. De-duplicate: Clean any previous active schedules for the SAME medicine name to avoid stacking
        norm_name = (medication.medicine_name_normalized or medication.medicine_name_raw).strip().lower()
        same_med_schedules = (
            db.query(MedicationSchedule)
            .join(Medication, MedicationSchedule.medication_id == Medication.id)
            .filter(
                (Medication.medicine_name_normalized == norm_name) |
                (Medication.medicine_name_raw == medication.medicine_name_raw),
                MedicationSchedule.medication_id != medication.id
            )
            .all()
        )
        for old_same in same_med_schedules:
            db.query(Reminder).filter(Reminder.schedule_id == old_same.id).delete()
            db.delete(old_same)
        db.flush()


        duration_days = medication.duration_days or 5
        end_dt = start_dt + timedelta(days=duration_days)
        times = medication.frequency_times_json or ["09:00", "21:00"]

        sched = MedicationSchedule(
            medication_id=medication.id,
            start_date=start_dt,
            end_date=end_dt,
            scheduled_times_json=times,
            schedule_status="active"
        )
        db.add(sched)
        db.flush()

        # Populate reminders for the duration
        today = start_dt.date()
        for day_idx in range(duration_days):
            target_date = today + timedelta(days=day_idx)
            for t_str in times:
                try:
                    parts = t_str.split(":")
                    hour = int(parts[0])
                    minute = int(parts[1]) if len(parts) > 1 else 0
                    scheduled_time = datetime.combine(target_date, time(hour, minute))
                except Exception:
                    scheduled_time = datetime.combine(target_date, time(9, 0))

                reminder = Reminder(
                    schedule_id=sched.id,
                    scheduled_for=scheduled_time,
                    status="upcoming"
                )
                db.add(reminder)

        db.commit()
        db.refresh(sched)
        return sched

    @staticmethod
    def get_today_reminders(db: Session) -> List[Dict[str, Any]]:
        today_start = datetime.combine(date.today(), time.min)
        today_end = datetime.combine(date.today(), time.max)

        reminders = (
            db.query(Reminder, Medication)
            .join(MedicationSchedule, Reminder.schedule_id == MedicationSchedule.id)
            .join(Medication, MedicationSchedule.medication_id == Medication.id)
            .filter(Reminder.scheduled_for >= today_start, Reminder.scheduled_for <= today_end)
            .order_by(Reminder.scheduled_for.asc(), Reminder.created_at.desc())
            .all()
        )

        # Group and deduplicate by (normalized_medicine_name, scheduled_time_hour_minute)
        # Priority: taken (4) > snoozed (3) > skipped (2) > upcoming (1)
        priority = {"taken": 4, "snoozed": 3, "skipped": 2, "upcoming": 1}
        groups: Dict[str, Dict[str, Any]] = {}

        for rem, med in reminders:
            med_key = (med.medicine_name_normalized or med.medicine_name_raw).strip().lower()
            time_key = rem.scheduled_for.strftime("%H:%M")
            dedup_key = f"{med_key}_{time_key}"

            rem_dto = {
                "id": rem.id,
                "schedule_id": rem.schedule_id,
                "medicine_name": med.medicine_name_raw,
                "medicine_name_normalized": med.medicine_name_normalized or med.medicine_name_raw,
                "strength": med.strength,
                "dosage_form": med.dosage_form,
                "scheduled_for": rem.scheduled_for.isoformat(),
                "status": rem.status,
                "acted_at": rem.acted_at.isoformat() if rem.acted_at else None
            }

            if dedup_key not in groups:
                groups[dedup_key] = rem_dto
            else:
                existing_pri = priority.get(groups[dedup_key]["status"], 0)
                new_pri = priority.get(rem.status, 0)
                if new_pri > existing_pri:
                    groups[dedup_key] = rem_dto

        results = list(groups.values())
        results.sort(key=lambda x: (x["scheduled_for"], x["medicine_name"]))
        return results

    @staticmethod
    def update_reminder_status(db: Session, reminder_id: str, new_status: str) -> Optional[Reminder]:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            return None

        now = datetime.utcnow()
        reminder.status = new_status
        reminder.acted_at = now

        if new_status == "snoozed":
            # Add 15 minutes to scheduled_for
            reminder.scheduled_for = reminder.scheduled_for + timedelta(minutes=15)

        event = AdherenceEvent(
            reminder_id=reminder.id,
            status=new_status,
            occurred_at=now
        )
        db.add(event)

        # Sync any duplicate reminders for the same medicine and time slot to avoid stale rows
        sched = db.query(MedicationSchedule).filter(MedicationSchedule.id == reminder.schedule_id).first()
        if sched:
            med = db.query(Medication).filter(Medication.id == sched.medication_id).first()
            if med:
                norm_name = (med.medicine_name_normalized or med.medicine_name_raw).strip().lower()
                time_key = reminder.scheduled_for.strftime("%H:%M")
                date_key = reminder.scheduled_for.date()

                other_rems = (
                    db.query(Reminder)
                    .join(MedicationSchedule, Reminder.schedule_id == MedicationSchedule.id)
                    .join(Medication, MedicationSchedule.medication_id == Medication.id)
                    .filter(
                        Reminder.id != reminder.id,
                        (Medication.medicine_name_normalized == norm_name) | (Medication.medicine_name_raw == med.medicine_name_raw)
                    )
                    .all()
                )
                for o in other_rems:
                    if o.scheduled_for.date() == date_key and o.scheduled_for.strftime("%H:%M") == time_key:
                        o.status = new_status
                        o.acted_at = now

        db.commit()
        db.refresh(reminder)
        return reminder

    @staticmethod
    def calculate_adherence(db: Session) -> AdherenceReportDto:
        # Calculate adherence based on today's unique scheduled doses
        today_reminders = ScheduleService.get_today_reminders(db)
        total = len(today_reminders)
        taken = sum(1 for r in today_reminders if r["status"] == "taken")
        skipped = sum(1 for r in today_reminders if r["status"] == "skipped")
        snoozed = sum(1 for r in today_reminders if r["status"] == "snoozed")
        upcoming = sum(1 for r in today_reminders if r["status"] == "upcoming")

        acted_total = taken + skipped
        if acted_total > 0:
            pct = round((taken / acted_total) * 100.0, 1)
        elif total > 0:
            pct = 100.0
        else:
            pct = 0.0

        return AdherenceReportDto(
            total_reminders=total,
            taken_count=taken,
            skipped_count=skipped,
            snoozed_count=snoozed,
            upcoming_count=upcoming,
            adherence_percentage=pct
        )

    @staticmethod
    def clean_database_duplicates(db: Session) -> Dict[str, int]:
        """Purges old duplicate demo prescriptions and duplicate schedules"""
        from models.database import Prescription, VerificationEvent
        deleted = {"prescriptions": 0, "schedules": 0, "reminders": 0}

        fixtures = ["actual_prescription.png", "prescription_success.jpg", "prescription_controlled_failure.jpg"]
        for fix_name in fixtures:
            demos = (
                db.query(Prescription)
                .filter(Prescription.original_filename == fix_name, Prescription.is_demo_fixture == True)
                .order_by(Prescription.created_at.desc())
                .all()
            )
            if len(demos) > 1:
                to_delete = demos[1:]
                for old in to_delete:
                    meds = db.query(Medication).filter(Medication.prescription_id == old.id).all()
                    for m in meds:
                        scheds = db.query(MedicationSchedule).filter(MedicationSchedule.medication_id == m.id).all()
                        for s in scheds:
                            deleted["reminders"] += db.query(Reminder).filter(Reminder.schedule_id == s.id).delete()
                            db.delete(s)
                            deleted["schedules"] += 1
                        db.query(VerificationEvent).filter(VerificationEvent.medication_id == m.id).delete()
                        db.delete(m)
                    db.delete(old)
                    deleted["prescriptions"] += 1
                db.commit()

        # Deduplicate schedules for same medicine
        meds = db.query(Medication).all()
        seen_names = {}
        for m in meds:
            norm = (m.medicine_name_normalized or m.medicine_name_raw).strip().lower()
            sched = db.query(MedicationSchedule).filter(MedicationSchedule.medication_id == m.id).first()
            if not sched:
                continue
            if norm in seen_names:
                deleted["reminders"] += db.query(Reminder).filter(Reminder.schedule_id == sched.id).delete()
                db.delete(sched)
                deleted["schedules"] += 1
            else:
                seen_names[norm] = sched.id
        db.commit()
        return deleted

    @staticmethod
    def clean_all_duplicate_schedules(db: Session):
        """Purges all schedules and adherence events for fresh start"""
        db.query(AdherenceEvent).delete()
        db.query(Reminder).delete()
        db.query(MedicationSchedule).delete()
        db.commit()

