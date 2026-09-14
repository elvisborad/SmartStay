import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔄 Demo Database Reset initiated...');
    try {
      await db.ticketLog.deleteMany();
      await db.ticket.deleteMany();
      await db.orderItem.deleteMany();
      await db.order.deleteMany();
      await db.serviceItem.deleteMany();
      await db.serviceCategory.deleteMany();
      await db.knowledgeBaseItem.deleteMany();
      await db.staff.deleteMany();
      await db.guestSession.deleteMany();
      await db.room.deleteMany();
      await db.hotel.deleteMany();
    } catch (e) {
      console.warn('Reset cleanup notice:', e);
    }
    await ensureDbInitialized();
    return NextResponse.json({ success: true, message: 'Database reset and re-seeded successfully!' });
  } catch (error: any) {
    console.error('Demo reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}

