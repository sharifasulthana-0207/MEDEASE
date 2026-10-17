import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

fixtures_dir = os.path.abspath(r"..\fixtures")
os.makedirs(fixtures_dir, exist_ok=True)

def create_prescription_image(filename, doctor_name, patient_info, rx_lines, blurry=False):
    img = Image.new('RGB', (800, 1000), color='#FAFAF8')
    draw = ImageDraw.Draw(img)

    # Header border
    draw.rectangle([20, 20, 780, 980], outline='#CBD5E1', width=2)

    # Clinic Header
    draw.text((50, 45), "CITY CARE MULTISPECIALITY CLINIC", fill='#1E293B')
    draw.text((50, 70), f"Chief Physician: {doctor_name} | Reg. No: MED-99421", fill='#64748B')
    draw.text((50, 95), "Phone: +91 40 2345 6789 | Hyderabad, India", fill='#94A3B8')
    draw.line([(40, 125), (760, 125)], fill='#0284C7', width=2)

    # Patient info
    draw.text((50, 145), f"Patient: {patient_info}", fill='#334155')
    draw.text((550, 145), "Date: 11-Sep-2026", fill='#334155')
    draw.line([(40, 180), (760, 180)], fill='#E2E8F0', width=1)

    # Rx Symbol
    draw.text((50, 205), "Rx", fill='#0284C7')

    # Prescriptions
    y = 260
    for line in rx_lines:
        draw.text((70, y), line, fill='#0F172A')
        y += 50

    # Doctor signature footer
    draw.line([(520, 850), (740, 850)], fill='#94A3B8', width=1)
    draw.text((550, 860), f"{doctor_name}", fill='#0F172A')
    draw.text((550, 885), "Authorized Prescriber", fill='#64748B')

    # Safety watermark
    draw.text((50, 940), "MEDEASE Prescription Sample - For Demonstration Purposes", fill='#94A3B8')

    if blurry:
        img = img.filter(ImageFilter.GaussianBlur(radius=8))

    target_path = os.path.join(fixtures_dir, filename)
    img.save(target_path, 'JPEG', quality=90)
    print(f"Generated fixture: {target_path}")

create_prescription_image(
    "prescription_success.jpg",
    "Dr. Ananya Sharma, MD",
    "Ramesh Gupta (45M) | OP ID: 2026-881",
    [
        "1. Paracetamol 650 mg Tablet",
        "   Sig: 1 Tablet BD (Twice daily) - 5 days",
        "   Route: Oral | After meals"
    ]
)

create_prescription_image(
    "prescription_controlled_failure.jpg",
    "Dr. Rajiv Verma, MBBS",
    "Pooja Rao (38F) | OP ID: 2026-442",
    [
        "1. Pantoprazole 40 mg Tablet",
        "   Sig: 1 Tab ~BD~ (unclear notation) - 14 days",
        "   Route: Oral | Before breakfast"
    ]
)

create_prescription_image(
    "blurry_sample.jpg",
    "Dr. S. Kumar, MD",
    "Test Patient",
    ["1. Paracetamol 500 mg - OD x 3 days"],
    blurry=True
)
