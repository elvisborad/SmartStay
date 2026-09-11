import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchKnowledgeBase, searchKnowledgeBaseDetailed } from '@/lib/ragEngine';
import { db } from '@/lib/db';

function isInformationalQuery(message: string): boolean {
  const lowerMsg = message.toLowerCase().trim();

  // Explicit order/action verbs that indicate a operational ticket dispatch request
  const actionOrderVerbs = [
    'order',
    'bring',
    'send',
    'deliver',
    'fetch',
    'give me',
    'provide',
    'clean my',
    'clean room',
    'fix',
    'repair',
    'replace',
    'change room',
    'switch room',
    'request late',
    'checkout now',
    'check out now',
    'bhejo',
    'laao',
    'mangaao',
    'moklo',
  ];

  const hasActionOrder = actionOrderVerbs.some((verb) => lowerMsg.includes(verb));

  // Explicit question / inquiry phrases
  const questionPhrases = [
    'is breakfast available',
    'is breakfast included',
    'is breakfast free',
    'is available',
    'is included',
    'is free',
    'what time',
    'when is',
    'when does',
    'where is',
    'where can',
    'how much',
    'how do i',
    'how to',
    'do you have',
    'do you serve',
    'do you offer',
    'tell me',
    'can you tell',
    'can i know',
    'need to know',
    'want to know',
    'wondering if',
    'information about',
    'info about',
    'what are',
    'what is',
    'timing',
    'timings',
    'hours',
    'price',
    'cost',
    'rate',
    'menu',
    'kya',
    'kab',
    'kahan',
    'kitna',
    'timing kya',
    'available hai',
    'chhe',
  ];

  const hasQuestionPhrase = questionPhrases.some((phrase) => lowerMsg.includes(phrase));

  if (hasQuestionPhrase && !hasActionOrder) {
    return true;
  }

  // Question mark or question word prefix with no explicit action order
  const startsWithQuestionWord = /^(is|are|was|were|what|when|where|how|why|which|do|does|did|can i|could i|kya|kab)\b/.test(lowerMsg);
  const endsWithQuestion = lowerMsg.includes('?');

  if ((startsWithQuestionWord || endsWithQuestion) && !hasActionOrder) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, roomNumber, guestName, guestSessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();
    const createdTickets: any[] = [];
    const isQuery = isInformationalQuery(message);

    // 1. Intent Detection & Task Splitting Engine (Skipped for pure informational inquiries)
    if (!isQuery) {

    // Intent A: Housekeeping (Towels, Pillows, Slippers, Cleaning, Toiletries, Iron, Custom Items)
    if (
      lowerMsg.includes('towel') ||
      lowerMsg.includes('toovel') ||
      lowerMsg.includes('pillow') ||
      lowerMsg.includes('slipper') ||
      lowerMsg.includes('slippers') ||
      lowerMsg.includes('chappal') ||
      lowerMsg.includes('chappals') ||
      lowerMsg.includes('flip flop') ||
      lowerMsg.includes('footwear') ||
      lowerMsg.includes('clean') ||
      lowerMsg.includes('safai') ||
      lowerMsg.includes('iron') ||
      lowerMsg.includes('shampoo') ||
      lowerMsg.includes('blanket') ||
      lowerMsg.includes('toiletries') ||
      lowerMsg.includes('soap') ||
      lowerMsg.includes('adapter') ||
      lowerMsg.includes('charger') ||
      lowerMsg.includes('toothbrush') ||
      lowerMsg.includes('toothpaste') ||
      lowerMsg.includes('dental') ||
      lowerMsg.includes('comb') ||
      lowerMsg.includes('razor') ||
      lowerMsg.includes('kettle') ||
      lowerMsg.includes('ice') ||
      lowerMsg.includes('sewing') ||
      lowerMsg.includes('robe') ||
      lowerMsg.includes('bathrobe') ||
      lowerMsg.includes('other') ||
      lowerMsg.includes('others')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: lowerMsg.includes('slipper') || lowerMsg.includes('chappal')
            ? 'In-Room Slippers & Amenities Request'
            : 'Housekeeping & Amenities Request',
          description: `Guest ${guestName} (Room ${roomNumber}) requested via SmartStay: "${message}"`,
          department: 'HOUSEKEEPING',
          category: 'Amenities',
          priority: 'NORMAL',
          status: 'PENDING',
          slaMinutes: 10,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Parsed & created by SmartStay Intent Engine',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent B: Water Request (Bottled water, drinking water)
    if (lowerMsg.includes('water') || lowerMsg.includes('paani') || lowerMsg.includes('pani') || lowerMsg.includes('પાણી')) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Fresh Bottled Water Request',
          description: `Guest ${guestName} requested drinking water for Room ${roomNumber}. Prompt: "${message}"`,
          department: 'HOUSEKEEPING',
          category: 'Water',
          priority: 'NORMAL',
          status: 'PENDING',
          slaMinutes: 5,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated 1-tap water request dispatched',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent C: Restaurant / Food & Beverage (Coffee, Tea, Sandwich, Breakfast, In-Room Dining)
    if (
      lowerMsg.includes('coffee') ||
      lowerMsg.includes('chai') ||
      lowerMsg.includes('tea') ||
      lowerMsg.includes('sandwich') ||
      lowerMsg.includes('food') ||
      lowerMsg.includes('khana') ||
      lowerMsg.includes('breakfast') ||
      lowerMsg.includes('lunch') ||
      lowerMsg.includes('dinner') ||
      lowerMsg.includes('snack') ||
      lowerMsg.includes('pasta') ||
      lowerMsg.includes('pizza') ||
      lowerMsg.includes('juice')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'In-Room Dining / Beverage Order',
          description: `Guest ${guestName} (Room ${roomNumber}) ordered via SmartStay: "${message}"`,
          department: 'KITCHEN',
          category: 'In-Room Dining',
          priority: 'HIGH',
          status: 'PENDING',
          slaMinutes: 20,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Kitchen order dispatched',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent D: Maintenance & Electronics (AC, TV, Wi-Fi, Plumbing, Light)
    if (
      lowerMsg.includes('ac') ||
      lowerMsg.includes('air conditioning') ||
      lowerMsg.includes('tv') ||
      lowerMsg.includes('plumbing') ||
      lowerMsg.includes('geyser') ||
      lowerMsg.includes('light') ||
      lowerMsg.includes('socket') ||
      lowerMsg.includes('remote') ||
      lowerMsg.includes('leak')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Maintenance & Electronics Repair',
          description: `Guest ${guestName} (Room ${roomNumber}) reported issue: "${message}"`,
          department: 'MAINTENANCE',
          category: 'Repair',
          priority: 'HIGH',
          status: 'PENDING',
          slaMinutes: 15,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Maintenance ticket created',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent E: Check-out & Late Check-out Request
    if (
      lowerMsg.includes('checkout') ||
      lowerMsg.includes('check-out') ||
      lowerMsg.includes('check out') ||
      lowerMsg.includes('late check') ||
      lowerMsg.includes('extend stay')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Late Check-out Request',
          description: `Guest ${guestName} requested late check-out for Room ${roomNumber}. Prompt: "${message}"`,
          department: 'FRONT_DESK',
          category: 'Check-out',
          priority: 'MEDIUM',
          status: 'PENDING',
          slaMinutes: 15,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Late Check-out request created',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent F: Luggage & Bell Desk Porter
    if (
      lowerMsg.includes('luggage') ||
      lowerMsg.includes('bag') ||
      lowerMsg.includes('porter') ||
      lowerMsg.includes('suitcase')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Luggage Transfer & Porter Assistance',
          description: `Guest ${guestName} requested luggage assistance for Room ${roomNumber}. Prompt: "${message}"`,
          department: 'BELL_DESK',
          category: 'Luggage',
          priority: 'NORMAL',
          status: 'PENDING',
          slaMinutes: 10,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Luggage Porter ticket created',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent G: Access Assistance & Keycard Security
    if (
      lowerMsg.includes('lost key') ||
      lowerMsg.includes('locked') ||
      lowerMsg.includes('keycard') ||
      lowerMsg.includes('lock room')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Access Assistance & Keycard Verification',
          description: `Guest ${guestName} (Room ${roomNumber}) reported locked room or lost key: "${message}"`,
          department: 'SECURITY',
          category: 'Keycard Access',
          priority: 'HIGH',
          status: 'PENDING',
          slaMinutes: 5,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Security Access ticket created',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent H: Room Change Request
    if (
      lowerMsg.includes('room change') ||
      lowerMsg.includes('change room') ||
      lowerMsg.includes('switch room') ||
      lowerMsg.includes('another room')
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Room Change Request',
          description: `Guest ${guestName} (Room ${roomNumber}) requested room change: "${message}"`,
          department: 'FRONT_DESK',
          category: 'Room Assignment',
          priority: 'HIGH',
          status: 'PENDING',
          slaMinutes: 15,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Automated Room Change ticket created',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }

    // Intent I: Custom Action Request Fallback (e.g., "I want slippers", "bring me X", "send Y", "others")
    if (
      createdTickets.length === 0 &&
      (
        lowerMsg.includes('want') ||
        lowerMsg.includes('bring') ||
        lowerMsg.includes('send') ||
        lowerMsg.includes('need') ||
        lowerMsg.includes('get me') ||
        lowerMsg.includes('give me') ||
        lowerMsg.includes('deliver') ||
        lowerMsg.includes('provide') ||
        lowerMsg.includes('others') ||
        lowerMsg.includes('other')
      )
    ) {
      const count = await db.ticket.count();
      const ticket = await db.ticket.create({
        data: {
          ticketNumber: `TSK-${1000 + count + 1}`,
          title: 'Guest Custom Service & Item Request',
          description: `Guest ${guestName} (Room ${roomNumber}) requested: "${message}"`,
          department: 'HOUSEKEEPING',
          category: 'Special Request',
          priority: 'MEDIUM',
          status: 'PENDING',
          slaMinutes: 10,
          roomNumber,
          guestName,
          guestSessionId: guestSessionId || null,
          logs: {
            create: [
              {
                action: 'CREATED',
                notes: 'Parsed & created by SmartStay Custom Request Engine',
                performedBy: 'SmartStay Concierge',
              },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }
    } // End of if (!isQuery) Intent Engine block

    // 2. Fetch Knowledge Base RAG Context
    const ragContext = await searchKnowledgeBase(message);

    // 3. LLM Response Generation (Gemini or Local Smart Engine)
    const apiKey = process.env.GEMINI_API_KEY;
    let responseText = '';

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are "SmartStay", the 5-star digital concierge for Grand Horizon Hotel.
Guest: ${guestName} (Room ${roomNumber})

Context:
${ragContext}

User Prompt: "${message}"

Respond politely in the guest's language (English, Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, Italian, Korean, Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, or any other global language).
${
  createdTickets.length > 0
    ? `Confirm that you have split and dispatched ${createdTickets.length} separate service tickets (${createdTickets.map((t) => `${t.ticketNumber} for ${t.department}`).join(', ')}) to our staff.`
    : ''
}`;

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (e) {
        console.warn('Gemini AI call fallback:', e);
      }
    }

    // 4. Local RAG & Ticket Synthesis (when Gemini API is offline or not set)
    if (!responseText) {
      if (lowerMsg.includes('checkout') || lowerMsg.includes('check-out') || lowerMsg.includes('check out') || lowerMsg.includes('late check')) {
        const ticketInfo = createdTickets.find(t => t.department === 'FRONT_DESK');
        responseText = `Standard check-out time is **11:00 AM**. ${
          ticketInfo 
            ? `I have logged a Late Check-out Request (**${ticketInfo.ticketNumber}**) with the Front Desk for Room ${roomNumber}. Our reception team will review availability and confirm extension up to 02:00 PM.`
            : `Late check-out up to 02:00 PM can be requested directly at the Front Desk or by submitting a request in the app.`
        }`;
      } else if (createdTickets.length > 0) {
        responseText = `Certainly, ${guestName}! I have processed your request and dispatched ${
          createdTickets.length
        } operational ticket(s) to our staff:\n${createdTickets
          .map((t) => `• **${t.ticketNumber}** (${t.department}): ~${t.slaMinutes}m SLA`)
          .join('\n')}\n\nOur team is on its way to Room ${roomNumber}.`;
      } else if (lowerMsg.includes('wifi') || lowerMsg.includes('internet') || lowerMsg.includes('password')) {
        responseText = `The complimentary high-speed Wi-Fi network is **Hotel_Guest_WiFi** with password **Horizon2026!**. Please let me know if you need technical assistance.`;
      } else if (lowerMsg.includes('pool') || lowerMsg.includes('swimming') || lowerMsg.includes('spa') || lowerMsg.includes('gym')) {
        responseText = `• **Infinity Pool (Floor 4)**: Open daily 07:00 AM - 09:00 PM.\n• **Horizon Spa**: Open daily 09:00 AM - 08:00 PM.\n• **Fitness Center (Floor 2)**: 24/7 keycard access. Towels provided!`;
      } else if (lowerMsg.includes('breakfast')) {
        responseText = `Breakfast is served daily from **06:30 AM to 10:30 AM** at the Skyline Dining Room (Floor 1). In-room dining is also available directly through the Dining tab!`;
      } else {
        const { matchedKb, matchedServices } = await searchKnowledgeBaseDetailed(message);
        if (matchedKb.length > 0) {
          responseText = `Here is what I found in our Knowledge Base for you, ${guestName}:\n\n` + 
            matchedKb.map(kb => `**${kb.question}**\n${kb.answer}`).join('\n\n');
        } else if (matchedServices.length > 0) {
          responseText = `Here are the matching services available for Room ${roomNumber}:\n\n` +
            matchedServices.map(s => `• **${s.name}** ($${s.price.toFixed(2)}) — ${s.description}`).join('\n');
        } else {
          responseText = `Hello ${guestName}! How may I assist you with your stay in Room ${roomNumber} today? You can ask me for extra towels, bottled water, food orders, AC repair, late check-out, luggage porter, or local tourist spots!`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      ticketCreated: createdTickets.length > 0 ? createdTickets[0] : null,
      createdTickets,
    });
  } catch (error: any) {
    console.error('SmartStay chat error:', error);
    return NextResponse.json({ error: 'AI processing error' }, { status: 500 });
  }
}
