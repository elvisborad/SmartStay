'use client';

import { useState } from 'react';
import {
  Compass,
  Footprints,
  X,
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  Bell,
  Car,
} from 'lucide-react';

interface IndoorNavigationProps {
  roomNumber: string;
  onClose?: () => void;
}

export default function IndoorNavigation({ roomNumber, onClose }: IndoorNavigationProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('pool');

  const formatStep = (stepText: string) => {
    return stepText.replace(/Room 204/gi, `Room ${roomNumber}`).replace(/\b204\b/g, roomNumber);
  };

  const destinations = [
    {
      id: 'pool',
      title: 'Infinity Swimming Pool',
      floor: '4th Floor',
      iconComponent: Waves,
      walkTime: '3 mins (120m)',
      steps: [
        `Exit Room ${roomNumber} and turn right toward the main corridor.`,
        'Take Elevator B to the 4th Floor.',
        'Turn left out of the elevator and follow the blue poolside signage for 40 meters.',
        'Arrive at the Infinity Pool Entrance (Towel counter on your right).',
      ],
    },
    {
      id: 'restaurant',
      title: 'Skyline Restaurant & Dining',
      floor: '1st Floor (Lobby Level)',
      iconComponent: Utensils,
      walkTime: '2 mins (80m)',
      steps: [
        `Exit Room ${roomNumber} and head to Elevator A or B.`,
        'Descend to the 1st Floor Lobby Level.',
        'Turn right past the reception desk.',
        'Skyline Restaurant is straight ahead through the glass doors.',
      ],
    },
    {
      id: 'gym',
      title: '24/7 Fitness Center',
      floor: '2nd Floor',
      iconComponent: Dumbbell,
      walkTime: '1 min (30m)',
      steps: [
        `Exit Room ${roomNumber} onto the hallway corridor.`,
        'Turn left and walk 30 meters past the main elevator bank.',
        'Fitness Center is on your right. Use room keycard for access.',
      ],
    },
    {
      id: 'spa',
      title: 'Horizon Wellness Spa',
      floor: '3rd Floor',
      iconComponent: Sparkles,
      walkTime: '2 mins (90m)',
      steps: [
        `Exit Room ${roomNumber} and take Elevator B to the 3rd Floor.`,
        'Follow the aromatic lavender hallway to the east wing.',
        'Spa Reception desk is at the end of the hall.',
      ],
    },
    {
      id: 'reception',
      title: 'Main Lobby & Reception Desk',
      floor: '1st Floor',
      iconComponent: Bell,
      walkTime: '2 mins (75m)',
      steps: [
        `Exit Room ${roomNumber} and take Elevator A or central stairs to Floor 1.`,
        'Walk straight across the main atrium.',
        'Front Desk & Concierge desk is located directly in front.',
      ],
    },
    {
      id: 'parking',
      title: 'Valet & Covered Parking',
      floor: 'Basement Level B1',
      iconComponent: Car,
      walkTime: '4 mins (160m)',
      steps: [
        `Exit Room ${roomNumber} and take Elevator A down to Basement Level B1.`,
        'Follow green line on floor toward Valet Kiosk.',
        'Show room keycard or parking ticket to valet staff.',
      ],
    },
  ];

  const current = destinations.find((d) => d.id === selectedDestination) || destinations[0];
  const CurrentIcon = current.iconComponent;

  return (
    <div className="bg-white border border-[#E5DFD5] rounded-3xl p-6 shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#171717] text-[#C6A15B] flex items-center justify-center font-bold border border-[#C6A15B]/30 shadow-xs">
            <Compass className="w-5 h-5 text-[#C6A15B]" />
          </div>
          <div>
            <h3 className="font-bold text-[#171717] text-lg flex items-center gap-2">
              Hotel Indoor Navigation
            </h3>
            <p className="text-xs text-[#7C756B] font-medium">Live route guidance from Room {roomNumber}</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-[#7C756B] hover:text-[#171717] hover:bg-[#F8F5EF] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Destination Selection Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {destinations.map((d) => {
          const IconComponent = d.iconComponent;
          const isSelected = selectedDestination === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDestination(d.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 shadow-xs ${
                isSelected
                  ? 'bg-[#171717] text-[#F8F5EF] border border-[#C6A15B]/40 shadow-md'
                  : 'bg-white text-[#7C756B] hover:text-[#171717] hover:bg-[#F8F5EF] border border-[#E5DFD5]'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#C6A15B]' : 'text-[#7C756B]'}`} />
              <span>{d.title}</span>
            </button>
          );
        })}
      </div>

      {/* Route Display Card */}
      <div className="bg-[#F8F5EF] text-[#24211E] rounded-2xl p-6 space-y-5 border border-[#E5DFD5] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#C6A15B] bg-[#171717] px-2.5 py-1 rounded-full border border-[#C6A15B]/30">
              {current.floor}
            </span>
            <h4 className="text-xl font-extrabold text-[#171717] flex items-center gap-2 mt-2">
              <CurrentIcon className="w-5 h-5 text-[#C6A15B]" /> {current.title}
            </h4>
          </div>

          <div className="text-right text-xs text-[#7C756B] bg-white px-3.5 py-2 rounded-xl border border-[#E5DFD5] flex items-center gap-1.5 font-bold shadow-xs">
            <Footprints className="w-4 h-4 text-[#C6A15B]" />
            <span>{current.walkTime}</span>
          </div>
        </div>

        {/* Step-by-step instructions list */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#7C756B] uppercase tracking-wider">
            Step-by-Step Walking Directions:
          </div>

          {current.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E5DFD5] text-xs text-[#24211E] shadow-xs">
              <span className="w-5 h-5 rounded-full bg-[#171717] text-[#C6A15B] font-bold flex items-center justify-center shrink-0 text-[11px] border border-[#C6A15B]/30">
                {idx + 1}
              </span>
              <span className="leading-relaxed font-medium mt-0.5">{formatStep(step)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

