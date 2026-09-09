'use client';

import { useState } from 'react';
import { Compass, Footprints, X } from 'lucide-react';

interface IndoorNavigationProps {
  roomNumber: string;
  onClose?: () => void;
}

export default function IndoorNavigation({ roomNumber, onClose }: IndoorNavigationProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('pool');

  const destinations = [
    {
      id: 'pool',
      title: 'Infinity Swimming Pool',
      floor: '4th Floor',
      icon: '🏊‍♂️',
      walkTime: '3 mins (120m)',
      steps: [
        'Exit Room 204 and turn right toward the main corridor.',
        'Take Elevator B to the 4th Floor.',
        'Turn left out of the elevator and follow the blue poolside signage for 40 meters.',
        'Arrive at the Infinity Pool Entrance (Towel counter on your right).',
      ],
    },
    {
      id: 'restaurant',
      title: 'Skyline Restaurant & Dining',
      floor: '1st Floor (Lobby Level)',
      icon: '🍽️',
      walkTime: '2 mins (80m)',
      steps: [
        'Exit Room 204 and head to Elevator A or B.',
        'Descend to the 1st Floor Lobby Level.',
        'Turn right past the reception desk.',
        'Skyline Restaurant is straight ahead through the glass doors.',
      ],
    },
    {
      id: 'gym',
      title: '24/7 Fitness Center',
      floor: '2nd Floor',
      icon: '🏋️',
      walkTime: '1 min (30m)',
      steps: [
        'Exit Room 204 onto the 2nd Floor hallway.',
        'Turn left and walk 30 meters past Room 210.',
        'Fitness Center is on your right. Use room keycard for access.',
      ],
    },
    {
      id: 'spa',
      title: 'Horizon Wellness Spa',
      floor: '3rd Floor',
      icon: '💆',
      walkTime: '2 mins (90m)',
      steps: [
        'Take Elevator B to the 3rd Floor.',
        'Follow the aromatic lavender hallway to the east wing.',
        'Spa Reception desk is at the end of the hall.',
      ],
    },
    {
      id: 'reception',
      title: 'Main Lobby & Reception Desk',
      floor: '1st Floor',
      icon: '🛎️',
      walkTime: '2 mins (75m)',
      steps: [
        'Take Elevator A or central stairs to Floor 1.',
        'Walk straight across the main atrium.',
        'Front Desk & Concierge desk is located directly in front.',
      ],
    },
    {
      id: 'parking',
      title: 'Valet & Covered Parking',
      floor: 'Basement Level B1',
      icon: '🚗',
      walkTime: '4 mins (160m)',
      steps: [
        'Take Elevator A down to Basement Level B1.',
        'Follow green line on floor toward Valet Kiosk.',
        'Show room keycard or parking ticket to valet staff.',
      ],
    },
  ];

  const current = destinations.find((d) => d.id === selectedDestination) || destinations[0];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F7F5] text-[#0F9F91] flex items-center justify-center font-bold border border-[#0F9F91]/30">
            <Compass className="w-6 h-6 text-[#0F9F91]" />
          </div>
          <div>
            <h3 className="font-bold text-[#172033] text-lg flex items-center gap-2">
              Hotel Indoor Navigation
            </h3>
            <p className="text-xs text-[#526174] font-medium">Live route guidance from Room {roomNumber}</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Destination Selection Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {destinations.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDestination(d.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 shadow-xs ${
              selectedDestination === d.id
                ? 'bg-[#0F9F91] text-white shadow-md'
                : 'bg-[#F1F5F9] text-[#526174] hover:text-[#172033] hover:bg-[#E8F7F5] border border-[#CBD5E1]'
            }`}
          >
            <span>{d.icon}</span>
            <span>{d.title}</span>
          </button>
        ))}
      </div>

      {/* Route Display Card */}
      <div className="bg-[#F8FAFC] text-[#172033] rounded-2xl p-6 space-y-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#0F9F91] bg-[#E8F7F5] px-2.5 py-1 rounded-full border border-[#0F9F91]/30">
              {current.floor}
            </span>
            <h4 className="text-xl font-extrabold text-[#172033] flex items-center gap-2 mt-1">
              <span>{current.icon}</span> {current.title}
            </h4>
          </div>

          <div className="text-right text-xs text-[#526174] bg-white px-3.5 py-2 rounded-xl border border-[#CBD5E1] flex items-center gap-1.5 font-bold shadow-xs">
            <Footprints className="w-4 h-4 text-[#0F9F91]" />
            <span>{current.walkTime}</span>
          </div>
        </div>

        {/* Step-by-step instructions list */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#526174] uppercase tracking-wider">
            Step-by-Step Walking Directions:
          </div>

          {current.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#172033] shadow-xs">
              <span className="w-5 h-5 rounded-full bg-[#E8F7F5] text-[#0F9F91] font-bold flex items-center justify-center shrink-0 text-[11px] border border-[#0F9F91]/40">
                {idx + 1}
              </span>
              <span className="leading-relaxed font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
