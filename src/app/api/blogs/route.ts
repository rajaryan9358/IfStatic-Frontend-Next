import { NextResponse } from 'next/server';
import { fetchBlogsServer } from '@/services/publicData.service';

export async function GET() {
  const { data, isFallback } = await fetchBlogsServer();
  return NextResponse.json({ success: true, isFallback, data });
}
