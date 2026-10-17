import os
import uuid
import shutil
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from models.database import get_db, Prescription, Medication, MedicationField, MedicineReference, User
from schemas.pydantic_models import PrescriptionDetailDto, MedicationDetailDto, MedicationFieldDto
from services.image_quality import ImageQualityAssessment
from services.ai import get_ai_provider
from services.validation.normalizer import MedicineNormalizer
from services.validation.reference_matcher import ReferenceMatcher
from services.safety_gate.safety_gate import SafetyGate

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "uploads"))
FIXTURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "fixtures"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024 # 10 MB

@router.post("/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # 1. Validate MIME type
    valid_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_FILE_TYPE",
                "message": "Only JPEG, PNG, and WebP prescription images are supported.",
                "details": {"provided_type": file.content_type}
            }
        )

    # 2. Read and validate size
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": "Prescription image exceeds maximum size limit of 10MB.",
                "details": {"size_bytes": len(content), "max_bytes": MAX_UPLOAD_BYTES}
            }
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_FILE", "message": "Uploaded file is empty.", "details": {}}
        )

    # 3. Assess image quality
    quality_status, quality_details = ImageQualityAssessment.assess_image(content)

    # 4. Save privately
    ext = os.path.splitext(file.filename or "rx.jpg")[1] or ".jpg"
    safe_filename = f"{uuid.uuid4()}{ext}"
    target_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(target_path, "wb") as f:
        f.write(content)

    # 5. Create database record
    prescription = Prescription(
        original_filename=file.filename or "prescription.jpg",
        image_storage_path=target_path,
        processing_status="uploaded",
        image_quality_status=quality_status,
        image_quality_details_json=quality_details
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "prescription_id": prescription.id,
        "filename": prescription.original_filename,
        "processing_status": prescription.processing_status,
        "image_quality_status": prescription.image_quality_status,
        "image_quality_details": quality_details,
        "warning": quality_details.get("issues", []) if quality_status != "good" else []
    }

@router.post("/{prescription_id}/process")
def process_prescription(
    prescription_id: str,
    fixture_mode: str = None, # 'success', 'controlled_failure', or None for live/default
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PRESCRIPTION_NOT_FOUND", "message": "Prescription not found", "details": {}}
        )

    prescription.processing_status = "processing"
    db.commit()

    # Read image bytes
    image_bytes = b""
    if prescription.image_storage_path and os.path.exists(prescription.image_storage_path):
        with open(prescription.image_storage_path, "rb") as f:
            image_bytes = f.read()

    provider = get_ai_provider()
    # If fixture mode passed explicitly or set on prescription
    f_mode = fixture_mode or ("controlled_failure" if prescription.is_demo_fixture else None)

    vision_res = provider.analyze_prescription_image(image_bytes)
    extraction = provider.extract_medication_fields(vision_res.raw_ocr_text, context={"fixture_type": f_mode})

    # Clear old medications for clean reprocessing
    db.query(Medication).filter(Medication.prescription_id == prescription.id).delete()
    db.flush()

    processed_medications = []

    for med_ext in extraction.medications:
        # Abbreviation & name normalization
        norm_name, canonical_hint = MedicineNormalizer.normalize_medicine_name(med_ext.medicine_name.value)
        norm_freq, default_times, freq_desc = MedicineNormalizer.normalize_frequency(med_ext.frequency.value)
        norm_form = MedicineNormalizer.normalize_dosage_form(med_ext.dosage_form.value)
        norm_route = MedicineNormalizer.normalize_route(med_ext.route.value)
        duration_days = MedicineNormalizer.parse_duration_days(med_ext.duration.value)

        # Deterministic Reference Validation
        ref_obj, ref_match = ReferenceMatcher.match_medicine(
            db=db,
            medicine_name=canonical_hint or norm_name,
            strength=med_ext.strength.value,
            dosage_form=norm_form,
            route=norm_route
        )

        active_ingredient = ref_obj.generic_name if ref_obj else None

        med_record = Medication(
            prescription_id=prescription.id,
            medicine_name_raw=med_ext.medicine_name.value or "Unknown Medicine",
            medicine_name_normalized=norm_name,
            active_ingredient=active_ingredient,
            strength=med_ext.strength.value,
            dosage_form=norm_form,
            frequency=norm_freq,
            frequency_times_json=default_times,
            duration_days=duration_days or 5,
            route=norm_route,
            critical_fields_complete=False
        )
        db.add(med_record)
        db.flush()

        # Build field records dictionary for Safety Gate
        field_records = {
            "medicine_name": {
                "value": med_ext.medicine_name.value,
                "confidence": med_ext.medicine_name.confidence,
                "status": med_ext.medicine_name.status,
                "source": med_ext.medicine_name.source,
                "validation_message": med_ext.medicine_name.validation_message
            },
            "strength": {
                "value": med_ext.strength.value,
                "confidence": med_ext.strength.confidence,
                "status": med_ext.strength.status,
                "source": med_ext.strength.source,
                "validation_message": med_ext.strength.validation_message
            },
            "dosage_form": {
                "value": norm_form,
                "confidence": med_ext.dosage_form.confidence,
                "status": med_ext.dosage_form.status,
                "source": med_ext.dosage_form.source,
                "validation_message": med_ext.dosage_form.validation_message
            },
            "frequency": {
                "value": norm_freq,
                "confidence": med_ext.frequency.confidence,
                "status": med_ext.frequency.status,
                "source": med_ext.frequency.source,
                "validation_message": med_ext.frequency.validation_message
            },
            "duration": {
                "value": f"{duration_days} days" if duration_days else med_ext.duration.value,
                "confidence": med_ext.duration.confidence,
                "status": med_ext.duration.status,
                "source": med_ext.duration.source,
                "validation_message": med_ext.duration.validation_message
            },
            "route": {
                "value": norm_route,
                "confidence": med_ext.route.confidence,
                "status": med_ext.route.status,
                "source": med_ext.route.source,
                "validation_message": med_ext.route.validation_message
            }
        }

        # Save individual field rows in DB
        for fname, fdata in field_records.items():
            db_field = MedicationField(
                medication_id=med_record.id,
                field_name=fname,
                value_json=fdata["value"],
                confidence=fdata["confidence"],
                status=fdata["status"].value if hasattr(fdata["status"], "value") else str(fdata["status"]),
                source=fdata["source"],
                validation_message=fdata.get("validation_message")
            )
            db.add(db_field)

        # Run Deterministic Safety Gate
        safety_eval = SafetyGate.evaluate(
            medication_data={
                "medicine_name_raw": med_record.medicine_name_raw,
                "medicine_name_normalized": med_record.medicine_name_normalized,
            },
            field_records=field_records,
            reference_match=ref_match
        )

        med_record.critical_fields_complete = safety_eval.scheduling_allowed
        med_record.safety_gate_status = safety_eval.safety_gate_status
        med_record.safety_gate_reasons_json = safety_eval.blocking_reasons

        processed_medications.append({
            "id": med_record.id,
            "medicine_name_raw": med_record.medicine_name_raw,
            "medicine_name_normalized": med_record.medicine_name_normalized,
            "active_ingredient": med_record.active_ingredient,
            "strength": med_record.strength,
            "dosage_form": med_record.dosage_form,
            "frequency": med_record.frequency,
            "duration_days": med_record.duration_days,
            "route": med_record.route,
            "safety_gate_status": med_record.safety_gate_status,
            "scheduling_allowed": safety_eval.scheduling_allowed,
            "blocking_reasons": safety_eval.blocking_reasons,
            "fields": field_records
        })

    prescription.processing_status = "extracted"
    db.commit()

    return {
        "prescription_id": prescription.id,
        "processing_status": prescription.processing_status,
        "medications": processed_medications,
        "overall_notes": extraction.overall_notes
    }

