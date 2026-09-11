'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Hotel,
  User,
  ShieldCheck,
  Bot,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Play,
  Star,
  Clock,
  Users,
  Building,
  MessageSquare,
  Zap,
  Layers,
  BarChart3,
  Leaf,
  X,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Info,
  Menu,
} from 'lucide-react';

export default function Home() {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [activeNav, setActiveNav] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string, navName: string) => {
    setActiveNav(navName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetMsg('✅ Database reset & demo scenarios seeded successfully!');
      } else {
        setResetMsg('❌ Reset failed');
      }
    } catch (err) {
      setResetMsg('❌ Network error resetting demo');
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    { label: 'Home', target: 'home' },
    { label: 'Services', target: 'services' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'About', target: 'about' },
    { label: 'Contact', target: 'contact' },
  ];

  return (
    <div id="home" className="min-h-screen bg-[#F8F5EF] text-[#24211E] flex flex-col justify-between font-sans selection:bg-[#C6A15B] selection:text-white">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50 px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center shadow-md shadow-[#171717]/20 border border-[#C6A15B]/40 p-1">
              <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-[#171717] leading-tight">
                SmartStay
              </h1>
              <p className="text-[11px] text-[#7C756B] font-medium">Grand Horizon Hotel • Digital Concierge</p>
            </div>
          </div>

          {/* Center Nav Links with Smooth Scroll */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#7C756B]">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.target, item.label)}
                className={`relative py-1 transition ${
                  activeNav === item.label
                    ? 'text-[#C6A15B] font-bold'
                    : 'hover:text-[#171717]'
                }`}
              >
                {item.label}
                {activeNav === item.label && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A15B] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/scan"
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 px-3 sm:px-4 py-2.5 rounded-xl transition shadow-md shadow-[#171717]/20"
            >
              <QrCode className="w-4 h-4 text-[#C6A15B]" /> <span className="hidden sm:inline">Scan QR Demo</span><span className="sm:hidden">Scan QR</span>
            </Link>

            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="hidden sm:flex items-center gap-2 text-xs bg-white hover:bg-[#F5EFE4] text-[#24211E] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] transition font-semibold shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C6A15B] ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting...' : 'Reset Demo'}
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#7C756B] hover:text-[#171717] hover:bg-[#F5EFE4] rounded-xl transition border border-[#E2E8F0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-[#E2E8F0] mt-3 space-y-2 animate-fade-in">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    scrollToSection(item.target, item.label);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeNav === item.label
                      ? 'bg-[#FBF5E8] text-[#C6A15B]'
                      : 'text-[#7C756B] hover:bg-[#F5EFE4] hover:text-[#171717]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
              <button
                onClick={() => {
                  handleResetDemo();
                  setMobileMenuOpen(false);
                }}
                disabled={resetting}
                className="w-full flex items-center justify-center gap-2 text-xs bg-[#F8F5EF] hover:bg-[#F5EFE4] text-[#24211E] py-2 rounded-xl border border-[#CBD5E1] transition font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#C6A15B] ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Resetting...' : 'Reset Demo Scenario'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Demo Reset Success Notification */}
      {resetMsg && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold flex items-center justify-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            {resetMsg}
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 space-y-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 bg-[#FBF5E8] border border-[#C6A15B]/40 rounded-full px-4 py-1.5 text-xs text-[#8A6A2F] font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
              "One Scan. One Concierge. Everything You Need."
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#171717]">
              Smart AI Hotel Concierge & <br />
              <span className="text-[#C6A15B]">Service Automation Platform</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#7C756B] text-sm sm:text-base max-w-xl font-medium leading-relaxed">
              Eliminating phone calls and manual coordination by connecting guest natural-language requests directly with 8 hotel departments in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/scan"
                className="flex items-center gap-2.5 text-xs font-bold bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 px-6 py-3.5 rounded-xl transition shadow-lg shadow-[#171717]/25"
              >
                Get Started <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
              </Link>
            </div>

            {/* Trust Metrics Strip */}
            <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#171717]">500+</div>
                  <div className="text-[11px] text-[#7C756B] font-medium">Hotels Partnered</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#171717]">1M+</div>
                  <div className="text-[11px] text-[#7C756B] font-medium">Happy Guests</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#171717]">24/7</div>
                  <div className="text-[11px] text-[#7C756B] font-medium">AI Assistance</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#8A6A2F] flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-[#C6A15B] fill-current" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#171717]">4.8 ★</div>
                  <div className="text-[11px] text-[#7C756B] font-medium">Average Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Visual Presentation */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#171717] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                alt="Grand Horizon Hotel Suite"
                className="w-full h-full object-cover opacity-90 transition transform hover:scale-105 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-[#171717]/20 to-transparent" />

              <div className="absolute top-6 right-6 text-right font-serif text-[#C6A15B] drop-shadow-md">
                <div className="text-xs uppercase tracking-widest font-bold opacity-90">A BETTER</div>
                <div className="text-sm uppercase tracking-widest font-extrabold">STAY</div>
                <div className="text-xs uppercase tracking-widest font-bold opacity-90">ALWAYS</div>
              </div>

              <div className="absolute bottom-6 left-6 font-serif italic text-white/90 text-xs sm:text-sm drop-shadow-md">
                "More than a stay, <br />
                <span className="not-italic text-[#C6A15B] font-semibold">a better experience."</span>
              </div>
            </div>

            {/* Overlay Floating Cards */}
            <div className="absolute -top-4 -left-4 sm:left-4 bg-white/95 backdrop-blur border border-[#E2E8F0] p-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-10 animate-float">
              <div className="w-10 h-10 rounded-xl bg-[#FBF5E8] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#171717]">AI Concierge</div>
                <div className="text-[10px] text-[#7C756B]">Always here to help</div>
              </div>
            </div>

            <div className="absolute bottom-12 -right-2 sm:right-4 bg-white/95 backdrop-blur border border-[#E2E8F0] p-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-10 animate-float-delayed">
              <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#171717]">Scan & Connect</div>
                <div className="text-[10px] text-[#7C756B]">Instant hotel services</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Services Section (3 Portal Selection Cards) */}
        <div id="services" className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-2">
            <h2 className="text-2xl font-extrabold text-[#171717]">Digital Portals & Operational Workspaces</h2>
            <p className="text-xs text-[#7C756B] font-medium">Select a portal below to experience SmartStay in real-time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Guest Portal Card */}
            <Link
              href="/scan"
              className="group relative bg-[#FBF5E8]/60 hover:bg-[#FBF5E8] border border-[#C6A15B]/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#171717] text-[#C6A15B] flex items-center justify-center shadow-xs border border-[#C6A15B]/30 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-[#C6A15B] flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform border border-[#C6A15B]/20">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#171717] mb-2 group-hover:text-[#C6A15B] transition-colors">
                  Guest Digital Portal
                </h3>
                <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                  Contactless QR entry, 1-tap water, towels, room service menu, lost key access, room change, and multilingual AI Concierge.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#C6A15B]/20 text-[11px] text-[#C6A15B] font-bold flex items-center gap-1.5">
                <span>Scan QR -&gt; Room 204 (Alex Sharma)</span>
              </div>
            </Link>

            {/* Staff Workspace Card */}
            <Link
              href="/staff"
              className="group relative bg-[#EFF6FF]/60 hover:bg-[#EFF6FF] border border-[#2563EB]/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs border border-[#2563EB]/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-[#2563EB] flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform border border-[#2563EB]/20">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#171717] mb-2 group-hover:text-[#2563EB] transition-colors">
                  Staff Operations Dashboard
                </h3>
                <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                  Task dispatch queue for Housekeeping, Kitchen, Maintenance, Laundry, Bell Desk, Front Desk, Security, & Management.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2563EB]/20 text-[11px] text-[#2563EB] font-bold flex items-center gap-1.5">
                <span>Accept, start & complete department orders</span>
              </div>
            </Link>

            {/* Admin Analytics Card */}
            <Link
              href="/admin"
              className="group relative bg-[#171717] hover:bg-[#292724] text-white border border-[#C6A15B]/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#C6A15B] flex items-center justify-center shadow-xs border border-[#C6A15B]/30 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 text-[#C6A15B] flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C6A15B] transition-colors">
                  Admin & Analytics Hub
                </h3>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Manager KPIs, SLA response times, RAG Knowledge Base Editor, staff performance monitor, & CSV report exports.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 text-[11px] text-[#C6A15B] font-bold flex items-center gap-1.5">
                <span>View live KPIs & edit hotel RAG FAQs</span>
              </div>
            </Link>
          </div>

          {/* Features Strip */}
          <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-semibold text-[#171717]">
            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="leading-tight">Natural Language Requests</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="leading-tight">Real-time Task Routing</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <span className="leading-tight">Multi-department Integration</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#171717] text-[#C6A15B] flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="leading-tight">Contactless Experience</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="leading-tight">Analytics & Reporting</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F5EF] transition">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5E8] text-[#8A6A2F] flex items-center justify-center shrink-0">
                <Building className="w-4 h-4 text-[#C6A15B]" />
              </div>
              <span className="leading-tight">Scalable for Any Hotel</span>
            </div>
          </div>
        </div>

        {/* 4. How It Works Section */}
        <div id="how-it-works" className="scroll-mt-24 bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FBF5E8] text-[#8A6A2F] px-3 py-1 rounded-full text-xs font-bold border border-[#C6A15B]/30">
              <HelpCircle className="w-3.5 h-3.5 text-[#C6A15B]" /> Simple 4-Step Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">How SmartStay Works</h2>
            <p className="text-xs sm:text-sm text-[#7C756B] font-medium">From contactless QR scan to real-time staff fulfillment in under 5 minutes</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#171717] text-[#C6A15B] font-extrabold flex items-center justify-center text-sm shadow-md border border-[#C6A15B]/30">
                1
              </div>
              <h3 className="font-bold text-[#171717] text-base">Scan Room QR</h3>
              <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                Guest scans the in-room QR code without downloading any app. Token binds session to Room 204.
              </p>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#C6A15B] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-[#171717] text-base">Natural AI Prompt</h3>
              <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                Guest asks the AI Concierge in 17 worldwide languages or taps 1-click room service buttons.
              </p>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-[#171717] text-base">8-Dept Dispatch</h3>
              <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                Multi-intent engine splits prompts and dispatches operational tasks to Housekeeping, Kitchen, or Maintenance.
              </p>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                4
              </div>
              <h3 className="font-bold text-[#171717] text-base">SLA & Fulfillment</h3>
              <p className="text-xs text-[#7C756B] leading-relaxed font-medium">
                Staff accept and complete tasks with live SLA countdowns, auto-updating guest & manager dashboards.
              </p>
            </div>
          </div>
        </div>

        {/* 5. About Section */}
        <div id="about" className="scroll-mt-24 bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-[#FBF5E8] text-[#8A6A2F] px-3 py-1 rounded-full text-xs font-bold border border-[#C6A15B]/30">
                <Info className="w-3.5 h-3.5 text-[#C6A15B]" /> SIH 2026 Innovation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                About SmartStay Platform
              </h2>
              <p className="text-xs sm:text-sm text-[#7C756B] leading-relaxed font-medium">
                Built specifically for Smart India Hackathon 2026, SmartStay bridges the gap between hotel guests and hotel service staff. Our central vision is <strong>"ONE SCAN. ONE CONCIERGE. EVERYTHING YOU NEED."</strong>
              </p>
              <p className="text-xs sm:text-sm text-[#7C756B] leading-relaxed font-medium">
                We replace outdated intercom phone calls with a seamless multilingual AI concierge that handles guest inquiries, orders, room changes, and security access requests while providing managers with real-time SLA metrics.
              </p>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#171717] border-b border-[#E2E8F0] pb-2">Key Enterprise Benefits</h3>
              <ul className="space-y-2.5 text-xs text-[#7C756B] font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> Zero app installation required for hotel guests.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> Native support for 17 global & regional languages.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> 8-Department live staff dispatch queue (`/staff`).
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> RAG Knowledge base FAQ editor & CSV analytics (`/admin`).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 6. Contact Section */}
        <div id="contact" className="scroll-mt-24 bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-[#171717]">Contact Hotel Concierge & Support</h2>
            <p className="text-xs text-[#7C756B] font-medium">Grand Horizon Hotel front desk and support teams are available 24/7</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#C6A15B] flex items-center justify-center mx-auto">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">In-Room Telephone</h3>
              <p className="text-xs text-[#7C756B]">Dial <strong className="text-[#C6A15B]">0</strong> for Front Desk</p>
              <div className="text-[11px] text-[#7C756B]">+1 (800) 555-0199</div>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Email Concierge</h3>
              <p className="text-xs text-[#7C756B]">concierge@grandhorizon.com</p>
              <div className="text-[11px] text-[#7C756B]">24/7 Response SLA &lt; 15 mins</div>
            </div>

            <div className="bg-[#F8F5EF] border border-[#E2E8F0] p-6 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FBF5E8] text-[#8A6A2F] flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5 text-[#C6A15B]" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Hotel Location</h3>
              <p className="text-xs text-[#7C756B]">777 Ocean Parkway, Paradise Bay</p>
              <div className="text-[11px] text-[#7C756B]">Lobby Level Main Entrance</div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#171717] py-6 px-6 text-xs text-white/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo Footer */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center border border-[#C6A15B]/40 p-1">
              <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white">SmartStay</span>
              <span className="text-[11px] text-white/60 ml-2">Grand Horizon Hotel • Digital Concierge</span>
            </div>
          </div>

          {/* Slogan */}
          <div className="font-serif italic text-white/70 text-xs text-center">
            "Technology that cares, hospitality that feels human."
          </div>

          {/* Sustainable Stays Badge */}
          <div className="bg-[#EAF8EF] border border-[#16A34A]/30 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-[11px] text-[#16A34A] font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Sustainable Stays</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </footer>
    </div>
  );
}
