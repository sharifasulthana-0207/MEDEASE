from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "MEDEASE API",
        "version": "1.0.0",
        "differentiator": "MEDEASE does not blindly trust OCR. It exposes uncertainty and blocks medication scheduling until critical prescription details are verified."
    }
