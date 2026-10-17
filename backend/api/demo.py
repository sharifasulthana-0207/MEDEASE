import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from models.database import get_db, Prescription
from api.prescriptions import process_prescription, UPLOAD_DIR, FIXTURES_DIR

router = APIRouter(prefix="/demo", tags=["Demo Fixtures"])

@router.post("/load-fixture/{fixture_type}")
def load_demo_fixture(fixture_type: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    valid_fixtures = ["success", "controlled_failure", "actual_prescription"]
    if fixture_type not in valid_fixtures:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_FIXTURE", "message": f"fixture_type must be one of {valid_fixtures}"}
        )

    if fixture_type == "actual_prescription":
        fixture_filename = "actual_prescription.png"
    elif fixture_type == "controlled_failure":
        fixture_filename = "prescription_controlled_failure.jpg"
    else:
        fixture_filename = "prescription_success.jpg"

    src_path = os.path.join(FIXTURES_DIR, fixture_filename)

    # Copy to uploads dir
    ext = os.path.splitext(fixture_filename)[1] or ".jpg"
    dest_filename = f"demo_{fixture_type}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, dest_filename)

    # Clean up prior demo prescriptions of this fixture type to prevent accumulation
    from models.database import Medication, MedicationSchedule, Reminder, VerificationEvent
    prior_demos = db.query(Prescription).filter(
        Prescription.original_filename == fixture_filename,
        Prescription.is_demo_fixture == True
    ).all()
    for old in prior_demos:
        meds = db.query(Medication).filter(Medication.prescription_id == old.id).all()
        for m in meds:
            scheds = db.query(MedicationSchedule).filter(MedicationSchedule.medication_id == m.id).all()
            for s in scheds:
                db.query(Reminder).filter(Reminder.schedule_id == s.id).delete()
                db.delete(s)
            db.query(VerificationEvent).filter(VerificationEvent.medication_id == m.id).delete()
            db.delete(m)
        db.delete(old)
    db.commit()

    if os.path.exists(src_path):
        shutil.copyfile(src_path, dest_path)
    else:
        with open(dest_path, "wb") as f:
            f.write(b"DEMO_PRESCRIPTION_IMAGE")


    prescription = Prescription(
        original_filename=fixture_filename,
        image_storage_path=dest_path,
        processing_status="uploaded",
        image_quality_status="good",
        image_quality_details_json={"laplacian_variance": 1163.7, "is_blurry": False, "is_too_dark": False},
        is_demo_fixture=True
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    # Automatically trigger processing with the fixture type
    result = process_prescription(
        prescription_id=prescription.id,
        fixture_mode=fixture_type,
        db=db
    )

    return {
        "fixture_type": fixture_type,
        "prescription_id": prescription.id,
        "message": f"Loaded demo fixture: {fixture_type}",
        "data": result
    }
