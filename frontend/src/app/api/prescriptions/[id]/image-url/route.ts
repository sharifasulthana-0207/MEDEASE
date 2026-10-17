import { NextRequest, NextResponse } from 'next/server';
import { globalStore, buildDemoFixture } from '@/lib/serverStore';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let rx = globalStore.prescriptions[id];
  if (!rx) {
    if (id.includes('failure')) rx = buildDemoFixture('controlled_failure');
    else if (id.includes('success')) rx = buildDemoFixture('success');
    else rx = buildDemoFixture('actual_prescription');
  }

  let filename = rx?.original_filename;
  if (!filename) {
    if (id.includes('failure')) filename = 'prescription_controlled_failure.jpg';
    else if (id.includes('success')) filename = 'prescription_success.jpg';
    else filename = 'actual_prescription.png';
  }

  // 1. Try public fixtures directory
  const publicFixturePath = path.join(process.cwd(), 'public', 'fixtures', filename);
  if (fs.existsSync(publicFixturePath)) {
    const fileBuffer = fs.readFileSync(publicFixturePath);
    const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  }

  // 2. Try root fixtures directory
  const rootFixturePath = path.join(process.cwd(), '..', 'fixtures', filename);
  if (fs.existsSync(rootFixturePath)) {
    const fileBuffer = fs.readFileSync(rootFixturePath);
    const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  }

  // Fallback redirect
  return NextResponse.redirect(new URL(`/fixtures/${filename}`, request.url));
}
