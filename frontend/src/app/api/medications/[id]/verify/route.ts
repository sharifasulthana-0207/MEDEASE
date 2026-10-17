
import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/serverStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { field_name, action, new_value } = body;

  let targetMed: any = null;
  for (const rx of Object.values(globalStore.prescriptions)) {
    const found = rx.medications.find(m => m.id === id);
    if (found) {
      targetMed = found;
      break;
    }
  }

  if (!targetMed) {
    return NextResponse.json(
      { error: { code: 'MEDICATION_NOT_FOUND', message: 'Medication not found' } },
      { status: 404 }
    );
  }

  const field = targetMed.fields.find((f: any) => f.field_name === field_name);
  if (field) {
    if (new_value !== undefined) field.value = new_value;
    field.confidence = 1.0;
    field.status = 'VERIFIED';
    field.source = 'user';
    field.validation_message = 'Human verified';
  }

  // Update parent medication attribute
  if (field_name === 'frequency' && new_value) {
    targetMed.frequency = new_value;
    targetMed.frequency_times = ['08:00', '20:00'];
  } else if (field_name === 'medicine_name' && new_value) {
    targetMed.medicine_name_raw = new_value;
    targetMed.medicine_name_normalized = new_value;
  }

  // Re-evaluate Safety Gate
  const unverified = targetMed.fields.filter(
    (f: any) => f.status !== 'VERIFIED' || f.confidence < 0.85
  );

  if (unverified.length === 0) {
    targetMed.critical_fields_complete = true;
    targetMed.safety_gate_status = 'VERIFIED';
    targetMed.safety_gate_reasons = ['All critical fields human verified'];
  } else {
    targetMed.critical_fields_complete = false;
    targetMed.safety_gate_status = 'NEEDS_VERIFICATION';
    targetMed.safety_gate_reasons = unverified.map((f: any) => `${f.field_name} requires verification`);
  }

  return NextResponse.json({
    status: 'verified',
    medication_id: id,
    field_name,
    action,
    new_value: field?.value,
    safety_gate_status: targetMed.safety_gate_status,
    critical_fields_complete: targetMed.critical_fields_complete
  });
}
