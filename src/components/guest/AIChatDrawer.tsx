'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/i18n';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  currentLang?: string;
  onActionTriggered: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  ticket?: any;
  timestamp: string;
}

export default function AIChatDrawer({
  isOpen,
  onClose,
  roomNumber,
  guestName,
  guestSessionId,
  currentLang = 'en',
  onActionTriggered,
}: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${guestName}! I am SmartStay, your 24/7 Hotel Concierge. How can I make your stay in Room ${roomNumber} extraordinary today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'I need 2 extra bath towels',
    'My AC is blowing warm air',
    'What is the Wi-Fi password?',
    'What time is breakfast served?',
    'Can I get late check-out?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          roomNumber,
          guestName,
          guestSessionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.response,
          ticket: data.ticketCreated,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.ticketCreated) {
          onActionTriggered();
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-full sm:max-w-md bg-white text-[#172033] h-full flex flex-col justify-between shadow-2xl border-l border-[#E2E8F0] animate-fade-in">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F9F91] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172033] flex items-center gap-1.5">
                SmartStay Concierge <span className="w-2 h-2 rounded-full bg-[#0F9F91] animate-ping" />
              </h3>
              <p className="text-[11px] text-[#526174]">Multilingual RAG & Action Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#E8F7F5] text-[#0F9F91] border border-[#0F9F91]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[82%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#0F9F91] text-white rounded-br-none font-medium'
                      : 'bg-[#E8F7F5] border border-[#0F9F91]/20 text-[#172033] rounded-bl-none font-medium'
                  }`}
                >
                  {m.text}
                </div>

                {/* Ticket Confirmation Card inside chat */}
                {m.ticket && (
                  <div className="bg-[#EAF8EF] border border-[#16A34A]/30 rounded-xl p-3 text-xs space-y-1 text-[#16A34A] shadow-xs">
                    <div className="font-bold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      Ticket Created: {m.ticket.ticketNumber}
                    </div>
                    <div className="text-[11px] text-[#526174]">
                      Dept: <span className="font-semibold text-[#172033]">{m.ticket.department}</span> • Priority: {m.ticket.priority}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-[#8290A3] ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-[#526174] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-[#526174] italic bg-white p-3 rounded-xl max-w-[75%] border border-[#E2E8F0] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#0F9F91] animate-spin" /> SmartStay is processing request...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#E2E8F0] bg-[#F1F5F9] flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="bg-white hover:bg-[#E8F7F5] border border-[#CBD5E1] hover:border-[#0F9F91] text-[#172033] hover:text-[#0F9F91] px-3 py-1.5 rounded-full shrink-0 transition font-medium shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-[#E2E8F0] flex gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask SmartStay anything..."
            className="flex-1 bg-white border border-[#CBD5E1] focus:border-[#0F9F91] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none transition shadow-xs"
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="bg-[#0F9F91] hover:bg-[#0B857A] text-white p-2.5 rounded-xl transition disabled:opacity-50 disabled:bg-[#CBD5E1] shadow-md shadow-[#0F9F91]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
