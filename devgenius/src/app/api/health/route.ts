import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const healthRecord = db.getHealthRecord(userId);
  if (!healthRecord) {
    return NextResponse.json({ error: 'Health record not found' }, { status: 404 });
  }

  return NextResponse.json(healthRecord);
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const data = await request.json();
  const updatedHealthRecord = db.updateHealthRecord(userId, data);

  if (!updatedHealthRecord) {
    return NextResponse.json({ error: 'Health record not found' }, { status: 404 });
  }

  return NextResponse.json(updatedHealthRecord);
}