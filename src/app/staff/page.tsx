'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Hotel,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Play,
  CheckSquare,
  ArrowLeft,
  QrCode,
  Lock,
  LogOut,
  UserCheck,
  KeyRound,
  UserPlus,
  UserMinus,
  Users,
  X,
  Plus,
  Truck,
  Sparkles,
} from 'lucide-react';
import RoomQRStandeeModal from '@/components/guest/RoomQRStandeeModal';

export default function StaffDashboardPage() {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [tickets, setTickets] = useState<any[]>([]);
  const [staffUser, setStaffUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [mobileKanbanTab, setMobileKanbanTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Staff Login Form state
  const [emailInput, setEmailInput] = useState('maria.garcia@grandhorizon.com');
  const [passwordInput, setPasswordInput] = useState('staff123');
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Guest Management Modal State
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestsList, setGuestsList] = useState<any[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestSuccessMsg, setGuestSuccessMsg] = useState('');
  const [guestErrorMsg, setGuestErrorMsg] = useState('');

  // Add Guest Form State
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRoom, setNewGuestRoom] = useState('101');
  const [newGuestPin, setNewGuestPin] = useState('1234');
  const [newGuestCheckout, setNewGuestCheckout] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [addingGuest, setAddingGuest] = useState(false);

  useEffect(() => {
    // Check saved staff session
    const savedStaff = localStorage.getItem('smartstay_staff');
    if (savedStaff) {
      try {
        setStaffUser(JSON.parse(savedStaff));
      } catch (e) {
        console.error('Failed to parse saved staff session:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (staffUser) {
      fetchTickets();
      fetchGuestsList();
      const interval = setInterval(fetchTickets, 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [selectedDept, staffUser]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?department=${selectedDept}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch staff tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestsList = async () => {
    setGuestsLoading(true);
    try {
      const res = await fetch('/api/staff/guests');
      const data = await res.json();
      if (data.guests) {
        setGuestsList(data.guests);
      }
    } catch (err) {
      console.error('Failed to fetch guest list:', err);
    } finally {
      setGuestsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();
      if (data.success && data.staff) {
        setStaffUser(data.staff);
        localStorage.setItem('smartstay_staff', JSON.stringify(data.staff));
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login request error:', err);
      setLoginError('Network error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setStaffUser(null);
    localStorage.removeItem('smartstay_staff');
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
  };

  const handleUpdateTicket = async (ticketId: string, status: string, notes?: string) => {
    if (!staffUser) return;
    setUpdatingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedStaffId: staffUser.id,
          notes: notes || `Status updated to ${status} by ${staffUser.name}`,
          performedBy: staffUser.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchTickets();
      } else {
        alert(data.error || 'Failed to update ticket status');
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newGuestRoom) return;

    setAddingGuest(true);
    setGuestErrorMsg('');
    setGuestSuccessMsg('');

    try {
      const res = await fetch('/api/staff/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: newGuestName,
          roomNumber: newGuestRoom,
          pin: newGuestPin || '1234',
          checkOutDate: newGuestCheckout,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGuestSuccessMsg(`✅ Guest "${newGuestName}" added to Room ${newGuestRoom}!`);
        setNewGuestName('');
        setShowAddGuestForm(false);
        fetchGuestsList();
      } else {
        setGuestErrorMsg(data.error || 'Failed to add guest');
      }
    } catch (err) {
      console.error('Error adding guest:', err);
      setGuestErrorMsg('Network error adding guest');
    } finally {
      setAddingGuest(false);
    }
  };

  const handleRemoveGuest = async (guestId: string, guestName: string, roomNumber: string) => {
    if (!confirm(`Are you sure you want to check out and remove guest ${guestName} from Room ${roomNumber}?`)) {
      return;
    }

    setGuestErrorMsg('');
    setGuestSuccessMsg('');
    try {
      const res = await fetch(`/api/staff/guests?id=${guestId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setGuestSuccessMsg(`✅ Guest "${guestName}" checked out from Room ${roomNumber}.`);
        fetchGuestsList();
      } else {
        setGuestErrorMsg(data.error || 'Failed to remove guest');
      }
    } catch (err) {
      console.error('Error removing guest:', err);
      setGuestErrorMsg('Network error removing guest');
    }
  };

  const departments = [
    'ALL',
    'HOUSEKEEPING',
    'MAINTENANCE',
    'KITCHEN',
    'LAUNDRY',
    'BELL_DESK',
    'FRONT_DESK',
    'SECURITY',
  ];

  // If not logged in, render Staff Login Screen
  if (!staffUser) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] text-[#24211E] flex flex-col justify-between selection:bg-[#C6A15B] selection:text-white">
        <header className="border-b border-[#E5DFD5] bg-[#FFFFFF]/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-[#7C756B] hover:text-[#24211E] hover:bg-[#F8F5EF] rounded-xl transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#C6A15B]/40 flex items-center justify-center shadow-md p-1">
                <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#24211E]">SmartStay Staff Portal</h1>
                <p className="text-xs text-[#7C756B] font-medium">Grand Horizon Hotel • Authentication</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-12">
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-3xl p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-[#C6A15B]/40 text-[#C6A15B] flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#24211E]">Staff Authentication</h2>
              <p className="text-xs text-[#7C756B] font-medium">Enter your credentials set by your Administrator</p>
            </div>

            {loginError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-xl text-xs font-bold text-[#DC2626] text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24211E] mb-1.5">Staff Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. maria.garcia@grandhorizon.com"
                  className="w-full bg-[#F8F5EF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl px-4 py-3 text-sm text-[#24211E] outline-none transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24211E] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter staff password"
                    className="w-full bg-[#F8F5EF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl px-4 py-3 text-sm text-[#24211E] outline-none transition font-medium pr-10"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-[#7C756B] absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-sm py-3.5 rounded-xl transition border border-[#C6A15B]/30 shadow-lg shadow-[#171717]/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4 text-[#C6A15B]" />
                {authenticating ? 'Authenticating...' : 'Sign In to Operations'}
              </button>
            </form>

            <div className="pt-4 border-t border-[#E5DFD5] space-y-3">
              <div className="text-[11px] font-bold text-[#7C756B] uppercase tracking-wider text-center">
                Demo Presets (Default Password: <code className="bg-[#F8F5EF] px-1 py-0.5 rounded text-[#C6A15B] border border-[#C6A15B]/30">staff123</code>)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('maria.garcia@grandhorizon.com', 'staff123')}
                  className="p-2.5 bg-[#F8F5EF] hover:bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#C6A15B]/60 rounded-xl text-left transition"
                >
                  <div className="text-xs font-bold text-[#24211E]">Maria Garcia</div>
                  <div className="text-[10px] text-[#7C756B]">Housekeeping</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('carlos.rodriguez@grandhorizon.com', 'staff123')}
                  className="p-2.5 bg-[#F8F5EF] hover:bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#C6A15B]/60 rounded-xl text-left transition"
                >
                  <div className="text-xs font-bold text-[#24211E]">Carlos Rodriguez</div>
                  <div className="text-[10px] text-[#7C756B]">Maintenance</div>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-[#7C756B]">
          SmartStay Operations Center • Staff Passwords managed by Admin
        </footer>
      </div>
    );
  }

  const pendingTickets = tickets.filter((t) => t.status === 'PENDING' || t.status === 'ASSIGNED');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const completedTickets = tickets.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#24211E] selection:bg-[#C6A15B] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#E5DFD5] bg-[#FFFFFF]/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 text-[#7C756B] hover:text-[#24211E] hover:bg-[#F8F5EF] rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#C6A15B]/40 flex items-center justify-center shadow-md p-1">
              <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#24211E] flex items-center gap-2">
                SmartStay Operations Dashboard
              </h1>
              <p className="text-xs text-[#7C756B] font-medium">Grand Horizon Hotel • Real-time Task Dispatch</p>
            </div>
          </div>
        </div>

        {/* Staff Duty Profile Bar & Guest Options */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-[#171717] border border-[#C6A15B]/40 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C6A15B] animate-pulse shadow-[0_0_8px_#C6A15B]" />
            <span className="font-bold text-[#F8F5EF]">{staffUser.name}</span>
            <span className="text-[#C6A15B] text-[11px] font-semibold">({staffUser.department})</span>
          </div>

          <button
            onClick={() => {
              setGuestModalOpen(true);
              fetchGuestsList();
            }}
            className="p-2 sm:p-2.5 bg-[#171717] hover:bg-[#292724] border border-[#C6A15B]/40 text-[#C6A15B] rounded-xl transition text-xs flex items-center gap-1.5 font-bold shadow-xs"
          >
            <Users className="w-4 h-4 text-[#C6A15B]" />
            <span className="hidden sm:inline">Manage Guests</span>
            <span className="sm:hidden">Guests</span>
          </button>

          <button
            onClick={() => setQrModalOpen(true)}
            className="p-2 sm:p-2.5 bg-[#C6A15B] hover:bg-[#B5904B] text-[#171717] rounded-xl transition text-xs flex items-center gap-1.5 font-bold shadow-xs"
          >
            <QrCode className="w-4 h-4 text-[#171717]" />
            <span className="hidden sm:inline">Print Room QR</span>
            <span className="sm:hidden">QR</span>
          </button>

          <button
            onClick={fetchTickets}
            className="p-2 sm:p-2.5 bg-[#FFFFFF] hover:bg-[#F8F5EF] border border-[#E5DFD5] text-[#7C756B] hover:text-[#24211E] rounded-xl transition text-xs flex items-center gap-1.5 font-semibold shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#C6A15B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 sm:p-2.5 bg-[#FFF5F5] hover:bg-[#FFE6E6] border border-[#DC2626]/30 text-[#DC2626] rounded-xl transition text-xs flex items-center gap-1.5 font-bold shadow-xs"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Department Filter Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E5DFD5] bg-[#FFFFFF]/80 backdrop-blur">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-[#7C756B] mr-1 shrink-0" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/40 shadow-sm'
                  : 'bg-[#FFFFFF] text-[#7C756B] hover:bg-[#F8F5EF] hover:text-[#24211E] border border-[#E5DFD5]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#7C756B] font-medium shrink-0 ml-4 hidden md:block">
          Total Queue: <span className="text-[#24211E] font-bold">{tickets.length}</span> (
          <span className="text-[#C6A15B] font-bold">{pendingTickets.length} Pending</span> •{' '}
          <span className="text-[#2563EB] font-bold">{inProgressTickets.length} In Progress</span>)
        </div>
      </div>

      {/* Mobile Kanban Column View Switcher */}
      <div className="md:hidden max-w-7xl mx-auto px-4 pt-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMobileKanbanTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mobileKanbanTab === 'ALL'
              ? 'bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/40'
              : 'bg-[#FFFFFF] text-[#7C756B] border border-[#E5DFD5]'
          }`}
        >
          All Columns ({tickets.length})
        </button>
        <button
          onClick={() => setMobileKanbanTab('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mobileKanbanTab === 'PENDING'
              ? 'bg-[#C6A15B] text-[#171717]'
              : 'bg-[#FFFFFF] text-[#C6A15B] border border-[#C6A15B]/40'
          }`}
        >
          Pending ({pendingTickets.length})
        </button>
        <button
          onClick={() => setMobileKanbanTab('IN_PROGRESS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mobileKanbanTab === 'IN_PROGRESS'
              ? 'bg-[#292724] text-[#F8F5EF]'
              : 'bg-[#FFFFFF] text-[#292724] border border-[#292724]/40'
          }`}
        >
          In Progress ({inProgressTickets.length})
        </button>
        <button
          onClick={() => setMobileKanbanTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mobileKanbanTab === 'COMPLETED'
              ? 'bg-[#16A34A] text-white'
              : 'bg-[#FFFFFF] text-[#16A34A] border border-[#16A34A]/40'
          }`}
        >
          Completed ({completedTickets.length})
        </button>
      </div>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid md:grid-cols-3 gap-6">
        {/* Column 1: Incoming Tasks */}
        <div className={`bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-4 space-y-4 flex flex-col shadow-sm ${
          mobileKanbanTab !== 'ALL' && mobileKanbanTab !== 'PENDING' ? 'hidden md:flex' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <h2 className="font-bold text-sm text-[#24211E] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C6A15B]" />
              Incoming / Pending ({pendingTickets.length})
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {pendingTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#7C756B] italic">No pending tasks in queue</div>
            ) : (
              pendingTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#F8F5EF] border border-[#E5DFD5] hover:border-[#C6A15B] rounded-xl p-4 space-y-3 shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#7C756B] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5DFD5]">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 animate-pulse'
                          : 'bg-[#FFF9EC] text-[#C6A15B] border border-[#C6A15B]/30'
                      }`}
                    >
                      {t.department} • {t.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#24211E] text-sm">{t.title}</h3>
                    <p className="text-xs text-[#7C756B] mt-1 font-medium">{t.description}</p>
                  </div>

                  <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5DFD5] text-xs flex items-center justify-between text-[#24211E]">
                    <span>
                      Room <strong className="text-[#C6A15B]">{t.roomNumber}</strong> ({t.guestName})
                    </span>
                    <span className="text-[11px] text-[#C6A15B] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C6A15B]" /> SLA ~{t.slaMinutes}m
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpdateTicket(t.id, 'IN_PROGRESS')}
                    disabled={updatingId === t.id}
                    className="w-full bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/30 font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shadow-[#171717]/10 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#C6A15B]" /> Accept & Start Task
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className={`bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-4 space-y-4 flex flex-col shadow-sm ${
          mobileKanbanTab !== 'ALL' && mobileKanbanTab !== 'IN_PROGRESS' ? 'hidden md:flex' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <h2 className="font-bold text-sm text-[#24211E] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#292724] animate-pulse shadow-[0_0_8px_#292724]" />
              In Progress ({inProgressTickets.length})
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {inProgressTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#7C756B] italic">No tasks currently in progress</div>
            ) : (
              inProgressTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#FFFFFF] border border-[#171717]/30 rounded-xl p-4 space-y-3 shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#171717] bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#E5DFD5]">
                      {t.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F5EF] text-[#292724] border border-[#C6A15B]/30 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#C6A15B]" /> Staff En Route
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#24211E] text-sm">{t.title}</h3>
                    <p className="text-xs text-[#7C756B] mt-1 font-medium">{t.description}</p>
                  </div>

                  <div className="bg-[#F8F5EF] p-2.5 rounded-lg border border-[#E5DFD5] text-xs flex items-center justify-between text-[#24211E]">
                    <span>
                      Room <strong className="text-[#C6A15B]">{t.roomNumber}</strong> ({t.guestName})
                    </span>
                    <span className="text-[11px] text-[#7C756B] font-medium">Assigned: {t.assignedStaff?.name || 'Staff'}</span>
                  </div>

                  <button
                    onClick={() => handleUpdateTicket(t.id, 'COMPLETED', 'Task completed and verified.')}
                    disabled={updatingId === t.id}
                    className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <CheckSquare className="w-4 h-4" /> Mark Completed
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Recently Completed */}
        <div className={`bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-4 space-y-4 flex flex-col shadow-sm ${
          mobileKanbanTab !== 'ALL' && mobileKanbanTab !== 'COMPLETED' ? 'hidden md:flex' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <h2 className="font-bold text-sm text-[#24211E] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
              Recently Completed ({completedTickets.length})
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {completedTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#7C756B] italic">No completed tasks yet</div>
            ) : (
              completedTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#F8F5EF] border border-[#E5DFD5] rounded-xl p-4 space-y-2 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#7C756B] font-bold">{t.ticketNumber}</span>
                    <span className="text-[#16A34A] font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Completed
                    </span>
                  </div>
                  <h3 className="font-bold text-[#24211E] text-xs">{t.title}</h3>
                  <div className="text-[11px] text-[#7C756B] flex items-center justify-between pt-1 font-medium">
                    <span>Room {t.roomNumber} ({t.department})</span>
                    <span>
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Done'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Guest Management Modal */}
      {guestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl p-4 sm:p-6 max-w-2xl w-full border border-[#E5DFD5] shadow-2xl space-y-4 animate-fade-in max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#171717] border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#24211E]">
                  Guest Session & Room Management
                </h3>
              </div>
              <button
                onClick={() => {
                  setGuestModalOpen(false);
                  setShowAddGuestForm(false);
                }}
                className="p-1.5 text-[#7C756B] hover:text-[#24211E] hover:bg-[#F8F5EF] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {guestSuccessMsg && (
              <div className="p-3 bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold rounded-xl flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {guestSuccessMsg}
              </div>
            )}

            {guestErrorMsg && (
              <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold rounded-xl shrink-0">
                {guestErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-[#7C756B]">
                Active Guests ({guestsList.filter((g) => g.active).length})
              </span>
              <button
                onClick={() => setShowAddGuestForm(!showAddGuestForm)}
                className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/40 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                {showAddGuestForm ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{showAddGuestForm ? 'Cancel Add' : 'Add New Guest'}</span>
              </button>
            </div>

            {/* Add Guest Form */}
            {showAddGuestForm && (
              <form onSubmit={handleAddGuest} className="bg-[#F8F5EF] border border-[#C6A15B]/30 rounded-2xl p-4 space-y-3 shrink-0 shadow-xs">
                <h4 className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" /> Check-In New Guest
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#24211E] mb-1">Guest Full Name</label>
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="e.g. Alex Sharma"
                      className="w-full bg-[#FFFFFF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#24211E] font-medium outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#24211E] mb-1">Room Number</label>
                    <input
                      type="text"
                      value={newGuestRoom}
                      onChange={(e) => setNewGuestRoom(e.target.value)}
                      placeholder="e.g. 204"
                      className="w-full bg-[#FFFFFF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#24211E] font-medium outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#24211E] mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={newGuestCheckout}
                    onChange={(e) => setNewGuestCheckout(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#24211E] font-medium outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={addingGuest}
                    className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/30 font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {addingGuest ? 'Checking In...' : 'Confirm Guest Check-In'}
                  </button>
                </div>
              </form>
            )}

            {/* Guests Roster List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {guestsLoading ? (
                <div className="text-center py-6 text-xs text-[#7C756B] font-bold">Loading guest list...</div>
              ) : guestsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#7C756B] italic">No guest sessions recorded yet</div>
              ) : (
                guestsList.map((g) => (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      g.active
                        ? 'bg-[#FFFFFF] border-[#E5DFD5] hover:border-[#C6A15B]/50 shadow-xs'
                        : 'bg-[#F8F5EF] border-[#E5DFD5] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/30 font-bold flex items-center justify-center text-sm shrink-0">
                        {g.roomNumber}
                      </div>
                      <div>
                        <div className="font-bold text-[#24211E] text-sm flex items-center gap-2">
                          {g.guestName}
                          {g.active ? (
                            <span className="text-[10px] font-bold bg-[#EAF8EF] text-[#16A34A] px-2 py-0.5 rounded-full border border-[#16A34A]/30">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-[#F8F5EF] text-[#7C756B] px-2 py-0.5 rounded-full border border-[#E5DFD5]">
                              Checked Out
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#7C756B] font-medium">
                          Check-out: {new Date(g.checkOutDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {g.active && (
                      <button
                        onClick={() => handleRemoveGuest(g.id, g.guestName, g.roomNumber)}
                        className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs shrink-0"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove / Check Out</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <RoomQRStandeeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        isStaffMode={true}
        guestsList={guestsList}
      />
    </div>
  );
}
