'use client';

import { Hotel, LogOut, Wifi, Clock, Phone, Sparkles, Globe, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

interface GuestHeaderProps {
  guestName: string;
  roomNumber: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAiChat: () => void;
  openQrModal?: () => void;
  currentLang: string;
  setLang: (lang: string) => void;
}

export default function GuestHeader({
  guestName,
  roomNumber,
  activeTab,
  setActiveTab,
  openAiChat,
  openQrModal,
  currentLang,
  setLang,
}: GuestHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('smartstay_guest_session');
    router.push('/scan');
  };

  const languages = [
    { code: 'en', name: '🇬🇧 English' },
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'fr', name: '🇫🇷 Français' },
    { code: 'de', name: '🇩🇪 Deutsch' },
    { code: 'ja', name: '🇯🇵 日本語' },
    { code: 'zh', name: '🇨🇳 中文' },
    { code: 'ar', name: '🇸🇦 العربية' },
    { code: 'ru', name: '🇷🇺 Русский' },
    { code: 'pt', name: '🇵🇹 Português' },
    { code: 'it', name: '🇮🇹 Italiano' },
    { code: 'ko', name: '🇰🇷 한국어' },
    { code: 'hi', name: '🇮🇳 हिंदी (Hindi)' },
    { code: 'gu', name: '🇮🇳 ગુજરાતી (Gujarati)' },
    { code: 'mr', name: '🇮🇳 मराठी (Marathi)' },
    { code: 'bn', name: '🇮🇳 বাংলা (Bengali)' },
    { code: 'ta', name: '🇮🇳 தமிழ் (Tamil)' },
    { code: 'te', name: '🇮🇳 తెలుగు (Telugu)' },
  ];

  return (
    <header className="bg-white text-[#172033] border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F9F91] flex items-center justify-center shadow-md shadow-[#0F9F91]/20 border border-[#0F9F91]/30">
            <Hotel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg leading-tight flex items-center gap-2 text-[#172033]">
              SmartStay <span className="text-[11px] bg-[#E8F7F5] text-[#0F9F91] font-bold px-2.5 py-0.5 rounded-full border border-[#0F9F91]/30">Room {roomNumber}</span>
            </h1>
            <p className="text-xs text-[#526174] font-medium">{t(currentLang, 'welcome')}, {guestName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room QR Standee Button */}
          {openQrModal && (
            <button
              onClick={openQrModal}
              title="View Room QR Standee"
              className="hidden sm:flex items-center gap-1.5 bg-[#E8F7F5] hover:bg-[#D8F2EE] border border-[#0F9F91]/30 text-[#0F9F91] text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Room QR</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#0F9F91] rounded-xl px-2.5 py-1.5 text-xs text-[#172033] transition shadow-sm">
            <Globe className="w-3.5 h-3.5 text-[#0F9F91] mr-1.5 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-[#172033] font-bold focus:outline-none cursor-pointer pr-1"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-white text-[#172033]">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openAiChat}
            className="flex items-center gap-1.5 bg-[#0F9F91] hover:bg-[#0B857A] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md shadow-[#0F9F91]/20"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{t(currentLang, 'askAi')}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-[#EEF4F7] border-t border-[#E2E8F0] px-4 py-2 text-xs text-[#526174] font-medium flex items-center justify-around max-w-5xl mx-auto overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1 shrink-0">
          <Wifi className="w-3.5 h-3.5 text-[#0F9F91]" /> Wi-Fi: Hotel_Guest_WiFi
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" /> Breakfast: 06:30 - 10:30 AM
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Phone className="w-3.5 h-3.5 text-[#2563EB]" /> Reception: Dial 0
        </span>
      </div>

      {/* Navigation Tabs translated */}
      <div className="max-w-5xl mx-auto px-4 flex border-t border-[#E2E8F0] overflow-x-auto no-scrollbar bg-white">
        <button
          onClick={() => setActiveTab('home')}
          className={`py-3 px-4 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'home'
              ? 'border-[#0F9F91] text-[#0F9F91] bg-[#E8F7F5]'
              : 'border-transparent text-[#526174] hover:text-[#172033]'
          }`}
        >
          {t(currentLang, 'tabHome')}
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`py-3 px-4 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'amenities'
              ? 'border-[#0F9F91] text-[#0F9F91] bg-[#E8F7F5]'
              : 'border-transparent text-[#526174] hover:text-[#172033]'
          }`}
        >
          {t(currentLang, 'tabAmenities')}
        </button>
        <button
          onClick={() => setActiveTab('dining')}
          className={`py-3 px-4 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'dining'
              ? 'border-[#0F9F91] text-[#0F9F91] bg-[#E8F7F5]'
              : 'border-transparent text-[#526174] hover:text-[#172033]'
          }`}
        >
          {t(currentLang, 'tabDining')}
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`py-3 px-4 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'explore'
              ? 'border-[#0F9F91] text-[#0F9F91] bg-[#E8F7F5]'
              : 'border-transparent text-[#526174] hover:text-[#172033]'
          }`}
        >
          {t(currentLang, 'tabExplore')}
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`py-3 px-4 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'tracker'
              ? 'border-[#0F9F91] text-[#0F9F91] bg-[#E8F7F5]'
              : 'border-transparent text-[#526174] hover:text-[#172033]'
          }`}
        >
          {t(currentLang, 'tabRequests')}
        </button>
      </div>
    </header>
  );
}
