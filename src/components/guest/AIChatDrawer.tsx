'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2, Mic, MicOff } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'I want slippers',
    'I need 2 extra bath towels',
    'My AC is blowing warm air',
    'What is the Wi-Fi password?',
    'What time is breakfast served?',
    'Others / Special item request',
  ];

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang =
        currentLang === 'hi'
          ? 'hi-IN'
          : currentLang === 'gu'
          ? 'gu-IN'
          : currentLang === 'es'
          ? 'es-ES'
          : currentLang === 'fr'
          ? 'fr-FR'
          : 'en-IN';

      let accumulatedFinal = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            accumulatedFinal += transcriptChunk + ' ';
          } else {
            interimTranscript += transcriptChunk;
          }
        }
        const fullText = (accumulatedFinal + interimTranscript).trim().replace(/\s+/g, ' ');
        if (fullText) {
          setInputMsg(fullText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

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
              <p className="text-[11px] text-[#7C756B] font-medium">Multilingual RAG & Voice Action Engine</p>
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

        {/* Input Bar with Voice Microphone Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-[#FFFFFF] border-t border-[#E5DFD5] flex gap-2 items-center"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : "Ask SmartStay AI anything..."}
              className={`w-full bg-[#FFFFFF] border rounded-xl pl-4 pr-10 py-2.5 text-xs text-[#24211E] focus:outline-none transition shadow-xs font-medium ${
                isListening
                  ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20 bg-[#FEF2F2]'
                  : 'border-[#E5DFD5] focus:border-[#C6A15B]'
              }`}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={`absolute right-2.5 p-1.5 rounded-lg transition ${
                isListening
                  ? 'text-[#DC2626] bg-[#FEE2E2] animate-pulse'
                  : 'text-[#7C756B] hover:text-[#C6A15B] hover:bg-[#F8F5EF]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-[#DC2626]" /> : <Mic className="w-4 h-4 text-[#7C756B]" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="bg-[#171717] hover:bg-[#292724] text-[#C6A15B] border border-[#C6A15B]/30 p-2.5 rounded-xl transition disabled:opacity-50 shadow-md shadow-[#171717]/10 shrink-0"
          >
            <Send className="w-4 h-4 text-[#C6A15B]" />
          </button>
        </form>
      </div>
    </div>
  );
}

