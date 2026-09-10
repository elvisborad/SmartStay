'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Hotel, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Printer, ExternalLink, Smartphone, Camera, CameraOff, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export default function QRScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedRoom, setScannedRoom] = useState<string | null>(null);
  const [selectedRoomQR, setSelectedRoomQR] = useState<'204' | '301'>('204');
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const roomsData = {
    '204': {
      roomNumber: '204',
      guestName: 'Alex Sharma',
      roomType: 'Deluxe King Suite',
      pin: '1234',
      url: typeof window !== 'undefined' ? `${window.location.origin}/guest/login?room=204&pin=1234` : 'http://localhost:3000/guest/login?room=204&pin=1234',
    },
    '301': {
      roomNumber: '301',
      guestName: 'Sarah Connor',
      roomType: 'Presidential Suite',
      pin: '3010',
      url: typeof window !== 'undefined' ? `${window.location.origin}/guest/login?room=301&pin=3010` : 'http://localhost:3000/guest/login?room=301&pin=3010',
    },
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanError(null);
    setScannedRoom(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser/device.');
      }

      // Try environment camera (back camera) first, fallback to user/facing camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to start playing before scanning frames
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message || 'Failed to open camera scanner.');
      }
      stopCamera();
    }
  };

  // Continuous frame scanner loop
  useEffect(() => {
    let active = true;

    const scanFrame = () => {
      if (!active || !cameraActive || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedQR(code.data);
            return; // stop scanning loop on successful decode
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive]);

  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const parseQRContent = (qrText: string): { roomNumber: string; pin: string } => {
    let roomNumber = '204';
    let pin = '1234';

    try {
      // 1. Try URL format: http://.../guest/login?room=204&pin=1234 or ?room=204
      if (qrText.includes('room=') || qrText.startsWith('http://') || qrText.startsWith('https://')) {
        const urlObj = new URL(qrText, window.location.origin);
        const rParam = urlObj.searchParams.get('room');
        const pParam = urlObj.searchParams.get('pin');
        if (rParam) roomNumber = rParam;
        if (pParam) pin = pParam;
        else if (rParam === '301') pin = '3010';
        else if (rParam === '204') pin = '1234';
      }
      // 2. Try JSON format: {"roomNumber":"204","pin":"1234"}
      else if (qrText.startsWith('{')) {
        const parsed = JSON.parse(qrText);
        if (parsed.roomNumber) roomNumber = parsed.roomNumber;
        if (parsed.pin) pin = parsed.pin;
      }
      // 3. Raw room string format e.g. "204", "301"
      else {
        const extracted = qrText.replace(/\D/g, '');
        if (extracted) {
          roomNumber = extracted;
          if (extracted === '301') pin = '3010';
          if (extracted === '204') pin = '1234';
        }
      }
    } catch (err) {
      console.warn('QR parse fallback:', err);
    }

    return { roomNumber, pin };
  };

  const handleDecodedQR = async (qrContent: string) => {
    stopCamera();
    setScanning(true);
    setScanError(null);

    const { roomNumber, pin } = parseQRContent(qrContent);
    await authenticateAndRedirect(roomNumber, pin);
  };

  const handleSimulateScan = async (roomNum: string, guestName: string, pin: string) => {
    stopCamera();
    setScanning(true);
    setScanError(null);
    setTimeout(async () => {
      await authenticateAndRedirect(roomNum, pin);
    }, 600);
  };

  const authenticateAndRedirect = async (roomNum: string, pin: string) => {
    setScannedRoom(roomNum);
    try {
      const res = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber: roomNum, pin }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        localStorage.setItem('smartstay_guest_session', JSON.stringify(data.session));
        localStorage.setItem('smartstay_hotel', JSON.stringify(data.hotel));
        setTimeout(() => {
          window.location.href = '/guest';
        }, 500);
      } else {
        setScannedRoom(null);
        setScanError(data.error || 'Failed to authenticate guest session');
      }
    } catch (err) {
      console.error('QR auth error:', err);
      setScanError('Network error verifying QR scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#24211E] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#C6A15B] selection:text-white">
      {/* Hidden canvas for image frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div className="text-center max-w-md mx-auto pt-4 space-y-2">
        <div className="w-12 h-12 bg-[#171717] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#171717]/20 border border-[#C6A15B]/40">
          <Hotel className="w-7 h-7 text-[#C6A15B]" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#171717]">SmartStay</h1>
        <p className="text-xs text-[#C6A15B] font-bold uppercase tracking-widest">
          One Scan. One Concierge. Everything You Need.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-[#E2E8F0]/70 rounded-xl text-xs font-semibold mt-2">
          <button
            onClick={() => {
              setActiveTab('scan');
            }}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-[#C6A15B] shadow-xs font-bold'
                : 'text-[#7C756B] hover:text-[#24211E]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Guest QR Scanner
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('generate');
            }}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'bg-white text-[#C6A15B] shadow-xs font-bold'
                : 'text-[#7C756B] hover:text-[#24211E]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Room QR Standees
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        /* Interactive QR Scanner Box */
        <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 my-4">
          {scanError && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold rounded-2xl text-center shadow-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {cameraError && (
            <div className="p-3.5 bg-[#FFFBEB] border border-[#F59E0B]/30 text-[#B45309] text-xs font-bold rounded-2xl text-center shadow-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#F59E0B]" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Scanner Viewport */}
          <div className="relative w-56 h-56 mx-auto bg-[#0F172A] rounded-2xl border-2 border-dashed border-[#0F9F91]/50 p-2 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
            {/* Live Camera Feed */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover rounded-xl ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Overlays */}
            {cameraActive && !scanning && !scannedRoom && (
              <>
                {/* Viewfinder Target Frame */}
                <div className="absolute inset-4 border-2 border-[#0F9F91] rounded-xl pointer-events-none opacity-80" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#0F9F91] shadow-[0_0_8px_#0F9F91] animate-pulse" />
                <span className="absolute bottom-2 inset-x-0 text-[10px] text-white bg-black/60 py-1 px-2 mx-auto w-max rounded-md font-medium">
                  Point camera at SmartStay QR Code
                </span>
              </>
            )}

            {scanning ? (
              <div className="flex flex-col items-center space-y-3 z-10 text-white">
                <Sparkles className="w-10 h-10 text-[#0F9F91] animate-spin" />
                <span className="text-xs text-[#0F9F91] font-bold">Verifying QR & Binding Session...</span>
              </div>
            ) : scannedRoom ? (
              <div
                onClick={() => { window.location.href = '/guest'; }}
                className="flex flex-col items-center space-y-2 text-[#16A34A] animate-bounce cursor-pointer z-10"
              >
                <CheckCircle2 className="w-12 h-12" />
                <span className="text-sm font-bold text-white">Room {scannedRoom} Verified!</span>
                <span className="text-[11px] text-[#0F9F91] font-extrabold underline">Click here to enter Portal -&gt;</span>
              </div>
            ) : !cameraActive ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <QrCode className="w-20 h-20 text-[#0F9F91] group-hover:scale-105 transition-transform" />
                <span className="text-xs text-[#94A3B8] mt-2 font-medium">
                  Camera inactive
                </span>
              </div>
            ) : null}
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center gap-3">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={scanning}
                className="w-full py-3 px-4 bg-[#171717] hover:bg-[#292724] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-[#171717]/20 border border-[#C6A15B]/40 disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-[#C6A15B]" /> Start Camera QR Scanner
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full py-3 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#172033]">Instant Contactless Entry</h2>
            <p className="text-xs text-[#526174] leading-relaxed">
              Scan the room or hotel QR code with your smartphone camera or use the quick simulation options below.
            </p>
          </div>

          {/* Demo QR Scanner Triggers */}
          <div className="space-y-2 text-left pt-2 border-t border-[#E2E8F0]">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Test Simulation:</span>
              <ShieldCheck className="w-4 h-4 text-[#0F9F91]" />
            </div>

            <button
              onClick={() => handleSimulateScan('204', 'Alex Sharma', '1234')}
              disabled={scanning}
              className="w-full p-3.5 bg-[#F8FAFC] hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] rounded-2xl transition flex items-center justify-between group disabled:opacity-50 text-xs text-[#172033] shadow-xs"
            >
              <div>
                <div className="font-bold text-[#172033] group-hover:text-[#0F9F91]">
                  Simulate Scan Room 204 (Alex Sharma)
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
                  Simulate Scan Suite 301 (Sarah Connor)
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
