import re
from typing import Dict, Any, List, Optional, Tuple

class MedicineNormalizer:
    FREQUENCY_MAP = {
        "OD": {"canonical": "OD", "description": "Once daily", "times": ["09:00"], "doses_per_day": 1},
        "QD": {"canonical": "OD", "description": "Once daily", "times": ["09:00"], "doses_per_day": 1},
        "ONCE DAILY": {"canonical": "OD", "description": "Once daily", "times": ["09:00"], "doses_per_day": 1},
        "1-0-0": {"canonical": "OD (Morning)", "description": "Once daily in the morning (Before/After food)", "times": ["08:30"], "doses_per_day": 1},
        "1 0 0": {"canonical": "OD (Morning)", "description": "Once daily in the morning", "times": ["08:30"], "doses_per_day": 1},
        "0-0-1": {"canonical": "HS (Night)", "description": "Once daily at night (Bedtime)", "times": ["21:30"], "doses_per_day": 1},
        "0 0 1": {"canonical": "HS (Night)", "description": "Once daily at night", "times": ["21:30"], "doses_per_day": 1},
        "BD": {"canonical": "BD", "description": "Twice daily", "times": ["09:00", "21:00"], "doses_per_day": 2},
        "BID": {"canonical": "BD", "description": "Twice daily", "times": ["09:00", "21:00"], "doses_per_day": 2},
        "TWICE DAILY": {"canonical": "BD", "description": "Twice daily", "times": ["09:00", "21:00"], "doses_per_day": 2},
        "1-0-1": {"canonical": "BD (Morning & Night)", "description": "Twice daily (Morning & Night)", "times": ["09:00", "21:00"], "doses_per_day": 2},
        "1 0 1": {"canonical": "BD (Morning & Night)", "description": "Twice daily (Morning & Night)", "times": ["09:00", "21:00"], "doses_per_day": 2},
        "TDS": {"canonical": "TDS", "description": "Three times daily", "times": ["08:00", "14:00", "20:00"], "doses_per_day": 3},
        "TID": {"canonical": "TDS", "description": "Three times daily", "times": ["08:00", "14:00", "20:00"], "doses_per_day": 3},
        "THREE TIMES DAILY": {"canonical": "TDS", "description": "Three times daily", "times": ["08:00", "14:00", "20:00"], "doses_per_day": 3},
        "1-1-1": {"canonical": "TDS (Morning, Afternoon & Night)", "description": "Three times daily", "times": ["08:00", "14:00", "20:00"], "doses_per_day": 3},
        "1 1 1": {"canonical": "TDS (Morning, Afternoon & Night)", "description": "Three times daily", "times": ["08:00", "14:00", "20:00"], "doses_per_day": 3},
        "QID": {"canonical": "QID", "description": "Four times daily", "times": ["08:00", "12:00", "16:00", "20:00"], "doses_per_day": 4},
        "HS": {"canonical": "HS", "description": "At bedtime", "times": ["21:30"], "doses_per_day": 1},
        "AT BEDTIME": {"canonical": "HS", "description": "At bedtime", "times": ["21:30"], "doses_per_day": 1},
        "SOS": {"canonical": "SOS", "description": "As needed", "times": [], "doses_per_day": 0},
        "PRN": {"canonical": "SOS", "description": "As needed", "times": [], "doses_per_day": 0},
    }

    FORM_MAP = {
        "TAB": "Tablet",
        "TABS": "Tablet",
        "TABLET": "Tablet",
        "TABLETS": "Tablet",
        "CAP": "Capsule",
        "CAPS": "Capsule",
        "CAPSULE": "Capsule",
        "CAPSULES": "Capsule",
        "SYR": "Syrup",
        "SYRUP": "Syrup",
        "INJ": "Injection",
        "INJECTION": "Injection",
        "OINT": "Ointment",
        "OINTMENT": "Ointment",
        "DROPS": "Drops"
    }

    ROUTE_MAP = {
        "PO": "oral",
        "ORAL": "oral",
        "IV": "intravenous",
        "IM": "intramuscular",
        "TOPICAL": "topical",
        "OPHTHALMIC": "eye drops",
        "NASAL": "nasal"
    }

    BRAND_TO_CANONICAL = {
        "PCM": "Paracetamol",
        "DOLO": "Paracetamol",
        "DOLO 650": "Paracetamol",
        "CALPOL": "Paracetamol",
        "TYLENOL": "Paracetamol",
        "CROCOIN": "Paracetamol",
        "PAN": "Pantoprazole",
        "PAN-40": "Pantoprazole",
        "PAN 40": "Pantoprazole",
        "PANTO": "Pantoprazole",
        "PANTOP": "Pantoprazole",
        "PAN-D": "Pan-D",
        "PAN D": "Pan-D",
        "SKIPON-D": "Pan-D",
        "SHIPEN-D": "Pan-D",
        "PANTOP-D": "Pan-D",
        "OPOX-CV": "Opox-CV",
        "OPOX CV": "Opox-CV",
        "OPOX-CV 200MG": "Opox-CV",
        "ALDIGESIC-SP": "Aldigesic-SP",
        "ALDIGESIC SP": "Aldigesic-SP",
        "ALTICOSE-SP": "Aldigesic-SP",
        "ACECLO-SP": "Aldigesic-SP",
        "BREEZY": "Breezy",
        "BREEZY-L": "Breezy",
        "AMOX": "Amoxicillin",
        "AMOXY": "Amoxicillin",
        "AUGMENTIN": "Amoxicillin",
        "MOX": "Amoxicillin",
        "GLUCOPHAGE": "Metformin",
        "MET": "Metformin",
        "LIPITOR": "Atorvastatin",
        "ATORVA": "Atorvastatin",
        "ZYRTEC": "Cetirizine",
        "CETZINE": "Cetirizine",
        "AZITHRAL": "Azithromycin",
        "AZITHRO": "Azithromycin",
        "ZITHROMAX": "Azithromycin",
        "ADVIL": "Ibuprofen",
        "BRUFEN": "Ibuprofen",
        "PRILOSEC": "Omeprazole",
        "NORVASC": "Amlodipine"
    }

    @classmethod
    def normalize_medicine_name(cls, raw_name: Optional[str]) -> Tuple[str, Optional[str]]:
        """Returns (normalized_name, recognized_canonical_or_none)"""
        if not raw_name:
            return "", None
        cleaned = raw_name.strip()
        # Remove prefixes like "T. ", "Tab. ", "Cap. ", "- "
        cleaned = re.sub(r'^[-\s]*(?:T\.|Tab\.|Cap\.|T\s+|Tab\s+|Cap\s+)\s*', '', cleaned, flags=re.IGNORECASE).strip()
        
        upper = cleaned.upper()
        # Check direct brand lookup
        for brand, canonical in cls.BRAND_TO_CANONICAL.items():
            if upper == brand or upper.startswith(f"{brand} "):
                return canonical, canonical

        return cleaned.title(), None

    @classmethod
    def normalize_frequency(cls, raw_freq: Optional[str]) -> Tuple[Optional[str], List[str], Optional[str]]:
        """Returns (canonical_freq, default_times, description)"""
        if not raw_freq:
            return None, [], None
        cleaned = raw_freq.strip().upper()
        # Normalize notations like 1-0-1 or 1 - 0 - 1
        dash_pattern = re.sub(r'\s*-\s*', '-', cleaned)
        if dash_pattern in cls.FREQUENCY_MAP:
            info = cls.FREQUENCY_MAP[dash_pattern]
            return info["canonical"], info["times"], info["description"]

        # Remove punctuation like periods (e.g. B.D. -> BD)
        cleaned_alpha = re.sub(r'[^A-Z0-9 -]', '', cleaned).strip()

        if cleaned_alpha in cls.FREQUENCY_MAP:
            info = cls.FREQUENCY_MAP[cleaned_alpha]
            return info["canonical"], info["times"], info["description"]

        return raw_freq.strip(), ["09:00"], None

    @classmethod
    def normalize_dosage_form(cls, raw_form: Optional[str]) -> Optional[str]:
        if not raw_form:
            return None
        cleaned = re.sub(r'[^A-Za-z]', '', raw_form).strip().upper()
        return cls.FORM_MAP.get(cleaned, raw_form.strip().title())

    @classmethod
    def normalize_route(cls, raw_route: Optional[str]) -> str:
        if not raw_route:
            return "oral"
        cleaned = re.sub(r'[^A-Za-z]', '', raw_route).strip().upper()
        return cls.ROUTE_MAP.get(cleaned, raw_route.strip().lower())

    @classmethod
    def parse_duration_days(cls, raw_duration: Any) -> Optional[int]:
        if raw_duration is None:
            return None
        if isinstance(raw_duration, int):
            return raw_duration
        match = re.search(r'(\d+)', str(raw_duration))
        if match:
            days = int(match.group(1))
            lower = str(raw_duration).lower()
            if "week" in lower:
                return days * 7
            if "month" in lower:
                return days * 30
            return days
        return None
