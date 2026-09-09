import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, assignedStaffId, notes, performedBy } = body;

    const existingTicket = await db.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    } else if (assignedStaffId && existingTicket.status === 'PENDING') {
      updateData.status = 'ASSIGNED';
    }

    // Safely assign staff: if assignedStaffId is provided, verify it exists or map to matching dept staff
    if (assignedStaffId) {
      const validStaff = await db.staff.findUnique({ where: { id: assignedStaffId } });
      if (validStaff) {
        updateData.assignedStaffId = assignedStaffId;
      } else {
        // Find staff member by department
        const deptStaff = await db.staff.findFirst({
          where: { department: existingTicket.department },
        });
        if (deptStaff) {
          updateData.assignedStaffId = deptStaff.id;
        }
      }
    }

    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        ...updateData,
        logs: {
          create: {
            action: status ? `STATUS_CHANGED_TO_${status}` : 'UPDATED',
            notes: notes || `Ticket updated to ${status || 'new status'} by ${performedBy || 'Staff'}`,
            performedBy: performedBy || 'Staff User',
          },
        },
      },
      include: {
        assignedStaff: true,
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
