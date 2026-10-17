import os
import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models.database import engine, Base
from seed import seed_database
from api.health import router as health_router
from api.languages import router as languages_router
from api.prescriptions import router as prescriptions_router
from api.medications import router as medications_router
from api.schedule import router as schedule_router
from api.medicine import router as medicine_router
from api.demo import router as demo_router
from api.audio import router as audio_router
from api.pharmacy import router as pharmacy_router

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("medease")

# Initialize database
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="MEDEASE API",
    version="1.0.0",
    description="Safety-Aware Prescription Understanding & Medication Adherence Assistant"
)

# CORS Configuration
allowed_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global standardized error handler matching prompt specifications
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "REQUEST_ERROR",
                "message": str(exc.detail),
                "details": {}
            }
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing the prescription request.",
                "details": {"exception_type": exc.__class__.__name__}
            }
        }
    )

# Include API Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(languages_router, prefix="/api")
app.include_router(prescriptions_router, prefix="/api")
app.include_router(medications_router, prefix="/api")
app.include_router(schedule_router, prefix="/api")
app.include_router(medicine_router, prefix="/api")
app.include_router(demo_router, prefix="/api")
app.include_router(audio_router, prefix="/api")
app.include_router(pharmacy_router, prefix="/api")

@app.get("/")

def root():
    return {
        "app": "MEDEASE API",
        "tagline": "Read · Verify · Understand · Remember · Stay Safe",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
