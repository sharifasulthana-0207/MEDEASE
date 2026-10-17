import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from models.database import get_db, Medication, MedicineReference, PharmacyProvider
from services.pharmacy_service import PharmacyService

router = APIRouter(tags=["Pharmacy & Price Finder"])

@router.get("/medications/{medication_id}/pharmacy-options")
def get_medication_pharmacy_options(
    medication_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "MEDICATION_NOT_FOUND", "message": "Medication not found"}
        )

    return PharmacyService.get_pharmacy_options_for_medication(db, med)

@router.get("/pharmacy/search")
def search_pharmacies(
    query: str = Query(..., min_length=2, description="Medicine name or active ingredient to search"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    PharmacyService.ensure_seed_data(db)

    # Synthetic medication proxy for ad-hoc search
    clean_query = query.strip()
    encoded_query = urllib.parse.quote(clean_query)
    providers = db.query(PharmacyProvider).filter(PharmacyProvider.is_active == True).all()

    # Check if we have benchmark data
    results = []
    lowest_unit_price = float("inf")
    lowest_price_option = None

    for prov in providers:
        # Search URL fallback
        search_url = prov.search_url_template.replace("{query}", encoded_query)
        
        # Check database for exact or like match
        listing = PharmacyService.get_pharmacy_options_for_medication(
            db,
            Medication(
                id="search-temp",
                prescription_id="search-rx",
                medicine_name_raw=clean_query,
                medicine_name_normalized=clean_query,
                critical_fields_complete=True,
                safety_gate_status="VERIFIED"
            )
        )
        return listing

@router.get("/pharmacy/providers")
def get_supported_pharmacy_providers(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    PharmacyService.ensure_seed_data(db)
    providers = db.query(PharmacyProvider).filter(PharmacyProvider.is_active == True).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "base_url": p.base_url,
            "logo_color": p.logo_color
        }
        for p in providers
    ]
