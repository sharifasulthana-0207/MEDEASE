from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from models.database import (
    get_db, Medication, MedicationField, VerificationEvent, MedicineReference
)
from schemas.pydantic_models import (
    VerifyFieldRequest, UpdateMedicationRequest, FieldStatus
)
from services.validation.normalizer import MedicineNormalizer
from services.validation.reference_matcher import ReferenceMatcher
from services.safety_gate.safety_gate import SafetyGate
from services.scheduling.schedule_service import ScheduleService

router = APIRouter(prefix="/medications", tags=["Medications"])

@router.post("/{medication_id}/verify")
def verify_medication_field(
    medication_id: str,
    payload: VerifyFieldRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "MEDICATION_NOT_FOUND", "message": "Medication not found", "details": {}}
        )

    field_record = (
        db.query(MedicationField)
        .filter(MedicationField.medication_id == medication_id, MedicationField.field_name == payload.field_name)
        .first()
    )

    old_val = field_record.value_json if field_record else getattr(med, payload.field_name, None)
    new_val = payload.new_value if payload.new_value is not None else old_val

    # Audit Trail: Record verification_event
    event = VerificationEvent(
        medication_id=med.id,
        field_name=payload.field_name,
        old_value_json=old_val,
        new_value_json=new_val,
        action=payload.action,
        actor="user"
    )
    db.add(event)

    # Update the specific MedicationField
    if not field_record:
        field_record = MedicationField(
            medication_id=med.id,
            field_name=payload.field_name,
            value_json=new_val,
            confidence=1.0,
            status=FieldStatus.VERIFIED.value,
            source="user",
            validation_message="Human confirmed and verified"
        )
        db.add(field_record)
    else:
        field_record.value_json = new_val
        field_record.confidence = 1.0 # Technical signal after human verification
        field_record.status = FieldStatus.VERIFIED.value
        field_record.source = "user"
        field_record.validation_message = "Human confirmed and verified"

    # Update parent medication attributes
    if payload.field_name == "medicine_name":
        med.medicine_name_raw = str(new_val)
        norm_name, _ = MedicineNormalizer.normalize_medicine_name(str(new_val))
        med.medicine_name_normalized = norm_name
    elif payload.field_name == "frequency":
        norm_freq, times, _ = MedicineNormalizer.normalize_frequency(str(new_val))
        med.frequency = norm_freq
        med.frequency_times_json = times
    elif payload.field_name == "duration":
        days = MedicineNormalizer.parse_duration_days(new_val)
        if days:
            med.duration_days = days
    elif payload.field_name == "strength":
        med.strength = str(new_val)
    elif payload.field_name == "dosage_form":
        med.dosage_form = MedicineNormalizer.normalize_dosage_form(str(new_val))
    elif payload.field_name == "route":
        med.route = MedicineNormalizer.normalize_route(str(new_val))

    db.flush()

    # Re-build field records for Safety Gate evaluation
    all_fields = db.query(MedicationField).filter(MedicationField.medication_id == med.id).all()
    fields_dict = {}
    for f in all_fields:
        fields_dict[f.field_name] = {
            "value": f.value_json,
            "confidence": f.confidence,
            "status": f.status,
            "source": f.source
        }

    # Reference check
    ref_obj, ref_match = ReferenceMatcher.match_medicine(
        db=db,
        medicine_name=med.medicine_name_normalized or med.medicine_name_raw,
        strength=med.strength,
        dosage_form=med.dosage_form,
        route=med.route
    )

    safety_eval = SafetyGate.evaluate(
        medication_data={"medicine_name_raw": med.medicine_name_raw},
        field_records=fields_dict,
        reference_match=ref_match
    )

    med.critical_fields_complete = safety_eval.scheduling_allowed
    med.safety_gate_status = safety_eval.safety_gate_status
    med.safety_gate_reasons_json = safety_eval.blocking_reasons

    db.commit()
    db.refresh(med)

    return {
        "medication_id": med.id,
        "field_name": payload.field_name,
        "action": payload.action,
        "new_value": new_val,
        "critical_fields_complete": med.critical_fields_complete,
        "safety_gate_status": med.safety_gate_status,
        "scheduling_allowed": safety_eval.scheduling_allowed,
        "blocking_reasons": safety_eval.blocking_reasons,
        "message": "Human verified. Medication schedule unlocked." if safety_eval.scheduling_allowed else "Field verified, but additional fields require confirmation."
    }

@router.put("/{medication_id}")
def update_medication(
    medication_id: str,
    payload: UpdateMedicationRequest,
    db: Session = Depends(get_db)
):
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Medication not found"}
        )

    for attr, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(med, attr, val)

    db.commit()
    return {"status": "updated", "medication_id": med.id}

@router.post("/{medication_id}/schedule")
def schedule_medication(
    medication_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Medication not found"}
        )

    # SAFETY GATE ENFORCEMENT
    if not med.critical_fields_complete or med.safety_gate_status != "VERIFIED":
        reasons = med.safety_gate_reasons_json or ["Critical medication fields are unverified."]
        error_msg = reasons[0] if reasons else "Medication has not passed deterministic Safety Gate."
        code = "SAFETY_GATE_BLOCKED"
        if "Frequency" in error_msg:
            code = "FREQUENCY_UNCLEAR"

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": code,
                "message": error_msg,
                "details": {
                    "scheduling_allowed": False,
                    "safety_gate_status": med.safety_gate_status,
                    "blocking_reasons": reasons
                }
            }
        )

    # Generate schedule and reminders
    schedule = ScheduleService.generate_schedule(db, med)

    return {
        "schedule_id": schedule.id,
        "medication_id": med.id,
        "schedule_status": schedule.schedule_status,
        "start_date": schedule.start_date.isoformat(),
        "end_date": schedule.end_date.isoformat() if schedule.end_date else None,
        "scheduled_times": schedule.scheduled_times_json or [],
        "reminders_created": len(schedule.reminders),
        "message": "Medication schedule generated successfully."
    }
