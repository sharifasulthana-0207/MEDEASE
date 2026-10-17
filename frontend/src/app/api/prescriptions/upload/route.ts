
import { NextRequest, NextResponse } from 'next/server';
import { buildDemoFixture } from '@/lib/serverStore';

export async function POST(request: NextRequest) {
  const rx = buildDemoFixture('actual_prescription');
  return NextResponse.json({
    prescription_id: rx.id,
    filename: rx.original_filename,
    processing_status: rx.processing_status,
    image_quality_status: 'good',
    image_quality_details: rx.image_quality_details,
    warning: []
  });
}
