import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from models.database import Base, get_db, MedicineReference, Prescription, Medication, MedicationField
from services.validation.normalizer import MedicineNormalizer
from services.validation.reference_matcher import ReferenceMatcher
from services.safety_gate.safety_gate import SafetyGate
from schemas.pydantic_models import (
    StructuredExtractionContract, MedicationExtraction, FieldExtraction, FieldStatus
)
from services.ai.demo_provider import DemoAIProvider
from services.scheduling.schedule_service import ScheduleService

client = TestClient(app)

# 1. Normalization tests
def test_medicine_normalizer():
    # Brand to canonical
    norm, canonical = MedicineNormalizer.normalize_medicine_name("DOLO 650")
    assert canonical == "Paracetamol"

    norm, canonical = MedicineNormalizer.normalize_medicine_name("Pan-40")
    assert canonical == "Pantoprazole"

    # Frequency normalization
    f, times, desc = MedicineNormalizer.normalize_frequency("BD")
    assert f == "BD"
    assert times == ["09:00", "21:00"]

    f, times, desc = MedicineNormalizer.normalize_frequency("TDS")
    assert f == "TDS"
    assert len(times) == 3

    # Form normalization
    assert MedicineNormalizer.normalize_dosage_form("TAB") == "Tablet"
    assert MedicineNormalizer.normalize_dosage_form("CAP") == "Capsule"

    # Duration parsing
    assert MedicineNormalizer.parse_duration_days("5 days") == 5
    assert MedicineNormalizer.parse_duration_days("2 weeks") == 14

# 2. Reference Matcher tests
def test_reference_matcher():
    from models.database import SessionLocal
    db = SessionLocal()
    try:
        ref, details = ReferenceMatcher.match_medicine(db, "Paracetamol", strength="650 mg", dosage_form="Tablet")
        assert ref is not None
        assert details["matched"] is True
        assert details["strength_match"] is True

        # Non-existent medicine
        ref_fake, details_fake = ReferenceMatcher.match_medicine(db, "NonExistentFakeMed123")
        assert ref_fake is None
        assert details_fake["matched"] is False
    finally:
        db.close()