@router.get("/{prescription_id}")
def get_prescription(prescription_id: str, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Prescription not found", "details": {}}
        )

    meds = []
    for med in prescription.medications:
        fields = []
        for f in med.fields:
            fields.append({
                "id": f.id,
                "field_name": f.field_name,
                "value": f.value_json,
                "confidence": f.confidence,
                "status": f.status,
                "source": f.source,
                "validation_message": f.validation_message,
                "updated_at": f.updated_at.isoformat() if f.updated_at else None
            })
        meds.append({
            "id": med.id,
            "prescription_id": med.prescription_id,
            "medicine_name_raw": med.medicine_name_raw,
            "medicine_name_normalized": med.medicine_name_normalized,
            "active_ingredient": med.active_ingredient,
            "strength": med.strength,
            "dosage_form": med.dosage_form,
            "frequency": med.frequency,
            "frequency_times": med.frequency_times_json or [],
            "duration_days": med.duration_days,
            "route": med.route,
            "critical_fields_complete": med.critical_fields_complete,
            "safety_gate_status": med.safety_gate_status,
            "safety_gate_reasons": med.safety_gate_reasons_json or [],
            "has_schedule": med.schedule is not None,
            "fields": fields
        })

    return {
        "id": prescription.id,
        "original_filename": prescription.original_filename,
        "processing_status": prescription.processing_status,
        "image_quality_status": prescription.image_quality_status,
        "image_quality_details": prescription.image_quality_details_json or {},
        "is_demo_fixture": prescription.is_demo_fixture,
        "created_at": prescription.created_at.isoformat(),
        "medications": meds
    }

@router.get("/{prescription_id}/image-url")
def get_prescription_image(prescription_id: str, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription or not prescription.image_storage_path or not os.path.exists(prescription.image_storage_path):
        # Fallback to fixtures if demo
        fallback_path = os.path.join(FIXTURES_DIR, "prescription_success.jpg")
        if os.path.exists(fallback_path):
            return FileResponse(fallback_path, media_type="image/jpeg")
        raise HTTPException(status_code=404, detail={"code": "IMAGE_NOT_FOUND", "message": "Image not found"})

    return FileResponse(prescription.image_storage_path, media_type="image/jpeg")

@router.get("/{prescription_id}/medications")
def get_prescription_medications(prescription_id: str, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Prescription not found"})
    return get_prescription(prescription_id, db)["medications"]
