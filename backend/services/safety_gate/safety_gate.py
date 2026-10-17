from typing import List, Dict, Any, Optional
from schemas.pydantic_models import SafetyGateResult, FieldStatus

CONFIDENCE_THRESHOLD = 0.70 # Fields with technical confidence below this require human verification

class SafetyGate:
    @staticmethod
    def evaluate(
        medication_data: Dict[str, Any],
        field_records: Dict[str, Any],
        reference_match: Optional[Dict[str, Any]] = None
    ) -> SafetyGateResult:
        """
        Deterministic, testable backend Safety Gate.
        Evaluates critical fields: medicine identity, strength, frequency, duration, form, route.
        Blocks scheduling until all critical fields are VERIFIED without conflict or low confidence.
        """
        blocking_reasons: List[str] = []
        statuses: List[str] = []

        critical_fields = ["medicine_name", "strength", "dosage_form", "frequency", "duration", "route"]

        # 1. Reference validation check
        if not reference_match or not reference_match.get("matched", False):
            blocking_reasons.append(
                f"Medicine '{medication_data.get('medicine_name_raw')}' is not verified in reference formulary. Human verification required."
            )
            statuses.append(FieldStatus.NEEDS_VERIFICATION)

        # 2. Check each critical field
        for field in critical_fields:
            field_rec = field_records.get(field)
            if not field_rec:
                blocking_reasons.append(f"Field '{field}' is missing from extraction.")
                statuses.append(FieldStatus.MISSING)
                continue

            status = field_rec.get("status")
            confidence = float(field_rec.get("confidence", 0.0))
            value = field_rec.get("value")
            source = field_rec.get("source", "")

            # If user manually confirmed or edited, it is human-verified
            is_human_verified = (source == "user") or (status == FieldStatus.VERIFIED)

            if value is None or str(value).strip() == "" or status == FieldStatus.MISSING:
                blocking_reasons.append(f"Required field '{field}' was not extracted (missing).")
                statuses.append(FieldStatus.MISSING)
            elif status == FieldStatus.CONFLICTING:
                blocking_reasons.append(f"Field '{field}' has conflicting interpretations between OCR passes.")
                statuses.append(FieldStatus.CONFLICTING)
            elif not is_human_verified and confidence < CONFIDENCE_THRESHOLD:
                # Controlled failure example: Frequency has 58% confidence
                if field == "frequency":
                    blocking_reasons.append("Frequency could not be read confidently. Please verify this information from the original prescription before continuing.")
                elif field == "medicine_name":
                    blocking_reasons.append("Medicine identity could not be read with high technical confidence.")
                else:
                    blocking_reasons.append(f"{field.replace('_', ' ').capitalize()} has low extraction confidence ({int(confidence*100)}%). Verification required.")
                statuses.append(FieldStatus.NEEDS_VERIFICATION)
            elif status == FieldStatus.NEEDS_VERIFICATION and not is_human_verified:
                blocking_reasons.append(f"Field '{field}' requires human verification.")
                statuses.append(FieldStatus.NEEDS_VERIFICATION)
            else:
                statuses.append(FieldStatus.VERIFIED)

        # Determine overall safety gate status
        if any(s == FieldStatus.CONFLICTING for s in statuses):
            overall_status = FieldStatus.CONFLICTING
        elif any(s == FieldStatus.MISSING for s in statuses):
            overall_status = FieldStatus.MISSING
        elif any(s == FieldStatus.NEEDS_VERIFICATION for s in statuses):
            overall_status = FieldStatus.NEEDS_VERIFICATION
        else:
            overall_status = FieldStatus.VERIFIED

        scheduling_allowed = (len(blocking_reasons) == 0 and overall_status == FieldStatus.VERIFIED)

        return SafetyGateResult(
            scheduling_allowed=scheduling_allowed,
            safety_gate_status=overall_status.value if hasattr(overall_status, "value") else str(overall_status),
            blocking_reasons=blocking_reasons
        )
