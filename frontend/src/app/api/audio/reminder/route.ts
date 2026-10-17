
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Returns 204 No Content so VoiceReminderPlayer gracefully transitions to native Web Audio & Speech Synthesis
  return new NextResponse(null, { status: 204 });
}
