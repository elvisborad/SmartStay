'use client';

import { useState } from 'react';
import { Luggage, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface LuggageTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  onSubmitted: () => void;
}

export default function LuggageTransferModal({
  isOpen,
  onClose,
  roomNumber,
  guestName,
  guestSessionId,
  onSubmitted,
}: LuggageTransferModalProps) {
  const [currentLocation, setCurrentLocation] = useState(`Room ${roomNumber}`);
  const [destinationRoom, setDestinationRoom] = useState(`Room ${roomNumber}`);
  const [bagCount, setBagCount] = useState(2);
  const [notes, setNotes] = useState('2 large suitcases + 1 carry-on');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Luggage Transfer (${bagCount} Bags)`,
          description: `Transfer ${bagCount} bags from ${currentLocation} to ${destinationRoom}. Notes: ${notes}`,
          department: 'BELL_DESK',
          category: 'Luggage',
          priority: 'NORMAL',
          roomNumber,
          guestName,
          guestSessionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onSubmitted();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Luggage request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-[#172033] w-full max-w-lg rounded-3xl p-6 border border-[#E2E8F0] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FBF5E8] text-[#8A6A2F] border border-[#C9A45C]/30 flex items-center justify-center font-bold">
              <Luggage className="w-6 h-6 text-[#C9A45C]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#172033]">Bell Desk Luggage Transfer</h3>
              <p className="text-xs text-[#526174] font-medium">Request porter assistance for your bags</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#172033]">Luggage Request Dispatched!</h4>
            <p className="text-xs text-[#526174] font-medium">Bell desk porter has been assigned to Room {roomNumber}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#526174] font-bold mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-3.5 py-2.5 text-[#172033]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#526174] font-bold mb-1">Destination Location</label>
                <input
                  type="text"
                  value={destinationRoom}
                  onChange={(e) => setDestinationRoom(e.target.value)}
                  placeholder="e.g. Room 305 or Lobby"
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-3.5 py-2.5 text-[#172033]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#526174] font-bold mb-1">Number of Bags</label>
              <select
                value={bagCount}
                onChange={(e) => setBagCount(parseInt(e.target.value))}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-3.5 py-2.5 text-[#172033]"
              >
                <option value={1}>1 Bag</option>
                <option value={2}>2 Bags</option>
                <option value={3}>3 Bags</option>
                <option value={4}>4+ Bags</option>
              </select>
            </div>

            <div>
              <label className="block text-[#526174] font-bold mb-1">Bag Description / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl p-3 text-[#172033] h-20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C9A45C] hover:bg-[#8A6A2F] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? 'Dispatching Porter...' : 'Submit Luggage Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
