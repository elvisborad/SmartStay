# SmartStay — Smart AI Hotel Concierge & Service Automation Platform

**SmartStay** is an enterprise-grade AI-native hospitality automation platform built to transform hotel guest service delivery, automate task routing across departments, and provide management with real-time operational analytics.

---

## 🌟 Key Capabilities

1. **Guest Digital Concierge Portal (`/guest`)**
   - Quick room check-in with Room # and PIN (Demo: Room 201 Alex Mercer, Room 301 Sarah Connor).
   - 1-Click amenity requests (Extra towels, pillows, steam iron, maid service).
   - Digital In-Room Dining catalog with shopping cart and kitchen order dispatch.
   - Real-time live status tracker ("Submitted" -> "Staff Assigned" -> "En Route" -> "Completed").

2. **Horizon AI Concierge & Action Automation (`/api/ai/chat`)**
   - RAG (Retrieval-Augmented Generation) retrieval over hotel policies, Wi-Fi details, breakfast times, and amenities.
   - Intelligent Intent Detection & Structured Tool Calls: Natural requests like *"I need 2 bath towels"* or *"My AC isn't cooling"* automatically generate structured tickets in the database and dispatch staff.

3. **Staff Operations Workspace (`/staff`)**
   - Department-filtered live Kanban board (`Housekeeping`, `Maintenance`, `Kitchen`, `Front Desk`).
   - Priority SLA indicators (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
   - One-tap status updates ("Accept & Start Task", "Mark Completed").

4. **Hotel Admin & Analytics Control Center (`/admin`)**
   - Live KPI Cards: SLA resolution times, room service revenue, ticket volume by department, AI auto-dispatch rate.
   - RAG Knowledge Base Editor: Add and update FAQs in real-time.
   - Staff Duty Roster & Workload monitor.
   - CSV Shift Summary Export.

---

## 🚀 Quick Start Guide

### 1. Installation & Setup
```bash
# Clone or open workspace directory
cd d:/DELL/Documents/SmartStay

# Install dependencies (Next.js 14, Prisma, Tailwind, Google GenAI SDK)
npm install
```

### 2. Database Initialization
```bash
# Push Prisma schema to SQLite database
npx prisma db push

# Seed hotel demo data (rooms, staff, categories, FAQs, initial tickets)
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Testing the 7 Phases Demo Flow

1. **Landing Hub (`http://localhost:3000`)**:
   - Choose **Guest Portal**, **Staff Dashboard**, or **Admin & Analytics**.
   - Use the **Reset Demo Data** button anytime to return to a clean demo state.

2. **Guest Experience**:
   - Navigate to `/guest/login` and click **Alex Mercer — Room 201**.
   - Tap **"Request Now"** on Extra Plush Towels, or open **In-Room Dining** to order a Club Sandwich.
   - Click **"Ask AI Concierge"** and type *"My AC is blowing warm air"* — watch the AI answer and automatically create a high-priority Maintenance ticket (`TSK-xxxx`).

3. **Staff Dispatch Experience**:
   - Open `/staff` in a new tab.
   - Filter by **Maintenance** or **Housekeeping** — see the new ticket appear in real-time.
   - Click **"Accept & Start Task"**, then **"Mark Completed"**.

4. **Admin Analytics Experience**:
   - Open `/admin` to view updated operational metrics, room service revenue, and department ticket distribution.
