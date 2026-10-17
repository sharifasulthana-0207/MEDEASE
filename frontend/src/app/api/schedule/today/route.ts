
import { NextResponse } from 'next/server';
import { globalStore, buildDemoFixture } from '@/lib/serverStore';

export async function GET() {
  if (globalStore.reminders.length === 0) {
    buildDemoFixture('actual_prescription');
  }
  return NextResponse.json(globalStore.reminders);
}
