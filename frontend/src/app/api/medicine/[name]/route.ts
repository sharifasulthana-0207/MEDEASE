
import { NextRequest, NextResponse } from 'next/server';
import { MEDICINE_REFERENCES } from '@/lib/serverStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const key = decodeURIComponent(name).trim().toLowerCase();
  
  const found = MEDICINE_REFERENCES[key] || Object.values(MEDICINE_REFERENCES).find(m => 
    m.canonical_name.toLowerCase().includes(key) || key.includes(m.canonical_name.toLowerCase())
  );

  if (found) {
    return NextResponse.json(found);
  }

  return NextResponse.json({
    id: `ref-${key}`,
    canonical_name: decodeURIComponent(name),
    generic_name: decodeURIComponent(name),
    active_ingredients: [decodeURIComponent(name)],
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Prescription medication. Take according to your physician instructions.',
    common_purpose_hi: 'पर्चे की दवा। अपने डॉक्टर के निर्देशानुसार लें।',
    common_purpose_te: 'వైద్యుల ప్రిస్క్రిప్షన్ ప్రకారం సూచించిన విధంగా మందులను తీసుకోండి.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Formulary listing',
    medical_disclaimer: 'Always consult your healthcare provider or pharmacist for guidance.'
  });
}
