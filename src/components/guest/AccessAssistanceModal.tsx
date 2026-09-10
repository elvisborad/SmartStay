'use client';

import { useState } from 'react';
import { KeyRound, ShieldAlert, X, CheckCircle2, Lock } from 'lucide-react';

interface AccessAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  onSubmitted: () => void;
}

export default function AccessAssistanceModal({
  isOpen,
  onClose,
  roomNumber,
  guestName,
  guestSessionId,
  onSubmitted,
}: AccessAssistanceModalProps) {
  const [issueType, setIssueType] = useState('Lost Room Keycard');
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
          title: `SECURITY ASSISTANCE: ${issueType}`,
          description: `Guest ${guestName} (Room ${roomNumber}) reported ${issueType}. Identity verification required before granting access.`,
          department: 'SECURITY',
          category: 'Access Assistance',
          priority: 'URGENT',
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
        }, 3000);
      }
    } catch (err) {
      console.error('Access assistance error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-[#172033] w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-[#DC2626]/40 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 flex items-center justify-center font-bold">
              <KeyRound className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#172033]">Secure Access Assistance</h3>
              <p className="text-xs text-[#526174] font-medium">Locked out or lost room keycard</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Alert Banner */}
        <div className="bg-[#FEF2F2] p-4 rounded-2xl border border-[#DC2626]/30 space-y-2 text-xs text-[#172033]">
          <div className="font-bold text-[#DC2626] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
            Hotel Security Protocol Notice
          </div>
          <p className="leading-relaxed font-medium">
            For guest safety, master keys are never dispatched automatically. A security duty officer will arrive at Room {roomNumber} to verify your photo ID before granting room entry.
          </p>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#172033]">Security Duty Officer Dispatched</h4>
            <p className="text-xs text-[#526174] font-medium">Officer Inspector Robert is en route to Room {roomNumber}. Please have your ID ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#526174] font-bold mb-1">Select Issue</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-3.5 py-2.5 text-[#172033]"
              >
                <option value="Lost Room Keycard">I lost my room keycard</option>
                <option value="Locked Out of Room">I am locked outside my room</option>
                <option value="Keycard Not Unlocking Door">Keycard is not unlocking the electronic lock</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Alerting Security...' : 'Request Identity Verification & Entry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
