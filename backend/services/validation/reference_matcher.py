from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from models.database import MedicineReference

class ReferenceMatcher:
    @staticmethod
    def match_medicine(
        db: Session,
        medicine_name: str,
        strength: Optional[str] = None,
        dosage_form: Optional[str] = None,
        route: Optional[str] = "oral"
    ) -> Tuple[Optional[MedicineReference], Dict[str, Any]]:
        """
        Validates medicine against canonical and generic reference records.
        Returns (reference_obj_or_none, match_details: dict)
        """
        if not medicine_name:
            return None, {"matched": False, "reason": "No medicine name provided"}

        cleaned = medicine_name.strip()
        # Query case-insensitively for canonical or generic
        ref = (
            db.query(MedicineReference)
            .filter(
                (MedicineReference.canonical_name.ilike(cleaned)) |
                (MedicineReference.generic_name.ilike(cleaned))
            )
            .first()
        )

        if not ref:
            return None, {
                "matched": False,
                "reason": f"Medicine '{medicine_name}' not found in approved reference formulary.",
                "canonical_match": False,
                "strength_match": False,
                "dosage_form_match": False,
                "route_match": False
            }

        # Check strength match if reference has strength
        strength_match = True
        if strength and ref.strength:
            # Simple normalization of strength e.g. 650mg vs 650 mg
            s_input = strength.lower().replace(" ", "")
            s_ref = ref.strength.lower().replace(" ", "")
            strength_match = (s_input in s_ref) or (s_ref in s_input)

        # Check dosage form match
        form_match = True
        if dosage_form and ref.dosage_form:
            form_match = dosage_form.lower() == ref.dosage_form.lower()

        # Check route match
        route_match = True
        if route and ref.route:
            route_match = route.lower() == ref.route.lower()

        is_full_match = strength_match and form_match and route_match

        return ref, {
            "matched": True,
            "canonical_name": ref.canonical_name,
            "generic_name": ref.generic_name,
            "strength_match": strength_match,
            "dosage_form_match": form_match,
            "route_match": route_match,
            "is_full_match": is_full_match,
            "reason": "Reference match verified" if is_full_match else "Partial reference match (strength/form mismatch)"
        }
