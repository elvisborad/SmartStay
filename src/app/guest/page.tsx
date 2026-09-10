'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuestHeader from '@/components/guest/GuestHeader';
import AmenitiesCatalog from '@/components/guest/AmenitiesCatalog';
import RoomServiceMenu from '@/components/guest/RoomServiceMenu';
import RequestStatusTracker from '@/components/guest/RequestStatusTracker';
import AIChatDrawer from '@/components/guest/AIChatDrawer';
import IndoorNavigation from '@/components/guest/IndoorNavigation';
import LuggageTransferModal from '@/components/guest/LuggageTransferModal';
import AccessAssistanceModal from '@/components/guest/AccessAssistanceModal';
import RoomChangeModal from '@/components/guest/RoomChangeModal';
import RoomQRStandeeModal from '@/components/guest/RoomQRStandeeModal';
import TouristAttractions from '@/components/guest/TouristAttractions';
import { t } from '@/lib/i18n';
import {
  Sparkles,
  Wifi,
  CheckCircle2,
  Droplet,
  Bath,
  Utensils,
  Luggage,
  Wrench,
  MapPin,
  KeyRound,
  BedDouble,
  Compass,
  Zap,
  Sparkle,
} from 'lucide-react';

export default function GuestPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentLang, setLang] = useState('en');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal triggers
  const [showNav, setShowNav] = useState(false);
  const [showLuggage, setShowLuggage] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [showRoomChange, setShowRoomChange] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWifiAlert, setShowWifiAlert] = useState(false);
  const [waterSuccess, setWaterSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('smartstay_guest_session');
    if (!stored) {
      router.push('/scan');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setSession(parsed);

      // Verify active status immediately and every 4 seconds
      const checkSessionActive = async () => {
        if (!parsed?.id) return;
        try {
          const res = await fetch('/api/auth/verify-guest-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: parsed.id }),
          });
          const data = await res.json();
          if (!data.active) {
            localStorage.removeItem('smartstay_guest_session');
            alert('Your room session has ended. You have been checked out by Front Desk.');
            window.location.href = '/scan?status=checked_out';
          }
        } catch (e) {
          console.error('Session verify check error:', e);
        }
      };

      checkSessionActive();
      const interval = setInterval(checkSessionActive, 4000);
      return () => clearInterval(interval);
    } catch (e) {
      router.push('/scan');
    }
  }, [router]);

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('smartstay_lang', newLang);
  };

  if (!session) {
    return <div className="min-h-screen bg-[#F8F5EF] text-[#24211E] flex items-center justify-center font-bold">Verifying Room Session...</div>;
  }

  const handle1TapWater = async () => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Fresh Bottled Water Request (Set of 2)',
          description: `Guest ${session.guestName} requested 2 chilled drinking water bottles for Room ${session.roomNumber}`,
          department: 'HOUSEKEEPING',
          category: 'Water',
          priority: 'NORMAL',
          roomNumber: session.roomNumber,
          guestName: session.guestName,
          guestSessionId: session.id,
        }),
      });
      if (res.ok) {
        setWaterSuccess(true);
        setRefreshTrigger((prev) => prev + 1);
        setTimeout(() => setWaterSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#24211E] pb-24 font-sans selection:bg-[#C6A15B] selection:text-white">
      {/* Header */}
      <GuestHeader
        guestName={session.guestName}
        roomNumber={session.roomNumber}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAiChat={() => setIsAiOpen(true)}
        openQrModal={() => setShowQrModal(true)}
        currentLang={currentLang}
        setLang={handleLanguageChange}
      />

      <main className="max-w-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {waterSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold flex items-center gap-2 animate-bounce shadow-md">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            {t(currentLang, 'requestWater')} — Housekeeping is en route to Room {session.roomNumber}!
          </div>
        )}

        {/* TAB 1: HOME CONCIERGE HUB */}
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Banner Card */}
            <div className="bg-white text-[#24211E] rounded-3xl p-4 sm:p-6 shadow-md border border-[#E2E8F0] relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#8A6A2F] bg-[#FBF5E8] px-2.5 py-0.5 rounded-full border border-[#C6A15B]/40 inline-block">
                  Grand Horizon Hotel
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#171717] mt-1">
                  {t(currentLang, 'welcome')}, {session.guestName}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#7C756B]">
                  Room {session.roomNumber} • {t(currentLang, 'tagline')}
                </p>
              </div>

              <button
                onClick={() => setIsAiOpen(true)}
                className="bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition shadow-md shadow-[#171717]/20 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A15B]" /> {t(currentLang, 'askAi')}
              </button>
            </div>

            {/* Quick Service Action Buttons Grid */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-[#7C756B] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C6A15B]" /> {t(currentLang, 'instantServices')}
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                {/* Water Request */}
                <button
                  onClick={handle1TapWater}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Droplet className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'requestWater')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'waterSub')}</span>
                </button>

                {/* Towels Request */}
                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Bath className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'requestTowels')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'towelsSub')}</span>
                </button>

                {/* Room Cleaning */}
                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Sparkle className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'roomCleaning')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'cleaningSub')}</span>
                </button>

                {/* In-Room Dining */}
                <button
                  onClick={() => setActiveTab('dining')}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'orderFood')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'foodSub')}</span>
                </button>

                {/* Luggage Transfer */}
                <button
                  onClick={() => setShowLuggage(true)}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#8A6A2F] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Luggage className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#8A6A2F]">{t(currentLang, 'luggageTransfer')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'luggageSub')}</span>
                </button>

                {/* Maintenance */}
                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Wrench className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#2563EB]">{t(currentLang, 'maintenance')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'maintSub')}</span>
                </button>

                {/* Hotel Navigation */}
                <button
                  onClick={() => setShowNav(true)}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'navigation')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'navSub')}</span>
                </button>

                {/* Lost Key */}
                <button
                  onClick={() => setShowAccess(true)}
                  className="bg-white hover:bg-[#FEF2F2] border border-[#E2E8F0] hover:border-[#DC2626] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <KeyRound className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#DC2626]">{t(currentLang, 'lostKey')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'keySub')}</span>
                </button>

                {/* Room Change */}
                <button
                  onClick={() => setShowRoomChange(true)}
                  className="bg-white hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <BedDouble className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#2563EB]">{t(currentLang, 'roomChange')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'roomChangeSub')}</span>
                </button>

                {/* Wi-Fi Details */}
                <button
                  onClick={() => setShowWifiAlert(!showWifiAlert)}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Wifi className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'wifiDetails')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'wifiSub')}</span>
                </button>

                {/* Explore Nearby */}
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group col-span-2 sm:col-span-1"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5 text-[#C6A15B]" />
                  </div>
                  <div className="font-bold text-[#171717] text-xs group-hover:text-[#C6A15B]">{t(currentLang, 'exploreNearby')}</div>
                  <span className="text-[10px] text-[#7C756B] mt-1">{t(currentLang, 'exploreSub')}</span>
                </button>
              </div>
            </div>

            {/* Wi-Fi Info Card Alert */}
            {showWifiAlert && (
              <div className="bg-white text-[#24211E] rounded-3xl p-5 border border-[#C6A15B]/40 shadow-lg space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#C6A15B] flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> Guest Wi-Fi Credentials
                  </span>
                  <span className="bg-[#FBF5E8] text-[#8A6A2F] px-2 py-0.5 rounded text-[10px] font-mono border border-[#C6A15B]/30 font-bold">
                    High-Speed 5G
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[#7C756B] block text-[10px]">SSID Network</span>
                    <strong className="text-[#171717] text-sm">Hotel_Guest_WiFi</strong>
                  </div>
                  <div>
                    <span className="text-[#7C756B] block text-[10px]">Password</span>
                    <strong className="text-[#C6A15B] text-sm font-mono font-bold">Horizon2026!</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Navigation Preview Component */}
            {showNav && <IndoorNavigation roomNumber={session.roomNumber} onClose={() => setShowNav(false)} />}
          </div>
        )}

        {/* TAB 2: ROOM AMENITIES */}
        {activeTab === 'amenities' && (
          <AmenitiesCatalog
            roomNumber={session.roomNumber}
            guestName={session.guestName}
            guestSessionId={session.id}
            onRequestSubmitted={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {/* TAB 3: DINING MENU */}
        {activeTab === 'dining' && (
          <RoomServiceMenu
            roomNumber={session.roomNumber}
            guestName={session.guestName}
            guestSessionId={session.id}
            onOrderPlaced={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {/* TAB 4: EXPLORE NEARBY */}
        {activeTab === 'explore' && <TouristAttractions />}

        {/* TAB 5: MY REQUESTS */}
        {activeTab === 'tracker' && (
          <RequestStatusTracker roomNumber={session.roomNumber} key={refreshTrigger} />
        )}
      </main>

      {/* Floating AI Concierge Trigger */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 bg-[#171717] hover:bg-[#292724] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#C6A15B]/50 z-30 transition transform hover:scale-105"
      >
        <Sparkles className="w-6 h-6 text-[#C6A15B] animate-spin" />
        <span className="font-extrabold text-sm hidden md:inline">{t(currentLang, 'askAi')}</span>
      </button>

      {/* AI Chat Drawer Component */}
      <AIChatDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        roomNumber={session.roomNumber}
        guestName={session.guestName}
        guestSessionId={session.id}
        currentLang={currentLang}
        onActionTriggered={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Modals */}
      <LuggageTransferModal
        isOpen={showLuggage}
        onClose={() => setShowLuggage(false)}
        roomNumber={session.roomNumber}
        guestName={session.guestName}
        guestSessionId={session.id}
        onSubmitted={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <AccessAssistanceModal
        isOpen={showAccess}
        onClose={() => setShowAccess(false)}
        roomNumber={session.roomNumber}
        guestName={session.guestName}
        guestSessionId={session.id}
        onSubmitted={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <RoomChangeModal
        isOpen={showRoomChange}
        onClose={() => setShowRoomChange(false)}
        roomNumber={session.roomNumber}
        guestName={session.guestName}
        guestSessionId={session.id}
        onSubmitted={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <RoomQRStandeeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        initialRoomNumber={session.roomNumber}
        initialGuestName={session.guestName}
      />
    </div>
  );
}
