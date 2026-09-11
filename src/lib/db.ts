import { PrismaClient } from '@prisma/client';
import { hashPassword } from './passwords';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  seeded: boolean | undefined;
};

// Check if running on Vercel or read-only filesystem where ./dev.db is inaccessible
const targetDbUrl =
  process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('./dev.db'))
    ? 'file:/tmp/dev.db'
    : process.env.DATABASE_URL || 'file:./dev.db';

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: targetDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export async function ensureDbInitialized() {
  if (globalForPrisma.seeded) return;

  // 1. Auto-create SQLite tables if they do not exist
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Hotel" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "wifiName" TEXT NOT NULL DEFAULT 'GrandHorizon-Guest',
        "wifiPassword" TEXT NOT NULL DEFAULT 'Horizon2026!',
        "breakfastHours" TEXT NOT NULL DEFAULT '06:30 AM - 10:30 AM',
        "poolHours" TEXT NOT NULL DEFAULT '07:00 AM - 09:00 PM',
        "spaHours" TEXT NOT NULL DEFAULT '09:00 AM - 08:00 PM',
        "checkoutTime" TEXT NOT NULL DEFAULT '11:00 AM',
        "contactPhone" TEXT NOT NULL DEFAULT '+1 (800) 555-0199',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Room" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "roomNumber" TEXT NOT NULL UNIQUE,
        "floor" INTEGER NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'Deluxe King',
        "status" TEXT NOT NULL DEFAULT 'Occupied',
        "hotelId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GuestSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "guestName" TEXT NOT NULL,
        "roomNumber" TEXT NOT NULL,
        "pin" TEXT NOT NULL DEFAULT '1234',
        "checkInDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "checkOutDate" DATETIME NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Staff" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL DEFAULT '',
        "role" TEXT NOT NULL DEFAULT 'STAFF',
        "department" TEXT NOT NULL DEFAULT 'HOUSEKEEPING',
        "dutyStatus" TEXT NOT NULL DEFAULT 'ON_DUTY',
        "avatar" TEXT,
        "hotelId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ServiceCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT 'Briefcase',
        "department" TEXT NOT NULL DEFAULT 'HOUSEKEEPING',
        "hotelId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ServiceItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" REAL NOT NULL DEFAULT 0.0,
        "estimatedMinutes" INTEGER NOT NULL DEFAULT 15,
        "available" BOOLEAN NOT NULL DEFAULT 1,
        "categoryId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Ticket" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ticketNumber" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "department" TEXT NOT NULL DEFAULT 'HOUSEKEEPING',
        "category" TEXT NOT NULL DEFAULT 'General',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "slaMinutes" INTEGER NOT NULL DEFAULT 30,
        "roomNumber" TEXT NOT NULL,
        "guestName" TEXT NOT NULL,
        "guestSessionId" TEXT,
        "assignedStaffId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" DATETIME
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TicketLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ticketId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "notes" TEXT,
        "performedBy" TEXT NOT NULL DEFAULT 'System',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderNumber" TEXT NOT NULL UNIQUE,
        "roomNumber" TEXT NOT NULL,
        "guestName" TEXT NOT NULL,
        "totalAmount" REAL NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'RECEIVED',
        "guestSessionId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "serviceItemId" TEXT,
        "itemName" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" REAL NOT NULL
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "KnowledgeBaseItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "category" TEXT NOT NULL DEFAULT 'General FAQs',
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "keywords" TEXT NOT NULL DEFAULT '',
        "hotelId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.warn('Table auto-create notice:', err);
  }

  try {
    const staffCount = await db.staff.count();
    if (staffCount > 0) {
      globalForPrisma.seeded = true;
      return;
    }
  } catch (err) {
    console.warn('DB count check notice:', err);
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

