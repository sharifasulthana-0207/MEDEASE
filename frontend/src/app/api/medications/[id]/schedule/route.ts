
import { NextRequest, NextResponse } from 'next/server';
import { globalStore, generateRemindersForMedication } from '@/lib/serverStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  if (targetMed.safety_gate_status !== 'VERIFIED' && !targetMed.critical_fields_complete) {
    return NextResponse.json(
      {
        error: {
          code: 'SAFETY_GATE_BLOCKED',
          message: 'Safety Gate blocked schedule creation. All critical fields must be verified before scheduling.',
          details: { reasons: targetMed.safety_gate_reasons }
        }
      },
      { status: 422 }
    );
  }

  targetMed.has_schedule = true;
  const reminders = generateRemindersForMedication(targetMed);

  return NextResponse.json({
    status: 'scheduled',
    medication_id: id,
    reminders_created: reminders.length,
    reminders
  });
}
