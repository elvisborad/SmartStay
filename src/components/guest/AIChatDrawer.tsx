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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-full sm:max-w-md bg-[#FFFFFF] text-[#24211E] h-full flex flex-col justify-between shadow-2xl border-l border-[#E5DFD5] animate-fade-in font-sans">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFFFF] border-b border-[#E5DFD5] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171717] border border-[#C6A15B]/30 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#24211E] flex items-center gap-1.5">
                SmartStay Concierge <span className="w-2 h-2 rounded-full bg-[#C6A15B] animate-pulse shadow-[0_0_8px_#C6A15B]" />
              </h3>
              <p className="text-[11px] text-[#7C756B] font-medium">Multilingual RAG & Action Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7C756B] hover:text-[#24211E] hover:bg-[#F8F5EF] rounded-lg transition"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F5EF]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#171717] border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                </div>
              )}

              <div className="max-w-[82%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#171717] text-[#F8F5EF] border border-[#C6A15B]/30 rounded-br-none font-medium'
                      : 'bg-[#FFFFFF] border border-[#E5DFD5] text-[#24211E] rounded-bl-none font-medium'
                  }`}
                >
                  {m.text}
                </div>

                {/* Ticket Confirmation Card inside chat */}
                {m.ticket && (
                  <div className="bg-[#FFF9EC] border border-[#C6A15B]/40 rounded-xl p-3 text-xs space-y-1 text-[#24211E] shadow-xs">
                    <div className="font-bold text-[#C6A15B] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" />
                      Ticket Dispatched: {m.ticket.ticketNumber}
                    </div>
                    <div className="text-[11px] text-[#7C756B]">
                      Dept: <span className="font-semibold text-[#24211E]">{m.ticket.department}</span> • Priority: {m.ticket.priority}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-[#7C756B] ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-[#7C756B] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4 text-[#24211E]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-[#7C756B] italic bg-[#FFFFFF] p-3 rounded-xl max-w-[75%] border border-[#E5DFD5] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C6A15B] animate-spin" /> SmartStay AI is synthesizing response...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#E5DFD5] bg-[#F8F5EF] flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="bg-[#FFFFFF] hover:bg-[#171717] border border-[#E5DFD5] hover:border-[#C6A15B]/40 text-[#24211E] hover:text-[#C6A15B] px-3 py-1.5 rounded-full shrink-0 transition font-medium shadow-xs"
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
          className="p-4 bg-[#FFFFFF] border-t border-[#E5DFD5] flex gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask SmartStay AI anything..."
            className="flex-1 bg-[#FFFFFF] border border-[#E5DFD5] focus:border-[#C6A15B] rounded-xl px-4 py-2.5 text-xs text-[#24211E] focus:outline-none transition shadow-xs font-medium"
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/30 p-2.5 rounded-xl transition disabled:opacity-50 shadow-md shadow-[#171717]/10"
          >
            <Send className="w-4 h-4 text-[#C6A15B]" />
          </button>
        </form>
      </div>
    </div>
  );
}
