import { NextResponse } from 'next/server';
import { PublicContactApi } from '@/api/publicApi';

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const data = await PublicContactApi.submit(payload);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Unable to send message right now.';
    return NextResponse.json({ message }, { status });
  }
}
