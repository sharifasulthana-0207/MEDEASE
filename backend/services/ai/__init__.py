from .ai_provider import AIProvider, VisionResult, TranslationResult, ExplanationResult
from .demo_provider import DemoAIProvider
from .gemini_provider import GeminiAIProvider

def get_ai_provider() -> AIProvider:
    return GeminiAIProvider()
