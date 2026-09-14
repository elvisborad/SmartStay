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
    const serviceCatCount = await db.serviceCategory.count();
    if (staffCount > 0 && serviceCatCount > 0) {
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

    const serviceCatCount = await db.serviceCategory.count();
    if (serviceCatCount === 0) {
      await db.serviceCategory.create({
        data: {
          name: 'Room Comfort & Amenities',
          icon: 'Sparkles',
          department: 'HOUSEKEEPING',
          hotelId: hotel.id,
          items: {
            create: [
              { name: 'Extra Plush Towels (Set of 2)', description: 'Freshly laundered extra large bath towels.', price: 0.0, estimatedMinutes: 10 },
              { name: 'Hypoallergenic Feather Pillow', description: 'Soft feather pillow for optimal rest.', price: 0.0, estimatedMinutes: 10 },
              { name: 'Steam Iron & Pressing Board', description: 'Delivered to room for quick clothing press.', price: 0.0, estimatedMinutes: 15 },
              { name: 'Room Refresh & Full Cleaning', description: 'Full room maid service and bed change.', price: 0.0, estimatedMinutes: 35 },
              { name: 'Bathroom Cleaning & Restock', description: 'Deep bathroom clean and fresh toiletries.', price: 0.0, estimatedMinutes: 20 },
              { name: 'Dental & Hygiene Kit', description: 'Toothbrush, toothpaste, razor & shaving gel.', price: 0.0, estimatedMinutes: 10 },
              { name: 'Fresh Bottled Water (Set of 2)', description: 'Chilled mineral drinking water bottles.', price: 0.0, estimatedMinutes: 5 },
            ],
          },
        },
      });

      await db.serviceCategory.create({
        data: {
          name: 'Maintenance & Electronics Repair',
          icon: 'Wrench',
          department: 'MAINTENANCE',
          hotelId: hotel.id,
          items: {
            create: [
              { name: 'Air Conditioning Repair & Adjust', description: 'Thermostat adjustment or cooling issue.', price: 0.0, estimatedMinutes: 20 },
              { name: 'TV & Wi-Fi Assistance', description: 'Help connecting streaming devices or fixing signal.', price: 0.0, estimatedMinutes: 15 },
              { name: 'Plumbing & Hot Water Issue', description: 'Shower pressure or temperature check.', price: 0.0, estimatedMinutes: 25 },
              { name: 'Lighting & Socket Repair', description: 'Fixing lamp, switch, or electrical outlet.', price: 0.0, estimatedMinutes: 15 },
            ],
          },
        },
      });

      await db.serviceCategory.create({
        data: {
          name: 'Skyline Restaurant & Bar Menu',
          icon: 'Utensils',
          department: 'KITCHEN',
          hotelId: hotel.id,
          items: {
            create: [
              { name: 'Masala Tea / Artisan Chai', description: 'Freshly brewed aromatic spiced tea with cardamom & ginger.', price: 120.0, estimatedMinutes: 10 },
              { name: 'Artisan Espresso / Cappuccino', description: 'Fresh roasted arabica coffee by our barista.', price: 180.0, estimatedMinutes: 10 },
              { name: 'Paneer Butter Masala & Garlic Naan', description: 'Cottage cheese in rich tomato butter gravy with warm garlic naan.', price: 380.0, estimatedMinutes: 25 },
              { name: 'Butter Chicken & Butter Naan', description: 'Tender tandoori chicken cooked in rich velvety tomato-butter gravy with butter naan.', price: 450.0, estimatedMinutes: 30 },
              { name: 'Hyderabadi Dum Biryani', description: 'Fragrant basmati rice layered with spiced marinated chicken and saffron.', price: 420.0, estimatedMinutes: 30 },
              { name: 'Dal Makhani & Jeera Rice', description: 'Slow-cooked black lentils in creamy butter sauce served with aromatic cumin rice.', price: 340.0, estimatedMinutes: 20 },
              { name: 'Crispy Masala Dosa', description: 'Golden fermented rice-lentil crepe stuffed with spiced potato masala, served with chutneys & sambar.', price: 220.0, estimatedMinutes: 20 },
              { name: 'Paneer Tikka & Mint Chutney', description: 'Charcoal-grilled marinated cottage cheese cubes with bell peppers & mint chutney.', price: 360.0, estimatedMinutes: 25 },
              { name: 'Chole Bhature', description: 'Spicy chickpea curry served with two fluffy deep-fried bhaturas and pickled onions.', price: 260.0, estimatedMinutes: 20 },
              { name: 'Grand Horizon Club Sandwich', description: 'Triple decker smoked chicken, cheese, lettuce & tomato served with fries.', price: 320.0, estimatedMinutes: 20 },
              { name: 'Truffle Mushroom Pasta', description: 'Handcrafted fettuccine, wild mushrooms, black truffle cream.', price: 480.0, estimatedMinutes: 25 },
              { name: 'Fresh Seasonal Fruit Bowl', description: 'Assorted berries, melon, kiwi, and honey yogurt dip.', price: 250.0, estimatedMinutes: 15 },
              { name: 'Gulab Jamun with Vanilla Ice Cream', description: 'Warm golden milk solids soaked in cardamom rose syrup served with vanilla ice cream.', price: 180.0, estimatedMinutes: 10 },
            ],
          },
        },
      });
    }

    const kbCount = await db.knowledgeBaseItem.count();
    if (kbCount === 0) {
      const kbItems = [
        { category: 'Wi-Fi & Connectivity', question: 'What is the Wi-Fi network name and password?', answer: 'The Wi-Fi network is "Hotel_Guest_WiFi" and the password is "Horizon2026!". High-speed internet is complimentary for all guests.', keywords: 'wifi, internet, password, network, connection' },
        { category: 'Dining & Breakfast', question: 'What time is breakfast served and where?', answer: 'Breakfast is served daily from 06:30 AM to 10:30 AM at the Grand Horizon Dining Room on Floor 1. In-room breakfast ordering is also available from 07:00 AM.', keywords: 'breakfast, food, timing, morning, dining, restaurant' },
        { category: 'Pool & Spa', question: 'What are the pool and spa operating hours?', answer: 'The Infinity Pool on Floor 4 is open daily from 07:00 AM to 09:00 PM. The Horizon Spa is open from 09:00 AM to 08:00 PM (advance booking recommended).', keywords: 'pool, swimming, spa, massage, hours, gym, fitness' },
        { category: 'Check-out & Policies', question: 'What is the check-out time? Can I request late check-out?', answer: 'Standard check-out time is 11:00 AM. Late check-out up to 02:00 PM can be requested through Front Desk or SmartStay, subject to room availability.', keywords: 'checkout, check-out, timing, late checkout, leave' },
      ];
      for (const kb of kbItems) {
        await db.knowledgeBaseItem.create({ data: { ...kb, hotelId: hotel.id } });
      }
    }

    globalForPrisma.seeded = true;
    console.log('✅ SmartStay Auto-seeding completed!');
  } catch (err) {
    console.error('Auto seed error:', err);
  }
}

