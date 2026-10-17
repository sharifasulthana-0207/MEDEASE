
import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/serverStore';

export async function GET() {
  const total = globalStore.reminders.length;
  const taken = globalStore.reminders.filter(r => r.status === 'taken').length;
  const skipped = globalStore.reminders.filter(r => r.status === 'skipped').length;
  const snoozed = globalStore.reminders.filter(r => r.status === 'snoozed').length;
  const upcoming = globalStore.reminders.filter(r => r.status === 'upcoming').length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

  return NextResponse.json({
    total_reminders: total,
    taken_count: taken,
    skipped_count: skipped,
    snoozed_count: snoozed,
    upcoming_count: upcoming,
    adherence_percentage: pct
  });
}
