'use client';

import { useState } from 'react';
import { BedDouble, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface RoomChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  onSubmitted: () => void;
}

export default function RoomChangeModal({
  isOpen,
  onClose,
  roomNumber,
  guestName,
  guestSessionId,
  onSubmitted,
}: RoomChangeModalProps) {
  const [reason, setReason] = useState('AC Cooling Issue');
  const [notes, setNotes] = useState('Would prefer a room on a higher floor or away from elevator.');
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
          title: `ROOM CHANGE REQUEST: ${reason}`,
          description: `Guest ${guestName} (Room ${roomNumber}) requested room change. Reason: ${reason}. Notes: ${notes}`,
          department: 'FRONT_DESK',
          category: 'Room Change',
          priority: 'HIGH',
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
        }, 2500);
      }
    } catch (err) {
      console.error('Room change error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-[#172033] w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/30 flex items-center justify-center font-bold">
              <BedDouble className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#172033]">Room Change Request</h3>
              <p className="text-xs text-[#526174] font-medium">Front Desk Manager Approval Workflow</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#172033]">Room Change Request Submitted</h4>
            <p className="text-xs text-[#526174] font-medium">Front desk manager is reviewing available rooms for Room {roomNumber}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#526174] font-bold mb-1">Primary Reason for Change</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-3.5 py-2.5 text-[#172033]"
              >
                <option value="AC Cooling Issue">Air Conditioning / Cooling issue</option>
                <option value="Noise Disturbances">Noise disturbance from hallway/street</option>
                <option value="Maintenance Issue">Maintenance / Plumbing issue</option>
                <option value="Accessibility Needs">Accessibility / Elevator proximity requirement</option>
                <option value="Preference & Upgrade">Personal preference / Suite upgrade query</option>
              </select>
            </div>

            <div>
              <label className="block text-[#526174] font-bold mb-1">Room Preferences & Details</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl p-3 text-[#172033] h-20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Request...' : 'Submit Room Change Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
