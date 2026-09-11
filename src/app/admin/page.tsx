'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Hotel,
  TrendingUp,
  Clock,
  Users,
  IndianRupee,
  BookOpen,
  Plus,
  RefreshCw,
  Download,
  ArrowLeft,
  Sparkles,
  Lock,
  LogOut,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  UserPlus,
  BarChart3,
  Brain,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kb' | 'staff'>('overview');

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminEmail, setAdminEmail] = useState('manager.jane@grandhorizon.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // New Knowledge Base Modal state
  const [showKbModal, setShowKbModal] = useState(false);
  const [kbCategory, setKbCategory] = useState('General FAQs');
  const [kbQuestion, setKbQuestion] = useState('');
  const [kbAnswer, setKbAnswer] = useState('');
  const [kbKeywords, setKbKeywords] = useState('');
  const [kbSubmitting, setKbSubmitting] = useState(false);

  // Staff Management State (Admin decides staff password)
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Reset Password Modal State
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState<any>(null);
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Add New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('HOUSEKEEPING');
  const [newStaffRole, setNewStaffRole] = useState('STAFF');
  const [newStaffInitialPass, setNewStaffInitialPass] = useState('staff123');
  const [addStaffError, setAddStaffError] = useState('');
  const [addStaffSubmitting, setAddStaffSubmitting] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('smartstay_admin');
    if (savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Failed to parse saved admin session:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchAnalytics();
      fetchStaffList();
    } else {
      setLoading(false);
    }
  }, [adminUser]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const json = await res.json();
      if (json.success && json.admin) {
        setAdminUser(json.admin);
        localStorage.setItem('smartstay_admin', JSON.stringify(json.admin));
      } else {
        setLoginError(json.error || 'Admin authentication failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setLoginError('Network error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('smartstay_admin');
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    setStaffLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const json = await res.json();
      if (json.staff) {
        setStaffList(json.staff);
      }
    } catch (err) {
      console.error('Staff list fetch error:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAdminSetStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPassword || !newStaffPassword) return;

    setPasswordUpdating(true);
    setPasswordSuccessMsg('');
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaffForPassword.id,
          password: newStaffPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPasswordSuccessMsg(`✅ Password updated successfully for ${selectedStaffForPassword.name}`);
        setTimeout(() => {
          setSelectedStaffForPassword(null);
          setNewStaffPassword('');
          setPasswordSuccessMsg('');
        }, 1800);
        fetchStaffList();
      } else {
        alert(json.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating staff password:', err);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffInitialPass) return;

    setAddStaffSubmitting(true);
    setAddStaffError('');
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffInitialPass,
          department: newStaffDept,
          role: newStaffRole,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowAddStaffModal(false);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffInitialPass('staff123');
        fetchStaffList();
        fetchAnalytics();
      } else {
        setAddStaffError(json.error || 'Failed to add staff member');
      }
    } catch (err) {
      console.error('Add staff error:', err);
      setAddStaffError('Network error');
    } finally {
      setAddStaffSubmitting(false);
    }
  };

  const handleAddKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQuestion || !kbAnswer) return;
    setKbSubmitting(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: kbCategory,
          question: kbQuestion,
          answer: kbAnswer,
          keywords: kbKeywords,
        }),
      });

      if (res.ok) {
        setShowKbModal(false);
        setKbQuestion('');
        setKbAnswer('');
        setKbKeywords('');
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to add KB item:', err);
    } finally {
      setKbSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.recentTickets) return;
    const headers = ['TicketNumber,Title,Department,RoomNumber,GuestName,Status,CreatedAt\n'];
    const rows = data.recentTickets.map(
      (t: any) => `${t.ticketNumber},"${t.title}",${t.department},${t.roomNumber},"${t.guestName}",${t.status},${t.createdAt}`
    );
    const blob = new Blob([...headers, ...rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartStay_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Render Admin Login Gate if not authenticated
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col justify-between font-sans">
        <header className="border-b border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A45C] flex items-center justify-center shadow-md shadow-[#C9A45C]/20">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#172033]">SmartStay Admin Operations Hub</h1>
                <p className="text-xs text-[#526174] font-medium">Grand Horizon Hotel • Administrator Login</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-12">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#FBF5E8] border border-[#C9A45C]/40 text-[#8A6A2F] flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7 text-[#C9A45C]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#172033]">Administrator Login</h2>
              <p className="text-xs text-[#526174] font-medium">Sign in to manage staff accounts & set passwords</p>
            </div>

            {loginError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-xl text-xs font-bold text-[#DC2626] text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">Admin Email Address</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="manager.jane@grandhorizon.com"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C9A45C] rounded-xl px-4 py-3 text-sm text-[#172033] outline-none transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">Admin Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C9A45C] rounded-xl px-4 py-3 text-sm text-[#172033] outline-none transition font-medium pr-10"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-[#8290A3] absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full bg-[#C9A45C] hover:bg-[#B59149] text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-[#C9A45C]/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {authenticating ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>

            <div className="pt-4 border-t border-[#E2E8F0] text-center space-y-2">
              <div className="text-[11px] text-[#526174]">
                Default Admin Email: <code className="bg-[#F1F5F9] px-1 py-0.5 rounded text-[#172033] font-mono">manager.jane@grandhorizon.com</code>
              </div>
              <div className="text-[11px] text-[#526174]">
                Default Admin Password: <code className="bg-[#F1F5F9] px-1 py-0.5 rounded text-[#8A6A2F] font-mono">admin123</code>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-[#8290A3]">
          SmartStay Hotel Admin Hub • Full Staff Password Governance Active
        </footer>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex items-center justify-center font-bold">Loading Management Analytics...</div>;
  }

  const metrics = data?.metrics || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] pb-12">
      {/* Header Bar */}
      <header className="border-b border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A45C] flex items-center justify-center shadow-md shadow-[#C9A45C]/20">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#172033] flex items-center gap-2">
                SmartStay Hotel Admin & Operations Hub
              </h1>
              <p className="text-xs text-[#526174] font-medium">Grand Horizon Hotel • Analytics & Staff Password Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FBF5E8] border border-[#C9A45C]/40 text-[#8A6A2F] rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
            <span>{adminUser.name} (ADMIN)</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#C6A15B]/30 transition flex items-center gap-2 shadow-md shadow-[#171717]/20"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>

          <button
            onClick={() => {
              fetchAnalytics();
              fetchStaffList();
            }}
            className="p-2.5 bg-white hover:bg-[#F8F5EF] text-[#24211E] hover:text-[#171717] border border-[#E5DFD5] rounded-xl transition text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#C6A15B]" />
          </button>

          <button
            onClick={handleAdminLogout}
            className="p-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] rounded-xl transition text-xs flex items-center gap-1.5 font-bold shadow-xs"
            title="Log Out Admin"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Analytics & Staff Tabs Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex border-b border-[#E5DFD5] bg-white">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition mr-3 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/40 shadow-md'
              : 'bg-[#F8F5EF] text-[#7C756B] hover:text-[#171717] border border-[#E5DFD5]'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#C6A15B]' : 'text-[#7C756B]'}`} />
          <span>Operational Overview & KPIs</span>
        </button>
        <button
          onClick={() => setActiveTab('kb')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition mr-3 flex items-center gap-2 ${
            activeTab === 'kb'
              ? 'bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/40 shadow-md'
              : 'bg-[#F8F5EF] text-[#7C756B] hover:text-[#171717] border border-[#E5DFD5]'
          }`}
        >
          <Brain className={`w-4 h-4 ${activeTab === 'kb' ? 'text-[#C6A15B]' : 'text-[#7C756B]'}`} />
          <span>AI Knowledge Base Manager (RAG)</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('staff');
            fetchStaffList();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-[#171717] text-[#C6A15B] border border-[#C6A15B]/40 shadow-md'
              : 'bg-[#F8F5EF] text-[#7C756B] hover:text-[#171717] border border-[#E5DFD5]'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'staff' ? 'text-[#C6A15B]' : 'text-[#7C756B]'}`} />
          <span>Staff Accounts & Password Manager</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#526174] text-xs font-bold">
                  <span>TOTAL TICKETS TODAY</span>
                  <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="text-3xl font-extrabold text-[#172033]">{metrics.totalTickets}</div>
                <div className="text-[11px] text-[#16A34A] font-bold">
                  {metrics.completedTickets} Completed • {metrics.pendingTickets} Open
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#526174] text-xs font-bold">
                  <span>AVG SLA RESOLUTION</span>
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div className="text-3xl font-extrabold text-[#2563EB]">{metrics.averageSlaMinutes}m</div>
                <div className="text-[11px] text-[#526174] font-medium">Target SLA &lt; 25 minutes</div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#526174] text-xs font-bold">
                  <span>ROOM SERVICE REVENUE</span>
                  <IndianRupee className="w-4 h-4 text-[#C6A15B]" />
                </div>
                <div className="text-3xl font-extrabold text-[#171717]">
                  ₹{(metrics.totalRevenue || 0).toFixed(2)}
                </div>
                <div className="text-[11px] text-[#526174] font-medium">{metrics.totalOrders} In-Room Dining Orders</div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#526174] text-xs font-bold">
                  <span>AI AUTO-DISPATCH RATE</span>
                  <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                </div>
                <div className="text-3xl font-extrabold text-[#171717]">{metrics.aiResolutionRate}</div>
                <div className="text-[11px] text-[#C6A15B] font-bold">Instant RAG & Task Creation</div>
              </div>
            </div>

            {/* Department Request Volume Breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#172033] border-b border-[#E2E8F0] pb-3">
                Department Request Volume Breakdown
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#526174] mb-1 font-bold">HOUSEKEEPING</div>
                  <div className="text-2xl font-extrabold text-[#16A34A]">
                    {data?.departmentCounts?.HOUSEKEEPING || 0}
                  </div>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#526174] mb-1 font-bold">MAINTENANCE</div>
                  <div className="text-2xl font-extrabold text-[#2563EB]">
                    {data?.departmentCounts?.MAINTENANCE || 0}
                  </div>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#526174] mb-1 font-bold">KITCHEN</div>
                  <div className="text-2xl font-extrabold text-[#D97706]">
                    {data?.departmentCounts?.KITCHEN || 0}
                  </div>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#526174] mb-1 font-bold">FRONT DESK</div>
                  <div className="text-2xl font-extrabold text-[#C6A15B]">
                    {data?.departmentCounts?.FRONT_DESK || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Stream */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#172033] border-b border-[#E2E8F0] pb-3">
                Recent Guest Tickets & Operational Events
              </h2>
              <div className="space-y-3">
                {data?.recentTickets?.map((t: any) => (
                  <div
                    key={t.id}
                    className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#C6A15B] bg-[#171717] px-2.5 py-1 rounded-lg border border-[#C6A15B]/30 shadow-xs">
                        {t.ticketNumber}
                      </span>
                      <div>
                        <div className="font-bold text-[#172033] text-sm">{t.title}</div>
                        <div className="text-[#526174] font-medium">
                          Room {t.roomNumber} ({t.guestName}) • Dept: {t.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="bg-white text-[#526174] font-bold px-2.5 py-1 rounded-full border border-[#CBD5E1]">
                        {t.status}
                      </span>
                      <div className="text-[10px] text-[#8290A3] font-medium">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Knowledge Base Editor Tab */}
        {activeTab === 'kb' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#8A6A2F]" />
                  RAG Knowledge Base & FAQ Management
                </h2>
                <p className="text-xs text-[#526174] font-medium">
                  Update answers for the AI Concierge. Changes take effect immediately.
                </p>
              </div>

              <button
                onClick={() => setShowKbModal(true)}
                className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#C6A15B]/30 transition flex items-center gap-2 shadow-md shadow-[#171717]/20"
              >
                <Plus className="w-4 h-4" /> Add New FAQ / Knowledge Item
              </button>
            </div>

            {/* Add KB Item Modal */}
            {showKbModal && (
              <form onSubmit={handleAddKb} className="bg-[#F8F5EF] border border-[#C6A15B]/40 rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C6A15B]" /> Add New FAQ for AI Concierge
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#526174] font-bold mb-1">Category</label>
                    <input
                      type="text"
                      value={kbCategory}
                      onChange={(e) => setKbCategory(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#C6A15B] rounded-lg p-2 text-xs text-[#172033]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#526174] font-bold mb-1">Search Keywords</label>
                    <input
                      type="text"
                      value={kbKeywords}
                      onChange={(e) => setKbKeywords(e.target.value)}
                      placeholder="e.g. pool, swimming, hours"
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#C6A15B] rounded-lg p-2 text-xs text-[#172033]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#526174] font-bold mb-1">Question / Prompt</label>
                  <input
                    type="text"
                    value={kbQuestion}
                    onChange={(e) => setKbQuestion(e.target.value)}
                    placeholder="e.g. What time is the pool open?"
                    className="w-full bg-white border border-[#CBD5E1] focus:border-[#C6A15B] rounded-lg p-2 text-xs text-[#172033]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#526174] font-bold mb-1">Official Hotel Answer</label>
                  <textarea
                    value={kbAnswer}
                    onChange={(e) => setKbAnswer(e.target.value)}
                    placeholder="e.g. The Infinity Pool on Floor 4 is open daily 07:00 AM - 09:00 PM."
                    className="w-full bg-white border border-[#CBD5E1] focus:border-[#C6A15B] rounded-lg p-2 text-xs text-[#172033] h-20"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKbModal(false)}
                    className="px-4 py-2 bg-white text-xs text-[#526174] border border-[#CBD5E1] rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={kbSubmitting}
                    className="px-4 py-2 bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs rounded-lg border border-[#C6A15B]/30 shadow-sm"
                  >
                    Save FAQ Item
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Staff Workload & Password Governance Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2563EB]" />
                  Staff Accounts & Password Governance
                </h2>
                <p className="text-xs text-[#526174] font-medium">
                  As Administrator, you decide and update staff passwords for all 8 hotel departments.
                </p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#C6A15B]/30 transition flex items-center gap-2 shadow-md shadow-[#171717]/20"
              >
                <UserPlus className="w-4 h-4" /> Add New Staff Member
              </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((s: any) => (
                <div
                  key={s.id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C6A15B]/50 rounded-2xl p-5 space-y-4 shadow-xs transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-[#172033] text-base">{s.name}</h3>
                      <div className="text-xs text-[#526174] font-mono">{s.email}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAF8EF] text-[#16A34A] border border-[#16A34A]/30">
                      {s.dutyStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E2E8F0]">
                    <div>
                      <span className="text-[#8290A3] font-bold block text-[10px]">DEPARTMENT</span>
                      <span className="font-bold text-[#172033]">{s.department}</span>
                    </div>
                    <div>
                      <span className="text-[#8290A3] font-bold block text-[10px]">ROLE</span>
                      <span className="font-bold text-[#2563EB]">{s.role}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C6A15B]">
                      Active Tickets: {s._count?.tickets || 0}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedStaffForPassword(s);
                        setNewStaffPassword('');
                        setPasswordSuccessMsg('');
                      }}
                      className="bg-white hover:bg-[#171717] hover:text-[#C6A15B] border border-[#CBD5E1] hover:border-[#C6A15B]/40 text-[#172033] font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>Set Password</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Set/Reset Password Modal */}
            {selectedStaffForPassword && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto my-auto">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#C6A15B]" />
                      <h3 className="font-bold text-base text-[#172033]">
                        Set Password for {selectedStaffForPassword.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedStaffForPassword(null)}
                      className="p-1.5 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#526174] font-medium">
                    As Administrator, define the new password for staff email <strong className="text-[#172033]">{selectedStaffForPassword.email}</strong>.
                  </p>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {passwordSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleAdminSetStaffPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">New Password</label>
                      <input
                        type="password"
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="Enter new password (e.g. staff123)"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-3 text-sm text-[#172033] font-medium"
                        required
                        minLength={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffForPassword(null)}
                        className="px-4 py-2.5 bg-white text-xs text-[#526174] border border-[#CBD5E1] rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordUpdating}
                        className="px-5 py-2.5 bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs rounded-xl border border-[#C6A15B]/30 shadow-md disabled:opacity-50"
                      >
                        {passwordUpdating ? 'Updating Password...' : 'Save Staff Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add New Staff Modal */}
            {showAddStaffModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-lg w-full border border-[#E2E8F0] shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto my-auto">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#C6A15B]" />
                      <h3 className="font-bold text-base text-[#172033]">Create New Staff Member</h3>
                    </div>
                    <button
                      onClick={() => setShowAddStaffModal(false)}
                      className="p-1.5 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {addStaffError && (
                    <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold rounded-xl">
                      {addStaffError}
                    </div>
                  )}

                  <form onSubmit={handleAddStaffMember} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="e.g. Samuel Green"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#172033] font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Email Address</label>
                        <input
                          type="email"
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          placeholder="samuel.green@grandhorizon.com"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#172033] font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Department</label>
                        <select
                          value={newStaffDept}
                          onChange={(e) => setNewStaffDept(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#172033] font-medium"
                        >
                          <option value="HOUSEKEEPING">HOUSEKEEPING</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="KITCHEN">KITCHEN</option>
                          <option value="LAUNDRY">LAUNDRY</option>
                          <option value="BELL_DESK">BELL_DESK</option>
                          <option value="FRONT_DESK">FRONT_DESK</option>
                          <option value="SECURITY">SECURITY</option>
                          <option value="MANAGEMENT">MANAGEMENT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Role</label>
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#172033] font-medium"
                        >
                          <option value="STAFF">STAFF</option>
                          <option value="SUPERVISOR">SUPERVISOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">Admin Assigned Password</label>
                      <input
                        type="password"
                        value={newStaffInitialPass}
                        onChange={(e) => setNewStaffInitialPass(e.target.value)}
                        placeholder="Define initial password for staff"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#C6A15B] rounded-xl p-2.5 text-xs text-[#172033] font-medium"
                        required
                        minLength={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStaffModal(false)}
                        className="px-4 py-2.5 bg-white text-xs text-[#526174] border border-[#CBD5E1] rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addStaffSubmitting}
                        className="px-5 py-2.5 bg-[#171717] hover:bg-[#292724] text-[#C6A15B] font-bold text-xs rounded-xl border border-[#C6A15B]/30 shadow-md disabled:opacity-50"
                      >
                        {addStaffSubmitting ? 'Creating Staff Account...' : 'Create Staff Member'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
