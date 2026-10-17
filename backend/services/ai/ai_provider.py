from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from schemas.pydantic_models import StructuredExtractionContract

class VisionResult(BaseModel):
    raw_ocr_text: str
    confidence_hint: float
    source: str = "vision"

class TranslationResult(BaseModel):
    original_text: str
    target_language: str
    translated_text: str

class ExplanationResult(BaseModel):
    medicine_name: str
    target_language: str
    purpose_explanation: str
    generic_vs_brand: str
    safety_disclaimer: str

class AIProvider(ABC):
    @abstractmethod
    def analyze_prescription_image(self, image_bytes: bytes, prompt: Optional[str] = None) -> VisionResult:
        pass

    @abstractmethod
    def extract_medication_fields(self, ocr_text: str, context: Optional[Dict[str, Any]] = None) -> StructuredExtractionContract:
        pass

    @abstractmethod
    def translate_verified_text(self, text: str, target_language: str) -> TranslationResult:
        pass

    @abstractmethod
    def explain_verified_medicine(self, reference_record: Dict[str, Any], target_language: str) -> ExplanationResult:
        pass
