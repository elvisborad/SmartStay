import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const qLower = query.toLowerCase();
      const items = await db.knowledgeBaseItem.findMany({
        where: {
          OR: [
            { question: { contains: qLower } },
            { answer: { contains: qLower } },
            { keywords: { contains: qLower } },
            { category: { contains: qLower } },
          ],
        },
      });
      return NextResponse.json({ items });
    }

    const items = await db.knowledgeBaseItem.findMany({
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Fetch knowledge error:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge base items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, question, answer, keywords } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
    }

    const hotel = await db.hotel.findFirst();

    const newItem = await db.knowledgeBaseItem.create({
      data: {
        category: category || 'General FAQs',
        question,
        answer,
        keywords: keywords || '',
        hotelId: hotel?.id || '',
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Create knowledge item error:', error);
    return NextResponse.json({ error: 'Failed to add knowledge item' }, { status: 500 });
  }
}
