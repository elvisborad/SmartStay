import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/passwords';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartStay SIH 2026 Database Seeding...');

  // Clean existing database
  await prisma.ticketLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.knowledgeBaseItem.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.guestSession.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();

  // 1. Create Hotel
  const hotel = await prisma.hotel.create({
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

  console.log(`✅ Hotel created: ${hotel.name}`);

  // 2. Create Rooms
  const roomsData = [
    { roomNumber: '101', floor: 1, type: 'Standard King', status: 'Occupied' },
    { roomNumber: '102', floor: 1, type: 'Standard Twin', status: 'Occupied' },
    { roomNumber: '204', floor: 2, type: 'Deluxe Executive King', status: 'Occupied' },
    { roomNumber: '301', floor: 3, type: 'Presidential Suite', status: 'Occupied' },
    { roomNumber: '305', floor: 3, type: 'Ocean View Suite', status: 'Vacant' },
  ];

  for (const r of roomsData) {
    await prisma.room.create({
      data: {
        ...r,
        hotelId: hotel.id,
      },
    });
  }
  console.log(`✅ ${roomsData.length} Rooms created including Room 204.`);

  // 3. Create Active Guest Sessions (Alex Sharma in Room 204)
  const guestAlex = await prisma.guestSession.create({
    data: {
      guestName: 'Alex Sharma',
      roomNumber: '204',
      pin: '1234',
      checkOutDate: new Date(Date.now() + 86400000 * 4),
      active: true,
    },
  });

  const guestSarah = await prisma.guestSession.create({
    data: {
      guestName: 'Sarah Connor',
      roomNumber: '301',
      pin: '3010',
      checkOutDate: new Date(Date.now() + 86400000 * 5),
      active: true,
    },
  });

  console.log(`✅ Active Guest Sessions created for Room 204 (Alex Sharma) & Room 301.`);

  // 4. Create Staff Accounts across all 8 Departments
  const defaultStaffPassword = hashPassword('staff123');
  const defaultAdminPassword = hashPassword('admin123');

  await prisma.staff.createMany({
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

  console.log(`✅ Staff Accounts created across 8 Departments.`);

  // 5. Create Service Categories & Items
  await prisma.serviceCategory.create({
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

  await prisma.serviceCategory.create({
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

  await prisma.serviceCategory.create({
    data: {
      name: 'Skyline Restaurant & Bar Menu',
      icon: 'Utensils',
      department: 'KITCHEN',
      hotelId: hotel.id,
      items: {
        create: [
          { name: 'Masala Tea / Artisan Chai', description: 'Freshly brewed aromatic spiced tea.', price: 4.5, estimatedMinutes: 10 },
          { name: 'Artisan Espresso / Cappuccino', description: 'Fresh roasted coffee by our barista.', price: 6.5, estimatedMinutes: 10 },
          { name: 'Grand Horizon Club Sandwich', description: 'Triple decker smoked turkey, bacon, avocado, served with fries.', price: 18.5, estimatedMinutes: 25 },
          { name: 'Paneer Butter Masala & Naan', description: 'Cottage cheese in rich tomato gravy with garlic naan.', price: 21.0, estimatedMinutes: 30 },
          { name: 'Truffle Mushroom Pasta', description: 'Handcrafted fettuccine, wild mushrooms, black truffle cream.', price: 24.0, estimatedMinutes: 30 },
          { name: 'Fresh Seasonal Fruit Bowl', description: 'Assorted berries, melon, kiwi, and honey yogurt dip.', price: 14.0, estimatedMinutes: 15 },
        ],
      },
    },
  });

  console.log(`✅ Service Categories & Menu Items created.`);

  // 6. Create Knowledge Base Items (FAQs & Multilingual RAG context)
  const kbItems = [
    {
      category: 'Wi-Fi & Connectivity',
      question: 'What is the Wi-Fi network name and password?',
      answer: 'The Wi-Fi network is "Hotel_Guest_WiFi" and the password is "Horizon2026!". High-speed internet is complimentary for all guests.',
      keywords: 'wifi, internet, password, network, connection',
    },
    {
      category: 'Dining & Breakfast',
      question: 'What time is breakfast served and where?',
      answer: 'Breakfast is served daily from 06:30 AM to 10:30 AM at the Grand Horizon Dining Room on Floor 1. In-room breakfast ordering is also available from 07:00 AM.',
      keywords: 'breakfast, food, timing, morning, dining, restaurant',
    },
    {
      category: 'Pool & Spa',
      question: 'What are the pool and spa operating hours?',
      answer: 'The Infinity Pool on Floor 4 is open daily from 07:00 AM to 09:00 PM. The Horizon Spa is open from 09:00 AM to 08:00 PM (advance booking recommended).',
      keywords: 'pool, swimming, spa, massage, hours, gym, fitness',
    },
    {
      category: 'Check-out & Policies',
      question: 'What is the check-out time? Can I request late check-out?',
      answer: 'Standard check-out time is 11:00 AM. Late check-out up to 02:00 PM can be requested through Front Desk or SmartStay, subject to room availability.',
      keywords: 'checkout, check-out, timing, late checkout, leave',
    },
  ];

  for (const kb of kbItems) {
    await prisma.knowledgeBaseItem.create({
      data: {
        ...kb,
        hotelId: hotel.id,
      },
    });
  }

  // 7. Seed Initial Active Ticket for Room 204
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TSK-2001',
      title: 'Extra Plush Towels requested',
      description: 'Guest Alex Sharma requested 2 bath towels for Room 204.',
      department: 'HOUSEKEEPING',
      category: 'Amenities',
      priority: 'MEDIUM',
      status: 'PENDING',
      slaMinutes: 10,
      roomNumber: '204',
      guestName: 'Alex Sharma',
      guestSessionId: guestAlex.id,
      logs: {
        create: [
          { action: 'CREATED', notes: 'Submitted via SmartStay Concierge', performedBy: 'Alex Sharma' },
        ],
      },
    },
  });

  console.log('🎉 SmartStay SIH 2026 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
