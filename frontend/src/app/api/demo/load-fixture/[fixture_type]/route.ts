
import { NextRequest, NextResponse } from 'next/server';
import { buildDemoFixture } from '@/lib/serverStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fixture_type: string }> }
) {
  const { fixture_type } = await params;
  const valid = ['actual_prescription', 'controlled_failure', 'success'];
  const type = valid.includes(fixture_type) ? (fixture_type as any) : 'actual_prescription';
  
  const prescription = buildDemoFixture(type);
  return NextResponse.json({
    fixture_type: type,
    prescription_id: prescription.id,
    message: `Loaded demo fixture: ${type}`,
    data: {
      prescription_id: prescription.id,
      processing_status: prescription.processing_status,
      medications: prescription.medications,
      overall_notes: ['Patient: Mr. Aman (19 yr, M)', 'Sai Ram Clinic - Dr. Sachin Patil']
    }
  });
}
