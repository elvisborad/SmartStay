'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Bath, BedDouble, Shirt, Sparkle, Wind, Tv, PackagePlus, Send } from 'lucide-react';
import { t } from '@/lib/i18n';

interface AmenitiesCatalogProps {
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  currentLang?: string;
  onRequestSubmitted: () => void;
}

export default function AmenitiesCatalog({
  roomNumber,
  guestName,
  guestSessionId,
  currentLang = 'en',
  onRequestSubmitted,
}: AmenitiesCatalogProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');

  const quickItems = [
    {
      id: 'towels',
      title: 'Extra Plush Towels',
      dept: 'HOUSEKEEPING',
      category: 'Amenities',
      desc: 'Set of 2 extra bath towels delivered to room.',
      iconComponent: Bath,
      sla: '10 mins',
    },
    {
      id: 'pillow',
      title: 'Hypoallergenic Feather Pillow',
      dept: 'HOUSEKEEPING',
      category: 'Amenities',
      desc: 'Soft feather pillow for optimal rest.',
      iconComponent: BedDouble,
      sla: '10 mins',
    },
    {
      id: 'iron',
      title: 'Steam Iron & Pressing Board',
      dept: 'HOUSEKEEPING',
      category: 'Amenities',
      desc: 'Delivered directly to room door.',
      iconComponent: Shirt,
      sla: '15 mins',
    },
    {
      id: 'cleaning',
      title: 'Room Refresh & Maid Service',
      dept: 'HOUSEKEEPING',
      category: 'Housekeeping',
      desc: 'Full cleaning, linen change, and trash removal.',
      iconComponent: Sparkle,
      sla: '35 mins',
    },
    {
      id: 'ac',
      title: 'Air Conditioning Support',
      dept: 'MAINTENANCE',
      category: 'HVAC',
      desc: 'Thermostat adjustment or cooling issue.',
      iconComponent: Wind,
      sla: '20 mins',
    },
    {
      id: 'wifi',
      title: 'TV / Wi-Fi Technical Support',
      dept: 'MAINTENANCE',
      category: 'Tech Support',
      desc: 'Technician assistance for TV or internet.',
      iconComponent: Tv,
      sla: '15 mins',
    },
    {
      id: 'others',
      title: 'Others / Custom Item Request',
      dept: 'HOUSEKEEPING',
      category: 'Special Request',
      desc: 'Need slippers, extra blanket, dental kit, charger, or any other amenity? Type your request below.',
      iconComponent: PackagePlus,
      sla: '15 mins',
      isCustom: true,
    },
  ];

  const handleRequest = async (item: (typeof quickItems)[0], overrideText?: string) => {
    const finalDesc = item.isCustom
      ? (overrideText || customText.trim() || 'Custom Guest Request (Slippers / Amenities)')
      : item.desc;
    const finalTitle = item.isCustom
      ? `Custom Request: ${overrideText || customText.trim() || 'Special Item'}`
      : item.title;

    setSubmittingId(item.id);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: finalDesc,
          department: item.dept,
          category: item.category,
          priority: item.dept === 'MAINTENANCE' ? 'HIGH' : 'MEDIUM',
          roomNumber,
          guestName,
          guestSessionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${t(currentLang, finalTitle)} requested! Staff notified.`);
        if (item.isCustom) setCustomText('');
        onRequestSubmitted();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-sm font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          {successMsg}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-[#171717] mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C6A15B]" />
          {t(currentLang, 'Instant Room Services')}
        </h2>
        <p className="text-xs text-[#7C756B] font-medium">{t(currentLang, 'Tap any item below or request custom amenities directly to Room ')}{roomNumber}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickItems.map((item) => {
          const IconComp = item.iconComponent;
          if (item.isCustom) {
            return (
              <div
                key={item.id}
                className="bg-white border-2 border-[#C6A15B]/40 hover:border-[#C6A15B] rounded-2xl p-5 shadow-sm bg-gradient-to-br from-white to-[#FBF5E8]/30 transition-all flex flex-col justify-between col-span-1 sm:col-span-2 space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shadow-xs">
                      <IconComp className="w-6 h-6 text-[#C6A15B]" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#171717] text-[#C6A15B] uppercase border border-[#C6A15B]/30">
                      {item.dept}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#171717] text-base mb-0.5">{t(currentLang, item.title)}</h3>
                  <p className="text-xs text-[#7C756B] leading-relaxed mb-3">{t(currentLang, item.desc)}</p>

                  {/* Clean input box with Send Request button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={t(currentLang, 'Type your request (e.g. Slippers, Adapter, Extra Pillow)...')}
                      className="flex-1 bg-[#FFFFFF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl px-3.5 py-2.5 text-xs text-[#24211E] font-medium outline-none shadow-xs"
                    />
                    <button
                      onClick={() => handleRequest(item)}
                      disabled={submittingId === item.id || !customText.trim()}
                      className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/40 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-4 h-4 text-[#C6A15B]" />
                      {submittingId === item.id ? t(currentLang, 'Sending...') : t(currentLang, 'Send Request')}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#7C756B]">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#C6A15B]" /> SLA ~{item.sla}
                  </span>
                  <span className="text-[11px] text-[#7C756B] italic">Dispatched directly to Room {roomNumber}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-5 shadow-sm hover:bg-[#FBF5E8]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shadow-xs">
                    <IconComp className="w-6 h-6 text-[#C6A15B]" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F5EF] text-[#7C756B] uppercase border border-[#CBD5E1]">
                    {item.dept}
                  </span>
                </div>
                <h3 className="font-bold text-[#171717] text-base mb-1">{t(currentLang, item.title)}</h3>
                <p className="text-xs text-[#7C756B] leading-relaxed mb-4">{t(currentLang, item.desc)}</p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#7C756B] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#C6A15B]" /> SLA ~{item.sla}
                </span>

                <button
                  onClick={() => handleRequest(item)}
                  disabled={submittingId === item.id}
                  className="bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 disabled:bg-[#CBD5E1]"
                >
                  {submittingId === item.id ? t(currentLang, 'Sending...') : t(currentLang, 'Request Now')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
