
import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/serverStore';

export async function POST() {
  const seen = new Set<string>();
  const unique = [];
  for (const r of globalStore.reminders) {
    const key = `${r.medicine_name}-${r.scheduled_for}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  globalStore.reminders = unique;
  return NextResponse.json({
    status: 'cleaned',
    total_remaining: globalStore.reminders.length
  });
}
