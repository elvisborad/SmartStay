'use client';

import { useState, useEffect } from 'react';
import { QrCode, X, Printer, Copy, Check, Hotel, Sparkles } from 'lucide-react';

interface RoomQRStandeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomNumber?: string;
  initialGuestName?: string;
  isStaffMode?: boolean;
  guestsList?: any[];
}

export default function RoomQRStandeeModal({
  isOpen,
  onClose,
  initialRoomNumber = '204',
  initialGuestName = 'Alex Sharma',
  isStaffMode = false,
  guestsList = [],
}: RoomQRStandeeModalProps) {
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber);
  const [guestName, setGuestName] = useState(initialGuestName);
  const [copied, setCopied] = useState(false);
  const [dynamicGuests, setDynamicGuests] = useState<any[]>(guestsList);

  // Sync state when initial props or guestsList update
  useEffect(() => {
    if (Array.isArray(guestsList) && guestsList.length > 0) {
      setDynamicGuests(guestsList);
    }
  }, [guestsList]);

  // Fetch active guests from DB whenever modal opens to catch newly added guests
  useEffect(() => {
    if (isOpen) {
      fetch('/api/staff/guests')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.guests) && data.guests.length > 0) {
            setDynamicGuests(data.guests);
            // Check if current roomNumber is present in loaded active guests
            const match = data.guests.find(
              (g: any) => String(g.roomNumber).trim() === String(roomNumber).trim()
            );
            if (match) {
              setRoomNumber(String(match.roomNumber).trim());
              setGuestName(match.guestName);
            } else {
              // Default to the first available active guest in the list
              const first = data.guests[0];
              setRoomNumber(String(first.roomNumber).trim());
              setGuestName(first.guestName);
            }
          }
        })
        .catch((err) => console.error('Error loading guests in QR modal:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPin = dynamicGuests.find(g => String(g.roomNumber) === String(roomNumber) && g.active)?.pin || '1234';
  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/guest/login?room=${encodeURIComponent(roomNumber)}&pin=${encodeURIComponent(currentPin)}`
    : `http://localhost:3000/guest/login?room=${roomNumber}&pin=${currentPin}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(roomUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRoomSelect = (selectedRoom: string) => {
    const cleanRoom = String(selectedRoom).trim();
    setRoomNumber(cleanRoom);
    const matched = dynamicGuests.find((g) => String(g.roomNumber).trim() === cleanRoom);
    if (matched) {
      setGuestName(matched.guestName);
    } else if (cleanRoom === '204') {
      setGuestName('Alex Sharma');
    } else if (cleanRoom === '301') {
      setGuestName('Sarah Connor');
    } else {
      setGuestName('Valued Guest');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-3xl p-4 sm:p-6 max-w-md w-full border border-[#E5DFD5] shadow-2xl space-y-3 sm:space-y-4 animate-fade-in relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#171717] border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B] shadow-sm shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#24211E] leading-tight">
                {isStaffMode ? 'Printable Room QR Standee Generator' : `My Room Standee — Room ${roomNumber}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7C756B]">In-room contactless QR entry for SmartStay Concierge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C756B] hover:text-[#24211E] hover:bg-[#F8F5EF] rounded-lg transition shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Room Selector Input */}
        {isStaffMode && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-[#F8F5EF] p-2.5 sm:p-3 rounded-2xl border border-[#E5DFD5] shrink-0">
            <div>
              <label className="text-[11px] font-bold text-[#7C756B] block mb-1">Room Number:</label>
              <select
                value={roomNumber}
                onChange={(e) => handleRoomSelect(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5 text-xs text-[#24211E] font-bold focus:outline-none focus:border-[#C6A15B]"
              >
                {dynamicGuests && dynamicGuests.length > 0 ? (
                  dynamicGuests.map((g) => (
                    <option key={g.id} value={g.roomNumber}>
                      Room {g.roomNumber} ({g.guestName}) {g.active ? '' : '[Checked Out]'}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="204">Room 204 (Alex Sharma)</option>
                    <option value="301">Suite 301 (Sarah Connor)</option>
                    <option value="101">Room 101 (Executive Twin)</option>
                    <option value="405">Room 405 (Ocean Suite)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#7C756B] block mb-1">Guest Name:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5 text-xs text-[#24211E] font-bold focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>
        )}

        {/* Acrylic Standee Preview Card */}
        <div className="bg-gradient-to-b from-[#F8F5EF] to-[#FFFFFF] border-2 border-[#C6A15B]/40 rounded-3xl p-3 sm:p-5 text-center space-y-2 sm:space-y-3 shadow-sm relative overflow-y-auto flex-1 min-h-0 no-scrollbar">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-[#C6A15B] uppercase tracking-widest">
            <img src="/logo.png" alt="SmartStay Logo" className="w-5 h-5 object-contain rounded-md" /> Grand Horizon Hotel
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#24211E] tracking-tight">
              Room {roomNumber}
            </div>
            <div className="text-xs font-semibold text-[#7C756B]">
              Guest: {guestName}
            </div>
          </div>

          {/* QR Image Box */}
          <div className="bg-[#FFFFFF] p-2.5 sm:p-3 rounded-2xl border border-[#E5DFD5] inline-block shadow-md my-0.5 sm:my-1">
            <img
              src={qrImageUrl}
              alt={`Room ${roomNumber} QR Code`}
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-contain"
            />
            <div className="text-[10px] text-[#7C756B] mt-1 font-mono">
              Token: #QR-{roomNumber}-SEC
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#24211E] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" /> Point Smartphone Camera Here
            </p>
            <p className="text-[11px] text-[#7C756B] max-w-xs mx-auto font-medium">
              Scan for 1-tap room service, 24/7 AI Concierge, dining menu, & housekeeping in 17 languages.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 pt-1 sm:pt-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[#F8F5EF] hover:bg-[#E5DFD5] border border-[#E5DFD5] text-[#24211E] font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#7C756B]" />}
            {copied ? 'Copied!' : 'Copy Direct Link'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/30 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#171717]/10"
          >
            <Printer className="w-4 h-4 text-[#C6A15B]" /> Print QR Standee
          </button>
        </div>
      </div>
    </div>
  );
}
