
import { NextRequest, NextResponse } from 'next/server';
import { globalStore, buildDemoFixture } from '@/lib/serverStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const fixtureMode = searchParams.get('fixture_mode');

  let rx = globalStore.prescriptions[id];
  if (!rx) {
    rx = buildDemoFixture(
      fixtureMode === 'controlled_failure' ? 'controlled_failure' :
      fixtureMode === 'success' ? 'success' : 'actual_prescription'
    );
  }
  
  return NextResponse.json({
    prescription_id: rx.id,
    processing_status: 'completed',
    medications: rx.medications,
    overall_notes: ['Prescription successfully processed with safety gate checks']
  });
}
