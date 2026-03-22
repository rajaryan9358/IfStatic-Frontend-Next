import { NextResponse } from 'next/server';
import { fetchServicesMinimalServer } from '@/services/publicData.service';

export async function GET() {
  const data = await fetchServicesMinimalServer();
  return NextResponse.json({ success: true, data });
}
