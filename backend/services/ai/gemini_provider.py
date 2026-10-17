import os
import json
import logging
from typing import Dict, Any, Optional
from services.ai.ai_provider import AIProvider, VisionResult, TranslationResult, ExplanationResult
from services.ai.demo_provider import DemoAIProvider
from schemas.pydantic_models import (
    StructuredExtractionContract, MedicationExtraction, FieldExtraction, FieldStatus
)

logger = logging.getLogger(__name__)

class GeminiAIProvider(AIProvider):
    def __init__(self):
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.demo_fallback = DemoAIProvider(mode="success")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}")

    def is_live_active(self) -> bool:
        return self.client is not None

    def analyze_prescription_image(self, image_bytes: bytes, prompt: Optional[str] = None) -> VisionResult:
        if not self.is_live_active():
            return self.demo_fallback.analyze_prescription_image(image_bytes, prompt)
        try:
            from google.genai import types
            system_prompt = prompt or (
                "You are an OCR and clinical vision assistant. "
                "Transcribe all prescription notations accurately. Do not invent missing data."
            )
            response = self.client.models.generate_content(
                model=os.getenv("AI_VISION_MODEL", "gemini-2.5-flash"),
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    system_prompt
                ]
            )
            return VisionResult(
                raw_ocr_text=response.text or "",
                confidence_hint=0.88,
                source="live_vision"
            )
        except Exception as e:
            logger.error(f"Gemini vision error: {e}, falling back to Demo Mode")
            return self.demo_fallback.analyze_prescription_image(image_bytes, prompt)

    def extract_medication_fields(self, ocr_text: str, context: Optional[Dict[str, Any]] = None) -> StructuredExtractionContract:
        if not self.is_live_active():
            return self.demo_fallback.extract_medication_fields(ocr_text, context)
        try:
            prompt = f"""
Extract structured medication details strictly as JSON following this format:
{{
  "medications": [
    {{
      "medicine_name": {{"value": string or null, "confidence": float between 0.0 and 1.0, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}},
      "strength": {{"value": string or null, "confidence": float, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}},
      "dosage_form": {{"value": string or null, "confidence": float, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}},
      "frequency": {{"value": string or null, "confidence": float, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}},
      "duration": {{"value": string or null, "confidence": float, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}},
      "route": {{"value": string or null, "confidence": float, "status": "VERIFIED"|"NEEDS_VERIFICATION"|"MISSING"}}
    }}
  ],
  "overall_notes": [],
  "image_quality": "good"
}}

IMPORTANT SAFETY RULES:
- Never guess or invent missing values. If information is missing or unclear, mark value as null and status as "MISSING" or "NEEDS_VERIFICATION" with lower confidence.
- Confidence must reflect technical extraction certainty only (not clinical safety).

Prescription text:
{ocr_text}
"""
            response = self.client.models.generate_content(
                model=os.getenv("AI_TEXT_MODEL", "gemini-2.5-flash"),
                contents=prompt
            )
            # Clean JSON markdown if wrapped
            text = response.text.strip()
            if text.startswith("`json"):
                text = text[7:]
            if text.endswith("`"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            return StructuredExtractionContract.model_validate(parsed)
        except Exception as e:
            logger.error(f"Gemini extraction error: {e}, falling back to Demo Mode")
            return self.demo_fallback.extract_medication_fields(ocr_text, context)

    def translate_verified_text(self, text: str, target_language: str) -> TranslationResult:
        if not self.is_live_active() or target_language == "en":
            return self.demo_fallback.translate_verified_text(text, target_language)
        try:
            prompt = f"Translate the following medical notification into {target_language}. Maintain medical accuracy and clarity. Do not change medicine dosages or names: \n\n{text}"
            response = self.client.models.generate_content(
                model=os.getenv("AI_TEXT_MODEL", "gemini-2.5-flash"),
                contents=prompt
            )
            return TranslationResult(
                original_text=text,
                target_language=target_language,
                translated_text=response.text.strip()
            )
        except Exception as e:
            logger.warning(f"Translation failed: {e}, using demo/fallback")
            return self.demo_fallback.translate_verified_text(text, target_language)

    def explain_verified_medicine(self, reference_record: Dict[str, Any], target_language: str) -> ExplanationResult:
        # Explanations must strictly be grounded in verified reference data
        return self.demo_fallback.explain_verified_medicine(reference_record, target_language)
