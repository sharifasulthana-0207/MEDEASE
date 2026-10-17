
import { NextResponse } from 'next/server';
import { buildDemoFixture } from '@/lib/serverStore';

export async function POST() {
  buildDemoFixture('actual_prescription');
  return NextResponse.json({
    status: 'reset_success',
    message: 'Reset demo schedules successfully'
  });
}
