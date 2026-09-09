export type DepartmentType = 'HOUSEKEEPING' | 'MAINTENANCE' | 'KITCHEN' | 'FRONT_DESK' | 'MANAGEMENT';
export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatusType = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface GuestAuthData {
  roomNumber: string;
  pin: string;
}

export interface StaffAuthData {
  email: string;
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  department: DepartmentType;
  category?: string;
  priority?: PriorityType;
  roomNumber: string;
  guestName: string;
  guestSessionId?: string;
}

export interface UpdateTicketDTO {
  status?: TicketStatusType;
  assignedStaffId?: string;
  notes?: string;
  performedBy?: string;
}

export interface CreateOrderDTO {
  roomNumber: string;
  guestName: string;
  guestSessionId?: string;
  items: {
    serviceItemId: string;
    quantity: number;
  }[];
}

export interface SocketTicketEvent {
  type: 'CREATED' | 'UPDATED' | 'ESCALATED';
  ticket: any;
}
