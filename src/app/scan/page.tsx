'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Hotel, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Printer, ExternalLink, Smartphone } from 'lucide-react';

export default function QRScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedRoom, setScannedRoom] = useState<string | null>(null);
  const [selectedRoomQR, setSelectedRoomQR] = useState<'204' | '301'>('204');
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');

  const roomsData = {
    '204': {
      roomNumber: '204',
      guestName: 'Alex Sharma',
      roomType: 'Deluxe King Suite',
      pin: '1234',
      url: typeof window !== 'undefined' ? `${window.location.origin}/guest/login?room=204` : 'http://localhost:3000/guest/login?room=204',
    },
    '301': {
      roomNumber: '301',
      guestName: 'Sarah Connor',
      roomType: 'Presidential Suite',
      pin: '3010',
      url: typeof window !== 'undefined' ? `${window.location.origin}/guest/login?room=301` : 'http://localhost:3000/guest/login?room=301',
    },
  };

  const handleSimulateScan = (roomNum: string, guestName: string, pin: string) => {
    setScanning(true);
    setTimeout(async () => {
      setScannedRoom(roomNum);
      try {
        const res = await fetch('/api/auth/guest-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomNumber: roomNum, pin }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('smartstay_guest_session', JSON.stringify(data.session));
          localStorage.setItem('smartstay_hotel', JSON.stringify(data.hotel));
          setTimeout(() => {
            router.push('/guest');
          }, 800);
        }
      } catch (err) {
        console.error('QR auth error:', err);
      } finally {
        setScanning(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#0F9F91] selection:text-white">
      {/* Top Header */}
      <div className="text-center max-w-md mx-auto pt-4 space-y-2">
        <div className="w-12 h-12 bg-[#0F9F91] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#0F9F91]/20 border border-[#0F9F91]/30">
          <Hotel className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#172033]">SmartStay</h1>
        <p className="text-xs text-[#0F9F91] font-bold uppercase tracking-widest">
          One Scan. One Concierge. Everything You Need.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-[#E2E8F0]/70 rounded-xl text-xs font-semibold mt-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-[#0F9F91] shadow-xs font-bold'
                : 'text-[#526174] hover:text-[#172033]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Simulate QR Scan
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'bg-white text-[#0F9F91] shadow-xs font-bold'
                : 'text-[#526174] hover:text-[#172033]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Room QR Standees
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        /* Interactive QR Scanner Box */
        <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 my-4">
          <div className="relative w-48 h-48 mx-auto bg-[#F1F5F9] rounded-2xl border-2 border-dashed border-[#0F9F91]/40 p-4 flex flex-col items-center justify-center overflow-hidden group">
            {scanning ? (
              <div className="flex flex-col items-center space-y-3">
                <Sparkles className="w-10 h-10 text-[#0F9F91] animate-spin" />
                <span className="text-xs text-[#0F9F91] font-bold">Scanning QR & Binding Session...</span>
              </div>
            ) : scannedRoom ? (
              <div className="flex flex-col items-center space-y-2 text-[#16A34A] animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
                <span className="text-sm font-bold">Room {scannedRoom} Verified!</span>
              </div>
            ) : (
              <>
                <QrCode className="w-24 h-24 text-[#0F9F91] group-hover:scale-110 transition-transform" />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#0F9F91] to-transparent animate-pulse" />
                <span className="text-[11px] text-[#526174] mt-2 font-medium">Point camera at Hotel QR Code</span>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#172033]">Instant Contactless Entry</h2>
            <p className="text-xs text-[#526174] leading-relaxed">
              No app download required. Scan the room or hotel QR code to access your personalized digital concierge immediately.
            </p>
          </div>

          {/* Demo QR Scanner Triggers */}
          <div className="space-y-2 text-left pt-2 border-t border-[#E2E8F0]">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Click to Simulate QR Scanning:</span>
              <ShieldCheck className="w-4 h-4 text-[#0F9F91]" />
            </div>

            <button
              onClick={() => handleSimulateScan('204', 'Alex Sharma', '1234')}
              disabled={scanning}
              className="w-full p-3.5 bg-[#F8FAFC] hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] rounded-2xl transition flex items-center justify-between group disabled:opacity-50 text-xs text-[#172033] shadow-xs"
            >
              <div>
                <div className="font-bold text-[#172033] group-hover:text-[#0F9F91]">
                  Scan Room 204 QR Code (Alex Sharma)
                </div>
                <div className="text-[11px] text-[#526174]">Deluxe King • Session Token #QR-204-SEC</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8290A3] group-hover:text-[#0F9F91] group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleSimulateScan('301', 'Sarah Connor', '3010')}
              disabled={scanning}
              className="w-full p-3.5 bg-[#F8FAFC] hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] rounded-2xl transition flex items-center justify-between group disabled:opacity-50 text-xs text-[#172033] shadow-xs"
            >
              <div>
                <div className="font-bold text-[#172033] group-hover:text-[#0F9F91]">
                  Scan Suite 301 QR Code (Sarah Connor)
                </div>
                <div className="text-[11px] text-[#526174]">Presidential Suite • Session Token #QR-301-SEC</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8290A3] group-hover:text-[#0F9F91] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      ) : (
        /* Printable Room QR Standee View */
        <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-5 my-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#172033]">In-Room Printable QR Standee</h2>
              <p className="text-xs text-[#526174]">Display on nightstand, desk, or keycard holder</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedRoomQR('204')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedRoomQR === '204'
                    ? 'bg-[#0F9F91] text-white'
                    : 'bg-[#F1F5F9] text-[#526174] hover:bg-[#E2E8F0]'
                }`}
              >
                Room 204
              </button>
              <button
                onClick={() => setSelectedRoomQR('301')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedRoomQR === '301'
                    ? 'bg-[#0F9F91] text-white'
                    : 'bg-[#F1F5F9] text-[#526174] hover:bg-[#E2E8F0]'
                }`}
              >
                Suite 301
              </button>
            </div>
          </div>

          {/* Printable Acrylic Standee Card Mockup */}
          <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E8F7F5]/50 border-2 border-[#0F9F91]/30 rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-extrabold text-[#0F9F91] uppercase tracking-widest">
              Grand Horizon Hotel Concierge
            </div>
            
            <div>
              <div className="text-2xl font-black text-[#172033]">
                Room {roomsData[selectedRoomQR].roomNumber}
              </div>
              <div className="text-xs font-semibold text-[#526174]">
                Guest: {roomsData[selectedRoomQR].guestName} ({roomsData[selectedRoomQR].roomType})
              </div>
            </div>

            {/* Generated QR Image */}
            <div className="bg-white p-4 rounded-2xl border border-[#CBD5E1] inline-block shadow-md my-2 relative group">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  roomsData[selectedRoomQR].url
                )}`}
                alt={`Room ${roomsData[selectedRoomQR].roomNumber} QR Code`}
                className="w-44 h-44 mx-auto object-contain"
                onError={(e) => {
                  // Fallback if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-[10px] text-[#8290A3] mt-1 font-mono">
                PIN: {roomsData[selectedRoomQR].pin}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-[#172033]">
                Scan with Smartphone Camera
              </p>
              <p className="text-[11px] text-[#526174] max-w-xs mx-auto">
                Instant access to 1-tap room requests, 24/7 AI Concierge, food ordering, & housekeeping in 17 languages.
              </p>
            </div>

            <div className="pt-2 border-t border-[#0F9F91]/20 flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#172033] font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#0F9F91]" /> Print Standee
              </button>
              <button
                onClick={() => handleSimulateScan(roomsData[selectedRoomQR].roomNumber, roomsData[selectedRoomQR].guestName, roomsData[selectedRoomQR].pin)}
                className="bg-[#0F9F91] hover:bg-[#0B857A] text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Open Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-[#8290A3] py-2">
        SmartStay • SIH 2026 QR Entry System • Secure Tokenization
      </div>
    </div>
  );
}
