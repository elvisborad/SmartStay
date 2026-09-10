'use client';

import { useState } from 'react';
import { MapPin, Clock, Compass, Sparkles, Navigation, Calendar, SunMedium, Landmark, ShoppingBag, Building2 } from 'lucide-react';

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
      iconComponent: SunMedium,
    },
    {
      id: 'fort',
      name: 'Historical Coastal Fort & Lighthouse',
      category: 'Heritage & Culture',
      dist: '2.5 km (8 mins drive)',
      hours: '08:00 AM - 06:00 PM',
      desc: '18th-century sea fort offering panoramic bay views and guided history walks.',
      iconComponent: Landmark,
    },
    {
      id: 'market',
      name: 'Grand Spice & Artisan Bazaar',
      category: 'Shopping & Street Food',
      dist: '1.8 km (6 mins drive)',
      hours: '10:00 AM - 09:30 PM',
      desc: 'Vibrant local market for handicrafts, spices, silk scarves, and local street delicacies.',
      iconComponent: ShoppingBag,
    },
    {
      id: 'temple',
      name: 'Sri Ocean Sun Temple',
      category: 'Spiritual Heritage',
      dist: '3.2 km (10 mins drive)',
      hours: '06:00 AM - 08:00 PM',
      desc: 'Ancient stone temple architecture overlooking the ocean.',
      iconComponent: Building2,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#C6A15B]" />
            Explore Nearby & Local Attractions
          </h2>
          <p className="text-xs text-[#7C756B] font-medium">Handpicked local destinations around Grand Horizon Hotel</p>
        </div>

        <button
          onClick={() => setActivePlan(!activePlan)}
          className="bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#C6A15B]" />
          {activePlan ? 'Hide Itinerary' : 'Plan 4-Hour Tour'}
        </button>
      </div>

      {/* AI 4-Hour Itinerary Generator Box */}
      {activePlan && (
        <div className="bg-white text-[#24211E] rounded-3xl p-6 space-y-4 border border-[#C6A15B]/40 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="font-bold text-sm text-[#C6A15B] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> AI Personalized 4-Hour Tour Itinerary
            </h3>
            <span className="text-[10px] bg-[#FBF5E8] text-[#C6A15B] px-2.5 py-0.5 rounded-full border border-[#C6A15B]/30 font-bold">
              Optimal Schedule
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#7C756B]">
            <div className="bg-[#F8F5EF] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#C6A15B]">Hour 1:</span>
              <div>
                <strong className="text-[#171717]">Paradise Bay Beach Walk (0.8 km)</strong>
                <p className="text-[#7C756B] mt-0.5 font-medium">Stroll along the coastal promenade and take ocean photographs.</p>
              </div>
            </div>

            <div className="bg-[#F8F5EF] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#C6A15B]">Hour 2:</span>
              <div>
                <strong className="text-[#171717]">Historical Coastal Fort (2.5 km)</strong>
                <p className="text-[#7C756B] mt-0.5 font-medium">Explore the historic lighthouse and panoramic viewpoint.</p>
              </div>
            </div>

            <div className="bg-[#F8F5EF] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#C6A15B]">Hour 3:</span>
              <div>
                <strong className="text-[#171717]">Artisan Spice Bazaar Shopping</strong>
                <p className="text-[#7C756B] mt-0.5 font-medium">Browse local souvenirs, tea blends, and authentic snacks.</p>
              </div>
            </div>

            <div className="bg-[#F8F5EF] p-3 rounded-xl border border-[#E2E8F0] flex items-start gap-3">
              <span className="font-bold text-[#C6A15B]">Hour 4:</span>
              <div>
                <strong className="text-[#171717]">Return to Hotel & Refreshments</strong>
                <p className="text-[#7C756B] mt-0.5 font-medium">Return via hotel shuttle and enjoy tea at Skyline Cafe.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attractions.map((item) => {
          const IconComp = item.iconComponent;
          return (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-5 shadow-sm space-y-3 transition"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shadow-xs">
                  <IconComp className="w-6 h-6 text-[#C6A15B]" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F5EF] text-[#7C756B] border border-[#CBD5E1]">
                  {item.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#171717] text-base">{item.name}</h3>
                <p className="text-xs text-[#7C756B] mt-1 font-medium">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#7C756B]">
                <span className="flex items-center gap-1 text-[#171717] font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A15B]" /> {item.dist}
                </span>
                <span className="flex items-center gap-1 text-[#7C756B] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#C6A15B]" /> {item.hours}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
