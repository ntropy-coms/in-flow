'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  CalendarCheck,
  Facebook,
  FileText,
  Instagram,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

const CHANNELS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    Icon: MessageSquare,
    description: 'Link your WhatsApp Business profile via Meta Secure OAuth.',
    isActive: true,
  },
  {
    id: 'instagram',
    name: 'Instagram DM',
    Icon: Instagram,
    description: 'Manage your professional Instagram direct messages and automations.',
    isActive: false,
  },
  {
    id: 'facebook',
    name: 'Facebook Business',
    Icon: Facebook,
    description: 'Sync your company Facebook Page conversations directly into your inbox.',
    isActive: false,
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    Icon: MessageCircle,
    description: 'Connect your local SMS integration to send native text notifications.',
    isActive: false,
  },
];

const TOOL_ACTIONS = [
  {
    label: 'Invoice',
    text: '📄 Invoice Generated: #INV-2026-001 — Total: R250.00. Click to view.',
  },
  {
    label: 'BookedIt',
    text: '📅 Consultation Confirmed: Tuesday at 16:00. Looking forward to speaking with you!',
  },
  {
    label: 'Quote',
    text: '🛠️ Quote Details: Basic Diagnostics & Labour — Total: R750.00',
  },
  {
    label: 'Menu',
    text: '🍔 Order Summary: 1x Quarter Leg & Chips (R55). Processing order now.',
  },
];

type Message = {
  id: string;
  sender: 'business' | 'customer';
  body: string;
  created_at: string;
};

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'chat'>('list');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-in-1',
      sender: 'customer',
      body: "Hi, I'm interested in automating my business setup and scheduling a consultation.",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const replyTimer = useRef<number | null>(null);

  function scrollToBottom() {
    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  function appendMessage(text: string, sender: 'business' | 'customer' = 'business') {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender,
        body: text,
        created_at: new Date().toISOString(),
      },
    ]);
    scrollToBottom();
  }

  function getAutoReply(outgoing: string) {
    const normalized = outgoing.toLowerCase();
    if (/\b(hello|hi|details)\b/.test(normalized)) {
      return 'Awesome, thank you! Do you have an open slot available this Tuesday afternoon for that consultation?';
    }
    if (/\b(booking|scheduled|confirmed)\b/.test(normalized)) {
      return 'Perfect! 16:00 on Tuesday works beautifully for me. Should I expect a voice call or a link through here?';
    }
    if (/\b(invoice|payment|r250)\b/.test(normalized)) {
      return "Received, thank you! I'll process the payment right away and let you know when it goes through.";
    }
    return 'Sounds good, thanks for confirming! What are the next steps to get everything finalized on your end?';
  }

  function scheduleAutoReply(outgoing: string) {
    if (replyTimer.current) {
      window.clearTimeout(replyTimer.current);
    }
    const nextReply = getAutoReply(outgoing);
    replyTimer.current = window.setTimeout(() => {
      appendMessage(nextReply, 'customer');
      replyTimer.current = null;
    }, 4000);
  }

  useEffect(() => {
    return () => {
      if (replyTimer.current) {
        window.clearTimeout(replyTimer.current);
      }
    };
  }, []);

  function handleSend() {
    const outgoing = input.trim();
    if (!outgoing) return;
    appendMessage(outgoing, 'business');
    setInput('');
    scheduleAutoReply(outgoing);
  }

  function handlePluginAction(text: string) {
    appendMessage(text, 'business');
    scheduleAutoReply(text);
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-white">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">iF</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">inFlow Demo Sandbox</p>
              <p className="text-[11px] text-zinc-500">Meta App Review recording mode</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Client-side mock</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-full overflow-x-auto whitespace-nowrap scrollbar-none flex flex-row items-center border-b bg-white z-10 px-3 py-2">
          {TOOL_ACTIONS.map((tool) => (
            <button
              key={tool.label}
              onClick={() => handlePluginAction(tool.text)}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-amber-300"
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden md:flex">
        <div className={`${currentScreen === 'chat' ? 'hidden md:flex' : 'flex'} flex-col overflow-hidden md:w-80 border-r border-zinc-100 bg-white`}>
          <div className="flex-shrink-0 p-3 border-b border-zinc-200">
            <input
              type="search"
              placeholder="Search conversations..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => setCurrentScreen('chat')}
              className="w-full text-left border-b border-zinc-100 px-4 py-4 hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold">C1</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">Customer One (WhatsApp Test)</p>
                  <p className="text-xs text-zinc-500 mt-1">Tap to open chat</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className={`${currentScreen === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
          <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-200 bg-white md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('list')}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600 md:hidden"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Customer One (WhatsApp Test)</p>
                <p className="text-xs text-zinc-500">WhatsApp demo conversation</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full px-4 py-2">
            <div className="flex flex-col gap-3 mt-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'business' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                      message.sender === 'business'
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-zinc-100 text-zinc-900 rounded-bl-none border border-zinc-200'
                    }`}
                  >
                    <p>{message.body}</p>
                    <p className={`mt-2 text-[10px] text-right ${message.sender === 'business' ? 'text-amber-100' : 'text-zinc-500'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="w-full flex-shrink-0 border-t border-zinc-200 bg-white px-4 py-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply..."
                  className="flex-1 resize-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                {TOOL_ACTIONS.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => handlePluginAction(tool.text)}
                    className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:w-96 md:flex-col border-l border-zinc-100 bg-white">
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900">Tools & channels</h3>
            <p className="mt-2 text-xs text-zinc-500">Use these actions to demonstrate multi-channel workflow.</p>
          </div>
          <div className="p-4 space-y-3">
            {TOOL_ACTIONS.map((tool) => (
              <button
                key={tool.label}
                onClick={() => handlePluginAction(tool.text)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-900 transition hover:border-amber-300"
              >
                {tool.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Connected channels</p>
              </div>
              {CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className={`rounded-3xl border px-4 py-4 ${channel.isActive ? 'border-zinc-200 bg-white' : 'border-zinc-100 bg-zinc-50 opacity-70'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${channel.isActive ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      <channel.Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{channel.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{channel.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {channel.isActive ? (
                      <>
                        <button className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Connect WhatsApp</button>
                        <button className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">Retry</button>
                        <button className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">Troubleshoot</button>
                      </>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 bg-white px-4 md:hidden">
        <button onClick={() => setCurrentScreen('list')} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${currentScreen === 'list' ? 'bg-amber-100 text-amber-900' : 'text-zinc-600'}`}>
          Chats
        </button>
        <button onClick={() => setCurrentScreen('chat')} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${currentScreen === 'chat' ? 'bg-amber-100 text-amber-900' : 'text-zinc-600'}`}>
          Conversation
        </button>
      </div>
    </div>
  );
}
