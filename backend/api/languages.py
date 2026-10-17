from fastapi import APIRouter
from typing import List, Dict, Any
from schemas.pydantic_models import TranslateRequest, TranslateResponse
from services.ai import get_ai_provider

router = APIRouter(tags=["Languages & Translation"])

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native_name": "English"},
    {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
    {"code": "te", "name": "Telugu", "native_name": "తెలుగు"}
]

@router.get("/languages")
def get_languages() -> List[Dict[str, str]]:
    return SUPPORTED_LANGUAGES

@router.post("/translate", response_model=TranslateResponse)
def translate_text(payload: TranslateRequest):
    provider = get_ai_provider()
    result = provider.translate_verified_text(payload.text, payload.target_language)
    return TranslateResponse(
        original_text=result.original_text,
        target_language=result.target_language,
        translated_text=result.translated_text
    )
