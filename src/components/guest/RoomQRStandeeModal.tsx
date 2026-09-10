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
    if (initialRoomNumber) setRoomNumber(initialRoomNumber);
    if (initialGuestName) setGuestName(initialGuestName);
  }, [initialRoomNumber, initialGuestName]);

  // Fetch active guests from DB whenever modal opens to catch newly added guests
  useEffect(() => {
    if (isOpen) {
      fetch('/api/staff/guests')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.guests)) {
            setDynamicGuests(data.guests);
            // Auto select latest guest if matching current roomNumber
            const match = data.guests.find((g: any) => String(g.roomNumber) === String(roomNumber));
            if (match) {
              setGuestName(match.guestName);
            }
          }
        })
        .catch((err) => console.error('Error loading guests in QR modal:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/guest/login?room=${encodeURIComponent(roomNumber)}`
    : `http://localhost:3000/guest/login?room=${roomNumber}`;

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
    setRoomNumber(selectedRoom);
    const matched = dynamicGuests.find((g) => String(g.roomNumber) === String(selectedRoom));
    if (matched) {
      setGuestName(matched.guestName);
    } else if (selectedRoom === '204') {
      setGuestName('Alex Sharma');
    } else if (selectedRoom === '301') {
      setGuestName('Sarah Connor');
    } else {
      setGuestName('Valued Guest');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl space-y-3 sm:space-y-4 animate-fade-in relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0F9F91] flex items-center justify-center text-white shadow-sm shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#172033] leading-tight">
                {isStaffMode ? 'Printable Room QR Standee Generator' : `My Room Standee — Room ${roomNumber}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#526174]">In-room contactless QR entry for SmartStay Concierge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-lg transition shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Room Selector Input */}
        {isStaffMode && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-[#F8FAFC] p-2.5 sm:p-3 rounded-2xl border border-[#CBD5E1] shrink-0">
            <div>
              <label className="text-[11px] font-bold text-[#526174] block mb-1">Room Number:</label>
              <select
                value={roomNumber}
                onChange={(e) => handleRoomSelect(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#172033] font-bold focus:outline-none focus:border-[#0F9F91]"
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
              <label className="text-[11px] font-bold text-[#526174] block mb-1">Guest Name:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#172033] font-bold focus:outline-none focus:border-[#0F9F91]"
              />
            </div>
          </div>
        )}

        {/* Acrylic Standee Preview Card (Scrollable if height constrained) */}
        <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E8F7F5] border-2 border-[#0F9F91]/40 rounded-3xl p-3 sm:p-5 text-center space-y-2 sm:space-y-3 shadow-sm relative overflow-y-auto flex-1 min-h-0 no-scrollbar">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-[#0F9F91] uppercase tracking-widest">
            <Hotel className="w-3.5 h-3.5" /> Grand Horizon Hotel
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              Room {roomNumber}
            </div>
            <div className="text-xs font-semibold text-[#526174]">
              Guest: {guestName}
            </div>
          </div>

          {/* QR Image Box */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#CBD5E1] inline-block shadow-md my-0.5 sm:my-1">
            <img
              src={qrImageUrl}
              alt={`Room ${roomNumber} QR Code`}
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-contain"
            />
            <div className="text-[10px] text-[#8290A3] mt-1 font-mono">
              Token: #QR-{roomNumber}-SEC
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#172033] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0F9F91]" /> Point Smartphone Camera Here
            </p>
            <p className="text-[11px] text-[#526174] max-w-xs mx-auto">
              Scan for 1-tap room service, 24/7 AI Concierge, dining menu, & housekeeping in 17 languages.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 pt-1 sm:pt-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#172033] font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#526174]" />}
            {copied ? 'Copied!' : 'Copy Direct Link'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 bg-[#0F9F91] hover:bg-[#0B857A] text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#0F9F91]/20"
          >
            <Printer className="w-4 h-4" /> Print QR Standee
          </button>
        </div>
      </div>
    </div>
  );
}
