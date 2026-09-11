import { PrismaClient } from '@prisma/client';
import { hashPassword } from './passwords';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  seeded: boolean | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export async function ensureDbInitialized() {
  if (globalForPrisma.seeded) return;
  try {
    const staffCount = await db.staff.count();
    if (staffCount > 0) {
      globalForPrisma.seeded = true;
      return;
    }
  } catch (err) {
    console.warn('DB check warning (might be initial table setup):', err);
  }

  try {
    console.log('🌱 Auto-seeding DB for SmartStay...');
    let hotel = await db.hotel.findFirst();
    if (!hotel) {
      hotel = await db.hotel.create({
        data: {
          name: 'Grand Horizon Hotel',
          address: '777 Ocean Parkway, Paradise Bay',
          wifiName: 'Hotel_Guest_WiFi',
          wifiPassword: 'Horizon2026!',
          breakfastHours: '06:30 AM - 10:30 AM',
          poolHours: '07:00 AM - 09:00 PM',
          spaHours: '09:00 AM - 08:00 PM',
          checkoutTime: '11:00 AM',
          contactPhone: '+1 (800) 555-0199',
        },
      });
    }

    const roomsCount = await db.room.count();
    if (roomsCount === 0) {
      const roomsData = [
        { roomNumber: '101', floor: 1, type: 'Standard King', status: 'Occupied' },
        { roomNumber: '102', floor: 1, type: 'Standard Twin', status: 'Occupied' },
        { roomNumber: '204', floor: 2, type: 'Deluxe Executive King', status: 'Occupied' },
        { roomNumber: '301', floor: 3, type: 'Presidential Suite', status: 'Occupied' },
        { roomNumber: '305', floor: 3, type: 'Ocean View Suite', status: 'Vacant' },
      ];
      for (const r of roomsData) {
        await db.room.create({ data: { ...r, hotelId: hotel.id } });
      }
    }

    const guestCount = await db.guestSession.count();
    if (guestCount === 0) {
      await db.guestSession.create({
        data: {
          guestName: 'Alex Sharma',
          roomNumber: '204',
          pin: '1234',
          checkOutDate: new Date(Date.now() + 86400000 * 4),
          active: true,
        },
      });
      await db.guestSession.create({
        data: {
          guestName: 'Sarah Connor',
          roomNumber: '301',
          pin: '3010',
          checkOutDate: new Date(Date.now() + 86400000 * 5),
          active: true,
        },
      });
    }

    const staffCount = await db.staff.count();
    if (staffCount === 0) {
      const defaultStaffPassword = hashPassword('staff123');
      const defaultAdminPassword = hashPassword('admin123');

      await db.staff.createMany({
        data: [
          { name: 'Maria Garcia', email: 'maria.garcia@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'HOUSEKEEPING', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Carlos Rodriguez', email: 'carlos.rodriguez@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'MAINTENANCE', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Chef Antoine', email: 'antoine@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'KITCHEN', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'David Smith', email: 'david.smith@grandhorizon.com', password: defaultStaffPassword, role: 'SUPERVISOR', department: 'FRONT_DESK', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Vikram Singh', email: 'vikram.singh@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'BELL_DESK', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Priya Sharma', email: 'priya.sharma@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'LAUNDRY', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Inspector Robert', email: 'security@grandhorizon.com', password: defaultStaffPassword, role: 'STAFF', department: 'SECURITY', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
          { name: 'Manager Jane', email: 'manager.jane@grandhorizon.com', password: defaultAdminPassword, role: 'ADMIN', department: 'MANAGEMENT', dutyStatus: 'ON_DUTY', hotelId: hotel.id },
        ],
      });
    }

    globalForPrisma.seeded = true;
    console.log('✅ SmartStay Auto-seeding completed!');
  } catch (err) {
    console.error('Auto seed error:', err);
  }
}

