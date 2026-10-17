# MEDEASE 🛡️💊
> **Read · Verify · Understand · Remember · Stay Safe**  
> *A safety-aware prescription understanding and medication adherence assistant.*

---

## 1. Central Differentiator & Safety Philosophy

> **"MEDEASE does not blindly trust OCR or AI. It exposes uncertainty and blocks medication scheduling until critical prescription details are verified by a human."**

MEDEASE is explicitly **not** an AI doctor, diagnosis system, prescribing system, or automatic medicine-substitution system. It treats every AI/OCR output as untrusted until:
1. **Image quality checks pass** (rejects blurry, overexposed, or unreadable images).
2. **Deterministic medical normalization** resolves abbreviations (`BD`, `TDS`, `PCM`) and verifies against a local, approved reference formulary.
3. **The Backend Safety Gate** checks field-level extraction confidence. If any critical field (drug identity, frequency, duration, dose) has low confidence, conflict, or is missing, **medication scheduling is strictly blocked**.
4. **Human Verification UX** presents the original prescription image side-by-side with extracted fields, requiring the patient to review and confirm or edit uncertain values before any schedule is unlocked.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 PATIENT / USER                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / Browser
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    FRONTEND: Next.js + React + TypeScript                   │
│  - Split-Screen Human Verification UX (Original Image + Extracted Fields)   │
│  - Trilingual UI & Browser SpeechSynthesis Audio Reminders (EN, HI, TE)     │
│  - Adherence Dashboard, Timeline, & Dose Action Logging (Taken/Skip/Snooze) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON + Multipart)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         BACKEND API: FastAPI + Python                       │
│  - Deterministic Safety Gate Engine (Enforces verification before schedule) │
│  - Image Quality Assessment (Laplacian Blur & Luminance Analysis)           │
│  - Formulary Normalization & Reference Matcher                              │
│  - AI Provider Abstraction (Google Gemini Vision + Fallback Demo Provider)  │
│  - Schedule Generation & Adherence Metrics Calculation                      │
└──────────────────┬─────────────────────────────────────┬────────────────────┘
                   │                                     │
       ┌───────────▼───────────┐             ┌───────────▼───────────┐
       │   SQLAlchemy / SQLite │             │ Private File Storage  │
       │   (or Supabase PG)    │             │ (Signed Image URLs)   │
       └───────────────────────┘             └───────────────────────┘
```

---

## 3. Quick Start (Local Run)

### Prerequisites
- **Python 3.10+** (Python 3.14 tested)
- **Node.js 18+** (Node.js v24 LTS tested) & npm

### Backend Setup
```bash
cd backend

# 1. Activate virtual environment (or create one: python -m venv venv)
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Linux/macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize database with verified medicines & generate sample fixtures
python seed.py
python generate_fixtures.py

# 4. Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Swagger / OpenAPI Docs: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run Next.js in development mode
npm run dev
```
Frontend web application will be live at: `http://localhost:3000`

---

## 4. Demo Mode & Walkthrough

MEDEASE comes preloaded with **two zero-configuration demo fixtures** accessible directly from the Landing Page or Dashboard:

### Fixture 1: Verified Prescription Path
- **Prescription**: Paracetamol 650 mg Tablets
- **Extraction**: Clean, high technical confidence (> 92%) across all critical fields.
- **Safety Gate Status**: `VERIFIED`
- **Result**: Medication scheduling is instantly unlocked. User can view the schedule timeline and listen to the trilingual voice reminder.

### Fixture 2: Controlled Failure Path
- **Prescription**: Pantoprazole 40 mg Tablet
- **Extraction**: Frequency notation is scribbled / unclear (`~BD~ (?)`), assigned **58% extraction confidence** with status `NEEDS_VERIFICATION`.
- **Safety Gate Status**: `NEEDS_VERIFICATION` (Scheduling **BLOCKED**).
- **Blocking Reason**: *"Frequency could not be read confidently. Please verify this information from the original prescription before continuing."*
- **Resolution**:
  1. Patient views the original prescription image side-by-side with the field cards.
  2. Patient clicks **Edit** or **Confirm Field** on the Frequency card, selecting "BD - Twice daily (09:00, 21:00)".
  3. Patient saves the field. An immutable audit record (`verification_event`) is recorded.
  4. The Safety Gate immediately re-evaluates, turns green (`VERIFIED`), and **unlocks schedule generation**.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & service readiness |
| `GET` | `/api/languages` | Supported languages (`en`, `hi`, `te`) |
| `POST` | `/api/translate` | Translate medical notifications |
| `POST` | `/api/prescriptions/upload` | Multipart upload with image blur & darkness checks |
| `POST` | `/api/prescriptions/{id}/process` | Runs AI OCR extraction & formulary normalization |
| `GET` | `/api/prescriptions/{id}` | Prescription details, extracted medications & fields |
| `GET` | `/api/prescriptions/{id}/image-url` | Private prescription image streaming |
| `POST` | `/api/medications/{id}/verify` | Human confirms/edits field, records audit trail |
| `POST` | `/api/medications/{id}/schedule` | **Safety-Gated**: Generates schedule only if verified |
| `GET` | `/api/schedule/today` | Today's timeline of medication reminders |
| `POST` | `/api/reminders/{id}/status` | Mark reminder as `taken`, `skipped`, or `snoozed` |
| `GET` | `/api/adherence` | Real-time adherence statistics & percentage |
| `GET` | `/api/medicine/{canonical_name}` | Reference formulary information & generic explanation |
| `POST` | `/api/demo/load-fixture/{type}` | Loads `success` or `controlled_failure` demo |

---

## 6. Security, Privacy, and Healthcare Guardrails

1. **Zero API Key Leakage**: Keys (`AI_API_KEY`, etc.) are held exclusively in the backend runtime. The Next.js client bundle contains zero credentials.
2. **Private Storage**: Prescription images are stored in secure local storage or private cloud buckets; never accessible via unauthenticated public URLs.
3. **Audit Trail**: Every human verification action is immutably logged in `verification_events` with old value, new value, action, and timestamp.
4. **No Medical Diagnoses**: The system never infers a patient's underlying condition from prescribed medicines (e.g. seeing Metformin does not allow the AI to diagnose diabetes).
5. **No Automatic Substitutions**: The reference database provides informative generic-versus-brand explanations, but strictly warns that substitutions require doctor or pharmacist approval.

---

## 7. Automated Test Suite

Run backend automated tests:
```bash
cd backend
pytest -v tests/test_backend.py
```
**Test Coverage Includes**:
- Abbreviation and medicine name normalization
- Reference formulary database matching
- Deterministic Safety Gate decisions (blocking on 58% frequency, unlocking upon confirmation)
- Missing and conflicting field detection
- Verification updates and audit logging
- Schedule locking and adherence percentage calculations
- Multi-language translation fallback

---

## 8. Known Limitations & Production Roadmap

- **Browser Speech Synthesis**: Voices for Hindi and Telugu depend on OS voice pack availability (with seamless English fallback).
- **Formulary Scale**: Demo catalog includes 8 common essential medicines (Paracetamol, Pantoprazole, Amoxicillin, Metformin, Atorvastatin, Cetirizine, Azithromycin, Ibuprofen). In production, connect an FDA/CDSCO NDC database.
- **Offline Mode**: Currently relies on HTTP REST backend; a service worker PWA layer can be added for offline reminder delivery.
