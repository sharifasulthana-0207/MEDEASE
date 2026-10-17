from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from models.database import get_db, MedicineReference
from schemas.pydantic_models import MedicineReferenceDto

router = APIRouter(tags=["Medicine Reference"])

@router.get("/medicine/{canonical_name}")
def get_medicine_info(canonical_name: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    ref = (
        db.query(MedicineReference)
        .filter(
            (MedicineReference.canonical_name.ilike(canonical_name)) |
            (MedicineReference.generic_name.ilike(canonical_name))
        )
        .first()
    )
    if not ref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "MEDICINE_NOT_IN_REFERENCE",
                "message": f"Medicine '{canonical_name}' was not found in verified reference formulary. MEDEASE does not invent medicine information.",
                "details": {"query": canonical_name}
            }
        )

    return {
        "id": ref.id,
        "canonical_name": ref.canonical_name,
        "generic_name": ref.generic_name,
        "active_ingredients": ref.active_ingredients_json or [],
        "strength": ref.strength,
        "dosage_form": ref.dosage_form,
        "route": ref.route,
        "release_type": ref.release_type,
        "common_purpose_en": ref.common_purpose_en,
        "common_purpose_hi": ref.common_purpose_hi,
        "common_purpose_te": ref.common_purpose_te,
        "source_label": ref.source_label,
        "is_demo_reference": ref.is_demo_reference,
        "generic_vs_brand": f"'{ref.canonical_name}' contains the approved generic compound '{ref.generic_name}'.",
        "medical_disclaimer": "This is general medicine information from an approved reference dataset, not a clinical diagnosis or treatment recommendation. Always consult a licensed healthcare provider."
    }
