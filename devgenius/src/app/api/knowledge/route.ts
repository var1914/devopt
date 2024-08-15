import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const knowledgeGraph = db.getKnowledgeGraph(userId);
  return NextResponse.json(knowledgeGraph);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { item } = await request.json();
  if (!item) {
    return NextResponse.json({ error: 'Knowledge item is required' }, { status: 400 });
  }

  db.addKnowledgeItem({ userId, item });
  return NextResponse.json({ message: 'Knowledge item added successfully' });
}