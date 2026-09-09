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
import { Sparkles, Wifi, CheckCircle2 } from 'lucide-react';

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
      setSession(JSON.parse(stored));
    } catch (e) {
      router.push('/scan');
    }
  }, [router]);

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('smartstay_lang', newLang);
  };

  if (!session) {
    return <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex items-center justify-center font-bold">Verifying Room Session...</div>;
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] pb-24">
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

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {waterSuccess && (
          <div className="p-4 rounded-2xl bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold flex items-center gap-2 animate-bounce shadow-md">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            ✅ {t(currentLang, 'requestWater')} - Housekeeping is en route to Room {session.roomNumber}!
          </div>
        )}

        {/* TAB 1: HOME CONCIERGE HUB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Banner Card */}
            <div className="bg-white text-[#172033] rounded-3xl p-6 shadow-md border border-[#E2E8F0] relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8A6A2F] bg-[#FBF5E8] px-3 py-1 rounded-full border border-[#C9A45C]/40">
                  Grand Horizon Hotel
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#172033] mt-1">
                  {t(currentLang, 'welcome')}, {session.guestName}
                </h2>
                <p className="text-xs text-[#526174]">
                  Room {session.roomNumber} • {t(currentLang, 'tagline')}
                </p>
              </div>

              <button
                onClick={() => setIsAiOpen(true)}
                className="bg-[#0F9F91] hover:bg-[#0B857A] text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition shadow-md shadow-[#0F9F91]/20 flex items-center gap-2.5 self-start md:self-auto shrink-0"
              >
                <Sparkles className="w-5 h-5" /> {t(currentLang, 'askAi')}
              </button>
            </div>

            {/* Quick Service Action Buttons Grid translated */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#526174] uppercase tracking-wider">
                {t(currentLang, 'instantServices')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <button
                  onClick={handle1TapWater}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">💧</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'requestWater')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'waterSub')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🧴</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'requestTowels')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'towelsSub')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🧹</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'roomCleaning')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'cleaningSub')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('dining')}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🍽️</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'orderFood')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'foodSub')}</span>
                </button>

                <button
                  onClick={() => setShowLuggage(true)}
                  className="bg-white hover:bg-[#FBF5E8] border border-[#E2E8F0] hover:border-[#C9A45C] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🧳</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#8A6A2F]">{t(currentLang, 'luggageTransfer')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'luggageSub')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('amenities')}
                  className="bg-white hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🔧</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#2563EB]">{t(currentLang, 'maintenance')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'maintSub')}</span>
                </button>

                <button
                  onClick={() => setShowNav(true)}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">📍</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'navigation')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'navSub')}</span>
                </button>

                <button
                  onClick={() => setShowAccess(true)}
                  className="bg-white hover:bg-[#FEF2F2] border border-[#E2E8F0] hover:border-[#DC2626] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🗝️</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#DC2626]">{t(currentLang, 'lostKey')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'keySub')}</span>
                </button>

                <button
                  onClick={() => setShowRoomChange(true)}
                  className="bg-white hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">🛏️</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#2563EB]">{t(currentLang, 'roomChange')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'roomChangeSub')}</span>
                </button>

                <button
                  onClick={() => setShowWifiAlert(!showWifiAlert)}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group"
                >
                  <span className="text-2xl mb-2">📶</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'wifiDetails')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'wifiSub')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-white hover:bg-[#E8F7F5] border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-4 text-left shadow-sm transition flex flex-col justify-between group col-span-2 sm:col-span-1"
                >
                  <span className="text-2xl mb-2">🌍</span>
                  <div className="font-bold text-[#172033] text-xs group-hover:text-[#0F9F91]">{t(currentLang, 'exploreNearby')}</div>
                  <span className="text-[10px] text-[#526174] mt-1">{t(currentLang, 'exploreSub')}</span>
                </button>
              </div>
            </div>

            {/* Wi-Fi Info Card Alert */}
            {showWifiAlert && (
              <div className="bg-white text-[#172033] rounded-3xl p-5 border border-[#0F9F91]/40 shadow-lg space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F9F91] flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> Guest Wi-Fi Credentials
                  </span>
                  <span className="bg-[#E8F7F5] text-[#0F9F91] px-2 py-0.5 rounded text-[10px] font-mono border border-[#0F9F91]/30 font-bold">
                    High-Speed 5G
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[#526174] block text-[10px]">SSID Network</span>
                    <strong className="text-[#172033] text-sm">Hotel_Guest_WiFi</strong>
                  </div>
                  <div>
                    <span className="text-[#526174] block text-[10px]">Password</span>
                    <strong className="text-[#0F9F91] text-sm font-mono font-bold">Horizon2026!</strong>
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
        className="fixed bottom-6 right-6 bg-[#0F9F91] hover:bg-[#0B857A] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white z-30 transition transform hover:scale-105"
      >
        <Sparkles className="w-6 h-6 animate-spin" />
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
