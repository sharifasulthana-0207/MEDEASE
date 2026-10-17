from typing import Dict, Any, Optional
from schemas.pydantic_models import (
    StructuredExtractionContract, MedicationExtraction, FieldExtraction, FieldStatus
)
from services.ai.ai_provider import AIProvider, VisionResult, TranslationResult, ExplanationResult

class DemoAIProvider(AIProvider):
    def __init__(self, mode: str = "success"):
        self.mode = mode # 'success', 'controlled_failure', or 'actual_prescription'

    def analyze_prescription_image(self, image_bytes: bytes, prompt: Optional[str] = None) -> VisionResult:
        if self.mode == "actual_prescription":
            return VisionResult(
                raw_ocr_text="""SAI RAM CLINIC
Dr. Sachin Patil, Consultant Family Physician
Patient: Mr. Aman (19 yr, M) | Date: 22/05/25
BP: 120/70, HR: 116/min, Temp: 102.2 F
c/o Cold, T-irritation, Fever
Rx:
- T. Opox-CV 200mg 1-0-1 (6)
- T. Aldigesic-SP 1-0-1 (8)
- T. Breezy 0-0-1 (5)
- T. Skipon-D 40mg 1-0-0 (B/F) (10)""",
                confidence_hint=0.88,
                source="demo_provider"
            )
        elif self.mode == "controlled_failure":
            return VisionResult(
                raw_ocr_text="Rx: Pantoprazole 40mg Tab\nFreq: ~BD~ (?)\nDuration: 14 days\nRoute: oral",
                confidence_hint=0.65,
                source="demo_provider"
            )
        return VisionResult(
            raw_ocr_text="Rx: Paracetamol 650mg\nForm: Tab\nFreq: BD\nDuration: 5 days\nRoute: Oral",
            confidence_hint=0.96,
            source="demo_provider"
        )

    def extract_medication_fields(self, ocr_text: str, context: Optional[Dict[str, Any]] = None) -> StructuredExtractionContract:
        fixture_type = (context or {}).get("fixture_type", self.mode)

        if fixture_type == "actual_prescription":
            # Real prescription: 4 medications from Sai Ram Clinic
            med1 = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Opox-CV",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched formulary: Opox-CV (Cefpodoxime Proxetil + Clavulanate)"
                ),
                strength=FieldExtraction(
                    value="200 mg",
                    confidence=0.97,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Tablet",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="1-0-1",
                    confidence=0.92,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Twice daily (Morning & Night after meals)"
                ),
                duration=FieldExtraction(
                    value="3 days",
                    confidence=0.90,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Circled quantity: 6 tablets (3 days course)"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )

            med2 = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Aldigesic-SP",
                    confidence=0.89,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched formulary: Aceclofenac + Paracetamol + Serratiopeptidase"
                ),
                strength=FieldExtraction(
                    value="Standard Combination",
                    confidence=0.91,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Tablet",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="1-0-1",
                    confidence=0.88,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Twice daily after meals for fever and throat inflammation"
                ),
                duration=FieldExtraction(
                    value="4 days",
                    confidence=0.89,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Circled quantity: 8 tablets (4 days)"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )

            med3 = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Breezy",
                    confidence=0.91,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched formulary: Levocetirizine + Montelukast"
                ),
                strength=FieldExtraction(
                    value="5mg/10mg",
                    confidence=0.90,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Tablet",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="0-0-1",
                    confidence=0.93,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Once daily at night (Bedtime) for cold & cough"
                ),
                duration=FieldExtraction(
                    value="5 days",
                    confidence=0.91,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Circled quantity: 5 tablets"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )

            # Fourth medicine: Pan-D / Skipon-D with Safety Gate uncertainty on handwriting timing
            med4 = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Pan-D",
                    confidence=0.76,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched reference: Pantoprazole + Domperidone (Handwritten as 'Skipon-D / Pan-D')"
                ),
                strength=FieldExtraction(
                    value="40 mg",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Capsule",
                    confidence=0.90,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="1-0-0",
                    confidence=0.58, # Technical extraction signal: 58%
                    status=FieldStatus.NEEDS_VERIFICATION,
                    source="demo_provider",
                    validation_message="Timing notation handwritten as '1-0-0 (B/F)'. Please confirm morning dose before food."
                ),
                duration=FieldExtraction(
                    value="10 days",
                    confidence=0.92,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Circled quantity: 10 capsules"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )

            return StructuredExtractionContract(
                medications=[med1, med2, med3, med4],
                overall_notes=[
                    "Prescription from Sai Ram Clinic for Mr. Aman (19 yr, M).",
                    "Complaints: Cold, Throat irritation, High fever (102.2 F).",
                    "4 medications extracted; Pan-D morning before-food timing requires user confirmation."
                ],
                image_quality="good"
            )

        elif fixture_type == "controlled_failure":
            med = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Pantoprazole",
                    confidence=0.92,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched reference: Pantoprazole"
                ),
                strength=FieldExtraction(
                    value="40 mg",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Tablet",
                    confidence=0.91,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="BD",
                    confidence=0.58,
                    status=FieldStatus.NEEDS_VERIFICATION,
                    source="demo_provider",
                    validation_message="Frequency could not be read confidently. Please verify this information from the original prescription before continuing."
                ),
                duration=FieldExtraction(
                    value="14 days",
                    confidence=0.90,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.92,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )
            return StructuredExtractionContract(
                medications=[med],
                overall_notes=["Frequency could not be read confidently from handwritten notation."],
                image_quality="good"
            )
        else:
            med = MedicationExtraction(
                medicine_name=FieldExtraction(
                    value="Paracetamol",
                    confidence=0.96,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider",
                    validation_message="Matched canonical reference"
                ),
                strength=FieldExtraction(
                    value="650 mg",
                    confidence=0.98,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                dosage_form=FieldExtraction(
                    value="Tablet",
                    confidence=0.94,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                frequency=FieldExtraction(
                    value="BD",
                    confidence=0.93,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                duration=FieldExtraction(
                    value="5 days",
                    confidence=0.91,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                ),
                route=FieldExtraction(
                    value="oral",
                    confidence=0.95,
                    status=FieldStatus.VERIFIED,
                    source="demo_provider"
                )
            )
            return StructuredExtractionContract(
                medications=[med],
                overall_notes=["Clean prescription image with unambiguous notation."],
                image_quality="good"
            )

    def translate_verified_text(self, text: str, target_language: str) -> TranslationResult:
        dictionary = {
            "hi": {
                "It is time to take Paracetamol 650 mg according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार पैरासिटामोल 650 मिलीग्राम लेने का समय हो गया है।",
                "It is time to take Pantoprazole 40 mg according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार पैंटोप्राजोल 40 मिलीग्राम लेने का समय हो गया है।",
                "It is time to take Opox-CV 200 mg according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार ओपोक्स-सीवी 200 मिलीग्राम लेने का समय हो गया है।",
                "It is time to take Aldigesic-SP according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार एल्डिजेसिक-एसपी लेने का समय हो गया है।",
                "It is time to take Breezy 5mg/10mg according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार ब्रीज़ी लेने का समय हो गया है।",
                "It is time to take Pan-D 40 mg according to your verified medication schedule.": "आपके सत्यापित दवा शेड्यूल के अनुसार पैन-डी 40 मिलीग्राम (नाश्ते से पहले) लेने का समय हो गया है।",
                "Human verified. Medication schedule unlocked.": "मानव द्वारा सत्यापित। दवा का शेड्यूल अनलॉक हो गया।",
                "Frequency could not be read confidently. Please verify this information from the original prescription before continuing.": "खुराक की आवृत्ति को स्पष्ट रूप से नहीं पढ़ा जा सका। कृपया जारी रखने से पहले मूल नुस्खे से इस जानकारी को सत्यापित करें।"
            },
            "te": {
                "It is time to take Paracetamol 650 mg according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం పారాసిటమాల్ 650 mg తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "It is time to take Pantoprazole 40 mg according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం పాంటోప్రజోల్ 40 mg తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "It is time to take Opox-CV 200 mg according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం ఒపోక్స్-సివి 200 mg తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "It is time to take Aldigesic-SP according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం ఆల్డిజెసిక్-ఎస్పి తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "It is time to take Breezy 5mg/10mg according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం బ్రీజీ తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "It is time to take Pan-D 40 mg according to your verified medication schedule.": "మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం పాన్-డి 40 mg (అల్పాహారానికి ముందు) తీసుకోవడానికి సమయం ఆసన్నమైంది.",
                "Human verified. Medication schedule unlocked.": "మనిషి ధృవీకరించారు. మందుల షెడ్యూల్ అన్‌లాక్ చేయబడింది.",
                "Frequency could not be read confidently. Please verify this information from the original prescription before continuing.": "మోతాదు ఫ్రీక్వెన్సీ స్పష్టంగా చదవబడలేదు. దయచేసి కొనసాగడానికి ముందు అసలు ప్రిస్క్రిప్షన్ నుండి ఈ సమాచారాన్ని ధృవీకరించండి."
            }
        }
        lang_dict = dictionary.get(target_language, {})
        translated = lang_dict.get(text, text)
        return TranslationResult(
            original_text=text,
            target_language=target_language,
            translated_text=translated
        )

    def explain_verified_medicine(self, reference_record: Dict[str, Any], target_language: str) -> ExplanationResult:
        canonical_name = reference_record.get("canonical_name", "Medicine")
        purpose_key = f"common_purpose_{target_language}"
        purpose = reference_record.get(purpose_key) or reference_record.get("common_purpose_en", "Standard pharmaceutical treatment.")
        generic_name = reference_record.get("generic_name", canonical_name)

        if target_language == "hi":
            generic_brand = f"{canonical_name} एक सक्रिय घटक {generic_name} वाली दवा है।"
            disclaimer = "यह सामान्य दवा की जानकारी है, निदान नहीं। MEDEASE कोई बीमारी तय नहीं करता है।"
        elif target_language == "te":
            generic_brand = f"{canonical_name} అనేది {generic_name} క్రియాశీల పదార్థాన్ని కలిగి ఉన్న ఔషధం."
            disclaimer = "ఇది సాధారణ ఔషధ సమాచారం మాత్రమే, రోగ నిర్ధారణ కాదు. MEDEASE వ్యాధిని నిర్ధారించదు."
        else:
            generic_brand = f"{canonical_name} contains the active generic component {generic_name}."
            disclaimer = "This is general medicine information, not a diagnosis. MEDEASE does not diagnose or prescribe."

        return ExplanationResult(
            medicine_name=canonical_name,
            target_language=target_language,
            purpose_explanation=purpose,
            generic_vs_brand=generic_brand,
            safety_disclaimer=disclaimer
        )
