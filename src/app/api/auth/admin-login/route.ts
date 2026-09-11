import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';
import { verifyPassword } from '@/lib/passwords';

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Admin email and password are required.' }, { status: 400 });
    }

    const staff = await db.staff.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!staff || staff.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin account not found. Try manager.jane@grandhorizon.com' },
        { status: 404 }
      );
    }

    const isValidPassword = verifyPassword(password, staff.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your admin credentials.' },
        { status: 401 }
      );
    }

    const { password: _, ...adminWithoutPassword } = staff;

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
