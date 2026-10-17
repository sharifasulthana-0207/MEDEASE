import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from models.database import engine, Base, MedicineReference, SessionLocal

SEED_MEDICINES = [
    {
        "canonical_name": "Paracetamol",
        "generic_name": "Paracetamol",
        "active_ingredients_json": ["Paracetamol"],
        "strength": "650 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Used to reduce fever and relieve mild to moderate pain (such as headache, toothache, or body aches).",
        "common_purpose_hi": "बुखार कम करने और हल्के से मध्यम दर्द (जैसे सिरदर्द, दांत दर्द या शरीर दर्द) से राहत पाने के लिए उपयोग किया जाता है।",
        "common_purpose_te": "జ్వరాన్ని తగ్గించడానికి మరియు తేలికపాటి నుండి మితమైన నొప్పిని (తలనొప్పి, పంటి నొప్పి లేదా శరీర నొప్పులు వంటివి) తగ్గించడానికి ఉపయోగిస్తారు.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Pantoprazole",
        "generic_name": "Pantoprazole",
        "active_ingredients_json": ["Pantoprazole sodium"],
        "strength": "40 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "delayed-release",
        "common_purpose_en": "Reduces stomach acid production. Commonly used for acidity, heartburn, and gastroesophageal reflux disease (GERD).",
        "common_purpose_hi": "पेट के एसिड के उत्पादन को कम करता है। एसिडिटी, सीने में जलन और गैस की समस्या के लिए उपयोग किया जाता है।",
        "common_purpose_te": "కడుపులో యాసిడ్ ఉత్పత్తిని తగ్గిస్తుంది. ఎసిడిటీ, గుండెల్లో మంట మరియు గ్యాస్ సమస్యల నివారణకు ఉపయోగిస్తారు.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Pan-D",
        "generic_name": "Pantoprazole + Domperidone",
        "active_ingredients_json": ["Pantoprazole sodium (40mg)", "Domperidone (30mg)"],
        "strength": "40 mg",
        "dosage_form": "Capsule",
        "route": "oral",
        "release_type": "sustained-release",
        "common_purpose_en": "Reduces gastric acid and prevents nausea, bloating, and acid reflux. Usually taken in the morning before breakfast.",
        "common_purpose_hi": "पेट में गैस और एसिड को कम करता है तथा मतली और सीने में जलन से राहत देता है। आमतौर पर सुबह नाश्ते से पहले लिया जाता है।",
        "common_purpose_te": "కడుపులో గ్యాస్ మరియు యాసిడ్‌ను తగ్గిస్తుంది, వికారం మరియు గుండెల్లో మంటను నివారిస్తుంది. సాధారణంగా ఉదయం అల్పాహారానికి ముందు తీసుకుంటారు.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Opox-CV",
        "generic_name": "Cefpodoxime Proxetil + Potassium Clavulanate",
        "active_ingredients_json": ["Cefpodoxime Proxetil (200mg)", "Potassium Clavulanate (125mg)"],
        "strength": "200 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Broad-spectrum antibacterial medication used for respiratory tract infections, acute tonsillitis, pharyngitis, and ear/throat infections.",
        "common_purpose_hi": "श्वसन तंत्र के संक्रमण, टॉन्सिल, गले के गंभीर संक्रमण और ब्रोंकाइटिस के इलाज के लिए उपयोग की जाने वाली शक्तिशाली एंटीबायोटिक दवा।",
        "common_purpose_te": "శ్వాసకోశ ఇన్ఫెక్షన్లు, తీవ్రమైన గొంతు ఇన్ఫెక్షన్లు, టాన్సిల్స్ మరియు బ్రోన్కైటిస్ చికిత్సకు ఉపయోగించే శక్తివంతమైన యాంటీబయాటిక్ ఔషధం.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Aldigesic-SP",
        "generic_name": "Aceclofenac + Paracetamol + Serratiopeptidase",
        "active_ingredients_json": ["Aceclofenac (100mg)", "Paracetamol (325mg)", "Serratiopeptidase (15mg)"],
        "strength": "Standard Combination",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Anti-inflammatory and analgesic combination that relieves pain, reduces high fever, and decreases tissue swelling in throat and body.",
        "common_purpose_hi": "दर्द निवारक और सूजन-रोधी दवा जो बुखार को कम करती है और गले व शरीर में दर्द और सूजन से राहत दिलाती है।",
        "common_purpose_te": "నొప్పి, జ్వరం మరియు శరీరంలో లేదా గొంతులో వాపును తగ్గించడానికి ఉపయోగించే శక్తివంతమైన అనాల్జేసిక్ మరియు యాంటీ ఇన్‌ఫ్లమేటరీ ఔషధం.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Breezy",
        "generic_name": "Levocetirizine + Montelukast",
        "active_ingredients_json": ["Levocetirizine (5mg)", "Montelukast (10mg)"],
        "strength": "5mg/10mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Dual-action antiallergic medication for treating cold, runny nose, sneezing, allergic rhinitis, and night-time coughing or airway irritation.",
        "common_purpose_hi": "सर्दी, बहती नाक, छींक, एलर्जी और रात में होने वाली गले की जलन या खांसी से राहत दिलाने वाली एंटी-एलर्जिक दवा।",
        "common_purpose_te": "జలుబు, ముక్కు కారటం, తుమ్ములు, అలెర్జీలు మరియు రాత్రిపూట గొంతు మంట లేదా దగ్గు నుండి ఉపశమనం కలిగించే యాంటీ అలెర్జీ ఔషధం.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "active_ingredients_json": ["Amoxicillin trihydrate"],
        "strength": "500 mg",
        "dosage_form": "Capsule",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Broad-spectrum antibiotic used to treat bacterial infections in the chest, throat, ear, and urinary tract.",
        "common_purpose_hi": "एक एंटीबायोटिक जिसका उपयोग फेफड़ों, गले, कान और मूत्र मार्ग के जीवाणु संक्रमण के इलाज के लिए किया जाता है।",
        "common_purpose_te": "ఛాతీ, గొంతు, చెవి మరియు మూత్ర మార్గాలలో బ్యాక్టీరియా ఇన్ఫెక్షన్ల చికిత్సకు ఉపయోగించే యాంటీబయాటిక్.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Metformin",
        "generic_name": "Metformin",
        "active_ingredients_json": ["Metformin hydrochloride"],
        "strength": "500 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Helps control high blood sugar levels in type 2 diabetes by improving the body's response to insulin.",
        "common_purpose_hi": "इंसुलिन के प्रति शरीर की प्रतिक्रिया में सुधार करके टाइप 2 मधुमेह में रक्त शर्करा के स्तर को नियंत्रित करने में मदद करता है।",
        "common_purpose_te": "ఇన్సులిన్‌కు శరీరం యొక్క ప్రతిస్పందనను మెరుగుపరచడం ద్వారా టైప్ 2 డయాబెటిస్‌లో అధిక రక్తంలో చక్కెర స్థాయిలను నియంత్రించడంలో సహాయపడుతుంది.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Atorvastatin",
        "generic_name": "Atorvastatin",
        "active_ingredients_json": ["Atorvastatin calcium"],
        "strength": "10 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Lowers 'bad' cholesterol (LDL) and triglycerides in the blood, reducing the risk of heart complications.",
        "common_purpose_hi": "रक्त में 'खराब' कोलेस्ट्रॉल (एलडीएल) को कम करता है और हृदय रोगों के जोखिम को घटाता है।",
        "common_purpose_te": "రక్తంలో చెడు కొలెస్ట్రాల్‌ను తగ్గిస్తుంది మరియు గుండె సమస్యల ప్రమాదాన్ని తగ్గిస్తుంది.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Cetirizine",
        "generic_name": "Cetirizine",
        "active_ingredients_json": ["Cetirizine dihydrochloride"],
        "strength": "10 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Antihistamine used to relieve allergy symptoms such as runny nose, sneezing, itchy eyes, and skin hives.",
        "common_purpose_hi": "एलर्जी के लक्षणों जैसे बहती नाक, छींकने, आंखों में खुजली और त्वचा पर चकत्ते से राहत देने के लिए प्रयोग किया जाता है।",
        "common_purpose_te": "అలెర్జీ లక్షణాలైన ముక్కు కారటం, తుమ్ములు, కళ్ల దురద మరియు చర్మపు దద్దుర్ల నివారణకు ఉపయోగిస్తారు.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Azithromycin",
        "generic_name": "Azithromycin",
        "active_ingredients_json": ["Azithromycin dihydrate"],
        "strength": "500 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Antibiotic used to treat certain bacterial respiratory infections, ear infections, and skin infections.",
        "common_purpose_hi": "श्वसन संक्रमण, कान के संक्रमण और त्वचा संक्रमण के इलाज के लिए उपयोग किया जाने वाला एंटीबायोटिक।",
        "common_purpose_te": "శ్వాసకోశ ఇన్ఫెక్షన్లు, చెవి ఇన్ఫెక్షన్లు మరియు చర్మ ఇన్ఫెక్షన్ల చికిత్సకు ఉపయోగించే యాంటీబయాటిక్.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    },
    {
        "canonical_name": "Ibuprofen",
        "generic_name": "Ibuprofen",
        "active_ingredients_json": ["Ibuprofen"],
        "strength": "400 mg",
        "dosage_form": "Tablet",
        "route": "oral",
        "release_type": "immediate",
        "common_purpose_en": "Nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, inflammation, and fever.",
        "common_purpose_hi": "दर्द, सूजन और बुखार को कम करने के लिए उपयोग की जाने वाली एक गैर-स्टेरायडल एंटी-इंफ्लेमेटरी दवा।",
        "common_purpose_te": "నొప్పి, వాపు మరియు జ్వరాన్ని తగ్గించడానికి ఉపయోగించే నాన్‌స్టెరాయిడ్ యాంటీ ఇన్‌ఫ్లమేటరీ ఔషధం.",
        "source_label": "Standard Reference Formulary",
        "is_demo_reference": True
    }
]

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        count = 0
        for med_data in SEED_MEDICINES:
            existing = db.query(MedicineReference).filter(
                MedicineReference.canonical_name == med_data["canonical_name"]
            ).first()
            if not existing:
                ref = MedicineReference(**med_data)
                db.add(ref)
                count += 1
        db.commit()
        print(f"Database seeded successfully with {count} new verified medicine references.")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
