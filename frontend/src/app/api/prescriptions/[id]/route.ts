
import { NextRequest, NextResponse } from 'next/server';
import { globalStore, buildDemoFixture } from '@/lib/serverStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let rx = globalStore.prescriptions[id];
  if (!rx) {
    if (id.includes('actual')) rx = buildDemoFixture('actual_prescription');
    else if (id.includes('failure')) rx = buildDemoFixture('controlled_failure');
    else rx = buildDemoFixture('actual_prescription');
  }
  return NextResponse.json(rx);
}
