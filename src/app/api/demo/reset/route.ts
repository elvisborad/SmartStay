import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST() {
  try {
    console.log('🔄 Demo Database Reset initiated...');
    await execPromise('npx tsx prisma/seed.ts');
    return NextResponse.json({ success: true, message: 'Database reset and re-seeded successfully!' });
  } catch (error: any) {
    console.error('Demo reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
