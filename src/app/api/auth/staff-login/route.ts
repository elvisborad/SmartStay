import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';
import { verifyPassword } from '@/lib/passwords';

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Both staff email and password are required.' }, { status: 400 });
    }

    const staff = await db.staff.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found. Please check your email address.' },
        { status: 404 }
      );
    }

    const isValidPassword = verifyPassword(password, staff.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password. Please check credentials or ask Administrator to reset your password.' },
        { status: 401 }
      );
    }

    // Exclude password from returned staff object
    const { password: _, ...staffWithoutPassword } = staff;

    return NextResponse.json({
      success: true,
      staff: staffWithoutPassword,
    });
  } catch (error: any) {
    console.error('Staff login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
