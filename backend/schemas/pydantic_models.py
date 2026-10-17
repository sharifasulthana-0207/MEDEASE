from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from enum import Enum

class FieldStatus(str, Enum):
    VERIFIED = "VERIFIED"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"
    MISSING = "MISSING"
    CONFLICTING = "CONFLICTING"

class FieldExtraction(BaseModel):
    value: Optional[Any] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    status: FieldStatus = FieldStatus.NEEDS_VERIFICATION
    source: str = "vision+llm"
    validation_message: Optional[str] = None

class MedicationExtraction(BaseModel):
    medicine_name: FieldExtraction
    strength: FieldExtraction
    dosage_form: FieldExtraction
    frequency: FieldExtraction
    duration: FieldExtraction
    route: FieldExtraction

class StructuredExtractionContract(BaseModel):
    medications: List[MedicationExtraction] = []
    overall_notes: List[str] = []
    image_quality: str = "good"

class SafetyGateResult(BaseModel):
    scheduling_allowed: bool
    safety_gate_status: str
    blocking_reasons: List[str] = []

class MedicationFieldDto(BaseModel):
    id: str
    field_name: str
    value: Optional[Any] = None
    confidence: float
    status: str
    source: str
    validation_message: Optional[str] = None
    updated_at: Optional[datetime] = None

class MedicationDetailDto(BaseModel):
    id: str
    prescription_id: str
    medicine_name_raw: str
    medicine_name_normalized: Optional[str] = None
    active_ingredient: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    frequency: Optional[str] = None
    frequency_times: List[str] = []
    duration_days: Optional[int] = None
    route: Optional[str] = None
    critical_fields_complete: bool
    safety_gate_status: str
    safety_gate_reasons: List[str] = []
    fields: List[MedicationFieldDto] = []
    has_schedule: bool = False

class PrescriptionDetailDto(BaseModel):
    id: str
    original_filename: Optional[str] = None
    processing_status: str
    image_quality_status: str
    image_quality_details: Dict[str, Any] = {}
    is_demo_fixture: bool = False
    created_at: datetime
    medications: List[MedicationDetailDto] = []

class VerifyFieldRequest(BaseModel):
    field_name: str
    action: str = "confirmed" # confirmed, edited, rejected
    new_value: Optional[Any] = None

class UpdateMedicationRequest(BaseModel):
    medicine_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    frequency: Optional[str] = None
    duration_days: Optional[int] = None
    route: Optional[str] = None

class ReminderDto(BaseModel):
    id: str
    schedule_id: str
    medicine_name: str
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    scheduled_for: datetime
    status: str # upcoming, taken, skipped, snoozed
    acted_at: Optional[datetime] = None

class ReminderStatusUpdateRequest(BaseModel):
    status: str # taken, skipped, snoozed

class AdherenceReportDto(BaseModel):
    total_reminders: int
    taken_count: int
    skipped_count: int
    snoozed_count: int
    upcoming_count: int
    adherence_percentage: float
    date_from: Optional[str] = None
    date_to: Optional[str] = None

class MedicineReferenceDto(BaseModel):
    id: str
    canonical_name: str
    generic_name: str
    active_ingredients: List[str] = []
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    route: str = "oral"
    release_type: str = "immediate"
    common_purpose_en: Optional[str] = None
    common_purpose_hi: Optional[str] = None
    common_purpose_te: Optional[str] = None
    source_label: str = "Reference Formulary (Verified)"
    is_demo_reference: bool = True

class TranslateRequest(BaseModel):
    text: str
    target_language: str # en, hi, te

class TranslateResponse(BaseModel):
    original_text: str
    target_language: str
    translated_text: str

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Dict[str, Any] = {}

class StandardErrorResponse(BaseModel):
    error: ErrorDetail