# 3. Safety Gate Tests
def test_safety_gate_blocking_controlled_failure():
    # Frequency with low confidence (0.58) must BLOCK scheduling
    med_data = {"medicine_name_raw": "Pantoprazole"}
    field_records = {
        "medicine_name": {"value": "Pantoprazole", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "strength": {"value": "40 mg", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "dosage_form": {"value": "Tablet", "confidence": 0.92, "status": FieldStatus.VERIFIED},
        "frequency": {"value": "BD", "confidence": 0.58, "status": FieldStatus.NEEDS_VERIFICATION}, # Below 0.70
        "duration": {"value": "14 days", "confidence": 0.90, "status": FieldStatus.VERIFIED},
        "route": {"value": "oral", "confidence": 0.90, "status": FieldStatus.VERIFIED}
    }
    ref_match = {"matched": True, "canonical_name": "Pantoprazole"}

    result = SafetyGate.evaluate(med_data, field_records, ref_match)
    assert result.scheduling_allowed is False
    assert result.safety_gate_status == "NEEDS_VERIFICATION"
    assert any("Frequency could not be read confidently" in r for r in result.blocking_reasons)

def test_safety_gate_unlocked_after_verification():
    # User confirmed frequency -> scheduling ALLOWED
    med_data = {"medicine_name_raw": "Pantoprazole"}
    field_records = {
        "medicine_name": {"value": "Pantoprazole", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "strength": {"value": "40 mg", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "dosage_form": {"value": "Tablet", "confidence": 0.92, "status": FieldStatus.VERIFIED},
        "frequency": {"value": "BD", "confidence": 1.0, "status": FieldStatus.VERIFIED, "source": "user"},
        "duration": {"value": "14 days", "confidence": 0.90, "status": FieldStatus.VERIFIED},
        "route": {"value": "oral", "confidence": 0.90, "status": FieldStatus.VERIFIED}
    }
    ref_match = {"matched": True, "canonical_name": "Pantoprazole"}

    result = SafetyGate.evaluate(med_data, field_records, ref_match)
    assert result.scheduling_allowed is True
    assert result.safety_gate_status == "VERIFIED"
    assert len(result.blocking_reasons) == 0

def test_safety_gate_missing_and_conflicting_fields():
    # Missing duration
    med_data = {"medicine_name_raw": "Paracetamol"}
    field_records = {
        "medicine_name": {"value": "Paracetamol", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "strength": {"value": "650 mg", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "dosage_form": {"value": "Tablet", "confidence": 0.92, "status": FieldStatus.VERIFIED},
        "frequency": {"value": "BD", "confidence": 0.95, "status": FieldStatus.VERIFIED},
        "duration": {"value": None, "confidence": 0.0, "status": FieldStatus.MISSING}, # Missing
        "route": {"value": "oral", "confidence": 0.90, "status": FieldStatus.VERIFIED}
    }
    ref_match = {"matched": True, "canonical_name": "Paracetamol"}
    res = SafetyGate.evaluate(med_data, field_records, ref_match)
    assert res.scheduling_allowed is False
    assert res.safety_gate_status == "MISSING"

    # Conflicting field
    field_records["duration"] = {"value": "5 days vs 10 days", "confidence": 0.40, "status": FieldStatus.CONFLICTING}
    res_conf = SafetyGate.evaluate(med_data, field_records, ref_match)
    assert res_conf.scheduling_allowed is False
    assert res_conf.safety_gate_status == "CONFLICTING"

# 4. API Endpoints Test
def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "MEDEASE" in data["service"]

def test_languages_and_translation():
    res = client.get("/api/languages")
    assert res.status_code == 200
    langs = [l["code"] for l in res.json()]
    assert "en" in langs
    assert "hi" in langs
    assert "te" in langs

    # Test translation endpoint
    t_res = client.post("/api/translate", json={
        "text": "Human verified. Medication schedule unlocked.",
        "target_language": "hi"
    })
    assert t_res.status_code == 200
    assert "सत्यापित" in t_res.json()["translated_text"]

def test_demo_controlled_failure_workflow():
    # 1. Load controlled failure fixture
    load_res = client.post("/api/demo/load-fixture/controlled_failure")
    assert load_res.status_code == 200
    data = load_res.json()
    rx_id = data["prescription_id"]
    meds = data["data"]["medications"]
    assert len(meds) > 0
    med = meds[0]

    # Frequency has 58% confidence and scheduling is blocked
    assert med["frequency"] == "BD"
    assert med["scheduling_allowed"] is False
    assert med["safety_gate_status"] == "NEEDS_VERIFICATION"
    assert any("Frequency could not be read confidently" in r for r in med["blocking_reasons"])

    # 2. Attempting to schedule while blocked must return 403
    sched_res = client.post(f"/api/medications/{med['id']}/schedule")
    assert sched_res.status_code == 403
    err = sched_res.json()["error"]
    assert err["code"] == "FREQUENCY_UNCLEAR"

    # 3. User verifies/confirms the field
    verify_res = client.post(f"/api/medications/{med['id']}/verify", json={
        "field_name": "frequency",
        "action": "confirmed",
        "new_value": "BD"
    })
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["scheduling_allowed"] is True
    assert v_data["safety_gate_status"] == "VERIFIED"

    # 4. Scheduling now succeeds
    sched_res2 = client.post(f"/api/medications/{med['id']}/schedule")
    assert sched_res2.status_code == 200
    sched_data = sched_res2.json()
    assert sched_data["reminders_created"] > 0

    # 5. Check today's reminders
    today_res = client.get("/api/schedule/today")
    assert today_res.status_code == 200
    reminders = today_res.json()
    assert len(reminders) > 0
    r_id = reminders[0]["id"]

    # 6. Mark reminder as taken
    take_res = client.post(f"/api/reminders/{r_id}/status", json={"status": "taken"})
    assert take_res.status_code == 200
    assert take_res.json()["status"] == "taken"

    # 7. Check adherence report
    adh_res = client.get("/api/adherence")
    assert adh_res.status_code == 200
    adh_data = adh_res.json()
    assert adh_data["taken_count"] >= 1
    assert adh_data["adherence_percentage"] > 0


def test_demo_success_fixture():
    load_res = client.post("/api/demo/load-fixture/success")
    assert load_res.status_code == 200
    data = load_res.json()
    meds = data["data"]["medications"]
    assert len(meds) > 0
    assert meds[0]["medicine_name_raw"] == "Paracetamol"
    assert meds[0]["scheduling_allowed"] is True
    assert meds[0]["safety_gate_status"] == "VERIFIED"

def test_actual_prescription_fixture():
    # Test real-world prescription from Sai Ram Clinic
    load_res = client.post("/api/demo/load-fixture/actual_prescription")
    assert load_res.status_code == 200
    data = load_res.json()
    meds = data["data"]["medications"]
    assert len(meds) == 4

    med_names = [m["medicine_name_raw"] for m in meds]
    assert "Opox-CV" in med_names
    assert "Aldigesic-SP" in med_names
    assert "Breezy" in med_names
    assert "Pan-D" in med_names

    # Pan-D requires verification for morning before-food timing
    pan_d = next(m for m in meds if m["medicine_name_raw"] == "Pan-D")
    assert pan_d["scheduling_allowed"] is False
    assert pan_d["safety_gate_status"] == "NEEDS_VERIFICATION"

    # Verify Pan-D timing
    v_res = client.post(f"/api/medications/{pan_d['id']}/verify", json={
        "field_name": "frequency",
        "action": "confirmed",
        "new_value": "1-0-0 (B/F)"
    })
    assert v_res.status_code == 200
    assert v_res.json()["scheduling_allowed"] is True

# 5. Pharmacy Finder & Safety Verification Tests
def test_pharmacy_providers_endpoint():
    res = client.get("/api/pharmacy/providers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    slugs = [p["slug"] for p in data]
    assert "1mg" in slugs
    assert "apollo" in slugs
    assert "pharmeasy" in slugs
    assert "netmeds" in slugs

def test_pharmacy_options_verified_vs_unverified():
    # 1. Load controlled failure (unverified medication)
    load_res = client.post("/api/demo/load-fixture/controlled_failure")
    assert load_res.status_code == 200
    med_id = load_res.json()["data"]["medications"][0]["id"]

    # When unverified, safety notice must be present and prescription not marked verified
    pharm_res = client.get(f"/api/medications/{med_id}/pharmacy-options")
    assert pharm_res.status_code == 200
    pdata = pharm_res.json()
    assert pdata["is_prescription_verified"] is False
    assert pdata["safety_notice"] is not None
    assert "verification is pending" in pdata["safety_notice"]

    # 2. Verify the medication
    v_res = client.post(f"/api/medications/{med_id}/verify", json={
        "field_name": "frequency",
        "action": "confirmed",
        "new_value": "BD"
    })
    assert v_res.status_code == 200
    assert v_res.json()["safety_gate_status"] == "VERIFIED"

    # Now pharmacy options should reflect verified prescription
    pharm_res_v = client.get(f"/api/medications/{med_id}/pharmacy-options")
    assert pharm_res_v.status_code == 200
    pdata_v = pharm_res_v.json()
    assert pdata_v["is_prescription_verified"] is True
    assert pdata_v["safety_notice"] is None
    assert len(pdata_v["pharmacy_options"]) >= 4
    assert pdata_v["lowest_price_provider"] is not None

def test_pharmacy_search_endpoint():
    res = client.get("/api/pharmacy/search?query=Paracetamol")
    assert res.status_code == 200
    data = res.json()
    assert "pharmacy_options" in data
    assert len(data["pharmacy_options"]) >= 4
    # Check that product URLs are well-formed
    for opt in data["pharmacy_options"]:
        assert opt["product_url"].startswith("http")
        assert opt["provider_name"] in ["Tata 1mg", "Apollo Pharmacy", "PharmEasy", "Netmeds"]

