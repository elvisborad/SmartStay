import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/passwords';

export async function GET() {
  try {
    const staffList = await db.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        dutyStatus: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, staff: staffList });
  } catch (error: any) {
    console.error('Error fetching staff list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, department, dutyStatus } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required to create a staff member.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await db.staff.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'A staff member with this email already exists.' }, { status: 400 });
    }

    const hotel = await db.hotel.findFirst();
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not initialized.' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const newStaff = await db.staff.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role || 'STAFF',
        department: department || 'HOUSEKEEPING',
        dutyStatus: dutyStatus || 'ON_DUTY',
        hotelId: hotel.id,
      },
    });

    const { password: _, ...staffWithoutPassword } = newStaff;
    return NextResponse.json({ success: true, staff: staffWithoutPassword });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { staffId, password, name, department, role, dutyStatus } = body;

    if (!staffId) {
      return NextResponse.json({ error: 'staffId is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (department) updateData.department = department;
    if (role) updateData.role = role;
    if (dutyStatus) updateData.dutyStatus = dutyStatus;

    if (password && String(password).trim().length > 0) {
      updateData.password = hashPassword(String(password).trim());
    }

    const updatedStaff = await db.staff.update({
      where: { id: staffId },
      data: updateData,
    });

    const { password: _, ...staffWithoutPassword } = updatedStaff;
    return NextResponse.json({ success: true, staff: staffWithoutPassword });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
