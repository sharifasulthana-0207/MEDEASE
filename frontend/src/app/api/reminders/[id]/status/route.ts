
import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/serverStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const reminder = globalStore.reminders.find(r => r.id === id);
  if (reminder) {
    reminder.status = status;
    reminder.acted_at = new Date().toISOString();
  }

  return NextResponse.json({
    status: 'updated',
    reminder_id: id,
    new_status: status
  });
}
