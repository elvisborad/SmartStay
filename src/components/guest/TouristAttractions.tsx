'use client';

import { useState } from 'react';
import { MapPin, Clock, Compass, Sparkles, Navigation, Calendar } from 'lucide-react';

export default function TouristAttractions() {
  const [activePlan, setActivePlan] = useState<boolean>(false);

  const attractions = [
    {
      id: 'beach',
      name: 'Paradise Bay Beach & Promenade',
      category: 'Nature & Relaxation',
      dist: '0.8 km (10 mins walk)',
      hours: 'Open 24/7',
      desc: 'Golden sands, pristine waters, water sports, and sunset boardwalk.',
      icon: '🏖️',
    },
    {
      id: 'fort',
      name: 'Historical Coastal Fort & Lighthouse',
      category: 'Heritage & Culture',
      dist: '2.5 km (8 mins drive)',
      hours: '08:00 AM - 06:00 PM',
      desc: '18th-century sea fort offering panoramic bay views and guided history walks.',
      icon: '🏰',
    },
    {
      id: 'market',
      name: 'Grand Spice & Artisan Bazaar',
      category: 'Shopping & Street Food',
      dist: '1.8 km (6 mins drive)',
      hours: '10:00 AM - 09:30 PM',
      desc: 'Vibrant local market for handicrafts, spices, silk scarves, and local street delicacies.',
      icon: '🛍️',
    },
    {
      id: 'temple',
      name: 'Sri Ocean Sun Temple',
      category: 'Spiritual Heritage',
      dist: '3.2 km (10 mins drive)',
      hours: '06:00 AM - 08:00 PM',
      desc: 'Ancient stone temple architecture overlooking the ocean.',
      icon: '🛕',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0F9F91]" />
            Explore Nearby & Local Attractions
          </h2>
          <p className="text-xs text-[#526174] font-medium">Handpicked local destinations around Grand Horizon Hotel</p>
        </div>

        <button
          onClick={() => setActivePlan(!activePlan)}
          className="bg-[#0F9F91] hover:bg-[#0B857A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-[#0F9F91]/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {activePlan ? 'Hide Itinerary' : 'Plan 4-Hour Tour'}
        </button>
      </div>

      {/* AI 4-Hour Itinerary Generator Box */}
      {activePlan && (
        <div className="bg-white text-[#172033] rounded-3xl p-6 space-y-4 border border-[#0F9F91]/40 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="font-bold text-sm text-[#0F9F91] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> AI Personalized 4-Hour Tour Itinerary
            </h3>
            <span className="text-[10px] bg-[#E8F7F5] text-[#0F9F91] px-2.5 py-0.5 rounded-full border border-[#0F9F91]/30 font-bold">
              Optimal Schedule
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#526174]">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#0F9F91]">Hour 1:</span>
              <div>
                <strong className="text-[#172033]">Paradise Bay Beach Walk (0.8 km)</strong>
                <p className="text-[#526174] mt-0.5 font-medium">Stroll along the coastal promenade and take ocean photographs.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#0F9F91]">Hour 2:</span>
              <div>
                <strong className="text-[#172033]">Historical Coastal Fort (2.5 km)</strong>
                <p className="text-[#526174] mt-0.5 font-medium">Explore the historic lighthouse and panoramic viewpoint.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#0F9F91]">Hour 3:</span>
              <div>
                <strong className="text-[#172033]">Artisan Spice Bazaar Shopping</strong>
                <p className="text-[#526174] mt-0.5 font-medium">Browse local souvenirs, tea blends, and authentic snacks.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#0F9F91]">Hour 4:</span>
              <div>
                <strong className="text-[#172033]">Return to Hotel & Refreshments</strong>
                <p className="text-[#526174] mt-0.5 font-medium">Return via hotel shuttle and enjoy tea at Skyline Cafe.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attractions.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-5 shadow-sm space-y-3 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#526174] border border-[#CBD5E1]">
                {item.category}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-[#172033] text-base">{item.name}</h3>
              <p className="text-xs text-[#526174] mt-1 font-medium">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#526174]">
              <span className="flex items-center gap-1 text-[#172033] font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#0F9F91]" /> {item.dist}
              </span>
              <span className="flex items-center gap-1 text-[#8290A3] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#0F9F91]" /> {item.hours}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
