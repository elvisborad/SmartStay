'use client';

import { Hotel, LogOut, Wifi, Clock, Phone, Sparkles, Globe, QrCode, Home, Bell, Utensils, Compass, ClipboardList } from 'lucide-react';
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
    { code: 'en', name: 'English (UK)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
    { code: 'ko', name: '한국어' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'mr', name: 'મરાઠી (Marathi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  return (
    <header className="bg-white text-[#24211E] border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm font-sans">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#171717] flex items-center justify-center shadow-md shadow-[#171717]/20 border border-[#C6A15B]/40 shrink-0">
            <Hotel className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A15B]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-1.5 text-[#171717] truncate">
              SmartStay <span className="text-[10px] sm:text-[11px] bg-[#FBF5E8] text-[#C6A15B] font-bold px-2 py-0.5 rounded-full border border-[#C6A15B]/30 shrink-0">Room {roomNumber}</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[#7C756B] font-medium truncate">{t(currentLang, 'welcome')}, {guestName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Room QR Standee Button */}
          {openQrModal && (
            <button
              onClick={openQrModal}
              title="View Room QR Standee"
              className="hidden sm:flex items-center gap-1.5 bg-[#FBF5E8] hover:bg-[#F5EFE4] border border-[#C6A15B]/40 text-[#C6A15B] text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Room QR</span>
            </button>
          )}

          {/* Mobile-Friendly Compact Language Selector Dropdown */}
          <div className="relative flex items-center bg-[#F8F5EF] border border-[#CBD5E1] hover:border-[#C6A15B] rounded-xl px-2 py-1.5 text-[11px] sm:text-xs text-[#24211E] transition shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[#C6A15B] mr-1 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-[#24211E] font-bold focus:outline-none cursor-pointer pr-1 max-w-[85px] sm:max-w-none text-[11px] sm:text-xs truncate"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-white text-[#24211E]">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openAiChat}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition shadow-md shadow-[#171717]/20 shrink-0"
            title="Ask AI Concierge"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C6A15B]" />
            <span className="hidden sm:inline">{t(currentLang, 'askAi')}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 sm:p-2 text-[#7C756B] hover:text-[#171717] hover:bg-[#F5EFE4] rounded-xl transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-[#F5EFE4] border-y border-[#E2E8F0] px-2 py-1.5 text-[10px] sm:text-xs text-[#7C756B] font-semibold grid grid-cols-3 gap-1 text-center max-w-5xl mx-auto">
        <span className="flex items-center justify-center gap-1 truncate">
          <Wifi className="w-3 h-3 text-[#C6A15B] shrink-0" /> Guest_WiFi
        </span>
        <span className="flex items-center justify-center gap-1 truncate">
          <Clock className="w-3 h-3 text-[#D97706] shrink-0" /> 06:30-10:30
        </span>
        <span className="flex items-center justify-center gap-1 truncate">
          <Phone className="w-3 h-3 text-[#2563EB] shrink-0" /> Reception: 0
        </span>
      </div>

      {/* Mobile Touch Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 flex border-b border-[#E2E8F0] overflow-x-auto no-scrollbar bg-white scroll-smooth">
        <button
          onClick={() => setActiveTab('home')}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex-1 text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'home'
              ? 'border-[#C6A15B] text-[#C6A15B] bg-[#FBF5E8]'
              : 'border-transparent text-[#7C756B] hover:text-[#171717]'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>{t(currentLang, 'tabHome')}</span>
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex-1 text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'amenities'
              ? 'border-[#C6A15B] text-[#C6A15B] bg-[#FBF5E8]'
              : 'border-transparent text-[#7C756B] hover:text-[#171717]'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>{t(currentLang, 'tabAmenities')}</span>
        </button>
        <button
          onClick={() => setActiveTab('dining')}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex-1 text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'dining'
              ? 'border-[#C6A15B] text-[#C6A15B] bg-[#FBF5E8]'
              : 'border-transparent text-[#7C756B] hover:text-[#171717]'
          }`}
        >
          <Utensils className="w-4 h-4 shrink-0" />
          <span>{t(currentLang, 'tabDining')}</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex-1 text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'explore'
              ? 'border-[#C6A15B] text-[#C6A15B] bg-[#FBF5E8]'
              : 'border-transparent text-[#7C756B] hover:text-[#171717]'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>{t(currentLang, 'tabExplore')}</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex-1 text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'tracker'
              ? 'border-[#C6A15B] text-[#C6A15B] bg-[#FBF5E8]'
              : 'border-transparent text-[#7C756B] hover:text-[#171717]'
          }`}
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          <span>{t(currentLang, 'tabRequests')}</span>
        </button>
      </div>
    </header>
  );
}
