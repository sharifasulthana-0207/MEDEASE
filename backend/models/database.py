import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    create_engine, Column, String, Float, Boolean, Integer, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medease.db")

# SQLite needs connect_args check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email_or_session_id = Column(String(255), nullable=False, unique=True, index=True)
    preferred_language = Column(String(10), default="en") # en, hi, te
    notification_settings_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    image_storage_path = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    processing_status = Column(String(50), default="uploaded") # uploaded, processing, extracted, verified, failed
    image_quality_status = Column(String(50), default="good") # good, poor, unreadable
    image_quality_details_json = Column(JSON, default=dict)
    raw_ocr_text = Column(Text, nullable=True)
    processing_error = Column(Text, nullable=True)
    is_demo_fixture = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="prescriptions")
    medications = relationship("Medication", back_populates="prescription", cascade="all, delete-orphan")

class Medication(Base):
    __tablename__ = "medications"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False, index=True)
    medicine_name_raw = Column(String(255), nullable=False)
    medicine_name_normalized = Column(String(255), nullable=True)
    active_ingredient = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True) # Tablet, Capsule, Syrup, etc.
    frequency = Column(String(100), nullable=True) # OD, BD, TDS, etc.
    frequency_times_json = Column(JSON, default=list) # e.g. ["09:00", "21:00"]
    duration_days = Column(Integer, nullable=True) # e.g. 5
    route = Column(String(100), default="oral") # oral, topical, etc.
    critical_fields_complete = Column(Boolean, default=False)
    safety_gate_status = Column(String(50), default="NEEDS_VERIFICATION") # VERIFIED, NEEDS_VERIFICATION, MISSING, CONFLICTING
    safety_gate_reasons_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    prescription = relationship("Prescription", back_populates="medications")
    fields = relationship("MedicationField", back_populates="medication", cascade="all, delete-orphan")
    verification_events = relationship("VerificationEvent", back_populates="medication", cascade="all, delete-orphan")
    schedule = relationship("MedicationSchedule", back_populates="medication", uselist=False, cascade="all, delete-orphan")

class MedicationField(Base):
    __tablename__ = "medication_fields"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medication_id = Column(String(36), ForeignKey("medications.id"), nullable=False, index=True)
    field_name = Column(String(50), nullable=False) # medicine_name, strength, dosage_form, frequency, duration, route
    value_json = Column(JSON, nullable=True) # store extracted or verified value
    confidence = Column(Float, default=0.0) # technical extraction signal, 0.0 to 1.0
    status = Column(String(50), default="NEEDS_VERIFICATION") # VERIFIED, NEEDS_VERIFICATION, MISSING, CONFLICTING
    source = Column(String(50), default="vision+llm") # vision, ocr, llm, reference, user
    validation_message = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    medication = relationship("Medication", back_populates="fields")

class MedicineReference(Base):
    __tablename__ = "medicine_references"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canonical_name = Column(String(255), nullable=False, unique=True, index=True)
    generic_name = Column(String(255), nullable=False)
    active_ingredients_json = Column(JSON, default=list)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    route = Column(String(100), default="oral")
    release_type = Column(String(100), default="immediate")
    common_purpose_en = Column(Text, nullable=True)
    common_purpose_hi = Column(Text, nullable=True)
    common_purpose_te = Column(Text, nullable=True)
    source_label = Column(String(100), default="Reference Formulary (Verified)")
    is_demo_reference = Column(Boolean, default=True)

class VerificationEvent(Base):
    __tablename__ = "verification_events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medication_id = Column(String(36), ForeignKey("medications.id"), nullable=False, index=True)
    field_name = Column(String(50), nullable=False)
    old_value_json = Column(JSON, nullable=True)
    new_value_json = Column(JSON, nullable=True)
    action = Column(String(50), nullable=False) # confirmed, edited, rejected
    actor = Column(String(50), default="user") # user, system
    created_at = Column(DateTime, default=datetime.utcnow)

    medication = relationship("Medication", back_populates="verification_events")

class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medication_id = Column(String(36), ForeignKey("medications.id"), nullable=False, unique=True, index=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    scheduled_times_json = Column(JSON, default=list) # e.g. ["09:00", "21:00"]
    schedule_status = Column(String(50), default="active") # active, completed, blocked
    created_at = Column(DateTime, default=datetime.utcnow)

    medication = relationship("Medication", back_populates="schedule")
    reminders = relationship("Reminder", back_populates="schedule", cascade="all, delete-orphan")

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    schedule_id = Column(String(36), ForeignKey("medication_schedules.id"), nullable=False, index=True)
    scheduled_for = Column(DateTime, nullable=False, index=True)
    status = Column(String(50), default="upcoming") # upcoming, taken, skipped, snoozed
    acted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    schedule = relationship("MedicationSchedule", back_populates="reminders")
    adherence_events = relationship("AdherenceEvent", back_populates="reminder", cascade="all, delete-orphan")

class AdherenceEvent(Base):
    __tablename__ = "adherence_events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reminder_id = Column(String(36), ForeignKey("reminders.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False) # taken, skipped, snoozed
    occurred_at = Column(DateTime, default=datetime.utcnow)

    reminder = relationship("Reminder", back_populates="adherence_events")


class PharmacyProvider(Base):
    __tablename__ = "pharmacy_providers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True) # "Tata 1mg", "Apollo Pharmacy", "PharmEasy", "Netmeds"
    slug = Column(String(50), nullable=False, unique=True)
    base_url = Column(String(255), nullable=False)
    search_url_template = Column(String(500), nullable=False)
    logo_color = Column(String(50), default="#168C89")
    is_active = Column(Boolean, default=True)


class PharmacyProductListing(Base):
    __tablename__ = "pharmacy_product_listings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = Column(String(36), ForeignKey("pharmacy_providers.id"), nullable=False, index=True)
    canonical_medicine_name = Column(String(255), nullable=False, index=True)
    product_title = Column(String(255), nullable=False)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    pack_size = Column(String(100), nullable=True)
    units_per_pack = Column(Integer, default=10)
    mrp = Column(Float, nullable=True)
    discounted_price = Column(Float, nullable=True)
    in_stock = Column(Boolean, default=True)
    product_url = Column(String(500), nullable=False)
    price_verified_at = Column(DateTime, default=datetime.utcnow)
    is_verified_price = Column(Boolean, default=True)

    provider = relationship("PharmacyProvider")
