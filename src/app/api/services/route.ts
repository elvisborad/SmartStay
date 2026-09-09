import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.serviceCategory.findMany({
      include: {
        items: {
          where: { available: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Fetch services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, estimatedMinutes, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and categoryId are required' }, { status: 400 });
    }

    const newItem = await db.serviceItem.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price) || 0.0,
        estimatedMinutes: parseInt(estimatedMinutes) || 15,
        categoryId,
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Create service item error:', error);
    return NextResponse.json({ error: 'Failed to create service item' }, { status: 500 });
  }
}
