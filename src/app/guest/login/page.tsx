'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hotel, QrCode, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

function GuestLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  useEffect(() => {
    // If QR code passed ?room=1001 or ?room=1001&pin=1234, perform instant QR token authentication
    if (roomParam) {
      const pinParam = searchParams.get('pin') || (roomParam === '301' ? '3010' : roomParam === '204' ? '1234' : '');
      handleQRAuth(roomParam, pinParam);
    }
  }, [roomParam, searchParams]);

  const handleQRAuth = async (room: string, passPin: string) => {
    setLoading(true);
    setError('');
    setAutoStatus(`Verifying QR Token for Room ${room}...`);
    try {
      const res = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber: room, pin: passPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('smartstay_guest_session', JSON.stringify(data.session));
        localStorage.setItem('smartstay_hotel', JSON.stringify(data.hotel));
        setTimeout(() => {
          router.push('/guest');
        }, 600);
      } else {
        setError(data.error || 'QR Token validation failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Welcome Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#0F9F91] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#0F9F91]/20">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#172033]">Grand Horizon Hotel</h1>
          <p className="text-xs text-[#0F9F91] font-bold flex items-center justify-center gap-1.5 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> SmartStay Contactless Guest Portal
          </p>
        </div>

        {/* Exclusive QR Entry Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-[#E8F7F5] rounded-3xl border-2 border-[#0F9F91]/30 flex items-center justify-center mx-auto text-[#0F9F91]">
            <QrCode className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#172033]">Contactless QR Entry Only</h2>
            <p className="text-xs text-[#526174] leading-relaxed font-medium">
              Guest access is exclusively granted via scanning the physical QR Code standee inside your hotel room. No password or manual login required.
            </p>
          </div>

          {autoStatus && (
            <div className="p-3.5 rounded-2xl bg-[#E8F7F5] border border-[#0F9F91]/30 text-[#0F9F91] text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-[#0F9F91]" />
              {autoStatus}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/scan')}
              className="w-full bg-[#0F9F91] hover:bg-[#0B857A] text-white font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#0F9F91]/25 text-sm"
            >
              <QrCode className="w-5 h-5" /> Open QR Scanner Portal
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Simulate Room 204 Instant QR */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-left">
              <p className="text-[11px] font-bold text-[#526174] uppercase tracking-wider flex items-center justify-between">
                <span>Simulate In-Room QR Code Scan:</span>
                <ShieldCheck className="w-4 h-4 text-[#0F9F91]" />
              </p>
              
              <button
                onClick={() => handleQRAuth('204', '1234')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] transition flex items-center justify-between text-xs group text-[#172033] shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#172033] group-hover:text-[#0F9F91]">
                    Scan Room 204 QR Code (Alex Sharma)
                  </div>
                  <div className="text-[11px] text-[#526174]">Deluxe King • Session #QR-204-SEC</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8290A3] group-hover:text-[#0F9F91] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => handleQRAuth('301', '3010')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] transition flex items-center justify-between text-xs group text-[#172033] shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#172033] group-hover:text-[#0F9F91]">
                    Scan Suite 301 QR Code (Sarah Connor)
                  </div>
                  <div className="text-[11px] text-[#526174]">Presidential Suite • Session #QR-301-SEC</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8290A3] group-hover:text-[#0F9F91] group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[#8290A3]">
          SmartStay • Encrypted Tokenized Guest Entry System
        </div>
      </div>
    </div>
  );
}

export default function GuestLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bold">Loading Guest Portal...</div>}>
      <GuestLoginContent />
    </Suspense>
  );
}
