import io
import hashlib
from fastapi import APIRouter, Query, HTTPException, status
from fastapi.responses import Response
from gtts import gTTS

router = APIRouter(prefix="/audio", tags=["Audio & Voice"])

# In-memory cache for generated audio chunks
_audio_cache = {}

@router.get("/reminder")
def get_reminder_audio(
    text: str = Query(..., description="Text to speak in selected language"),
    lang: str = Query("en", description="Language code: en, hi, te")
):
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_TEXT", "message": "Text parameter is required"}
        )

    # Normalize language: te -> Telugu, hi -> Hindi, en -> English
    target_lang = "te" if lang == "te" else ("hi" if lang == "hi" else "en")
    cache_key = hashlib.md5(f"{target_lang}:{text.strip()}".encode("utf-8")).hexdigest()

    if cache_key in _audio_cache:
        return Response(content=_audio_cache[cache_key], media_type="audio/mpeg")

    try:
        tts = gTTS(text=text.strip(), lang=target_lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        audio_bytes = fp.getvalue()
        _audio_cache[cache_key] = audio_bytes
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "TTS_FAILED", "message": f"Could not generate voice audio: {str(e)}"}
        )
