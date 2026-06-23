'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Settings,
  Smartphone,
  Zap,
  Instagram,
  Facebook,
} from 'lucide-react';

type Message = {
  id: string;
  sender: 'business' | 'customer';
  body: string;
  created_at: string;
};

type GlobalTab = 'chats' | 'tools' | 'settings';

const TOOL_ACTIONS = [
  { label: 'Invoice', text: '📄 Invoice Generated: #INV-2026-001 — Total: R250.00. Click to view.' },
  { label: 'BookedIt', text: '📅 Consultation Confirmed: Tuesday at 16:00. Looking forward to speaking with you!' },
  { label: 'Quote', text: '🛠️ Quote Details: Basic Diagnostics & Labour — Total: R750.00' },
  { label: 'Menu', text: '🍔 Order Summary: 1x Quarter Leg & Chips (R55). Processing order now.' },
];

const CHANNELS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Link your WhatsApp Business profile via Meta Secure OAuth.',
    Icon: MessageSquare,
    isActive: true,
  },
  {
    id: 'instagram',
    name: 'Instagram DM',
    description: 'Manage your professional Instagram direct messages.',
    Icon: Instagram,
    isActive: false,
  },
  {
    id: 'facebook',
    name: 'Facebook Business',
    description: 'Sync your company Facebook Page conversations.',
    Icon: Facebook,
    isActive: false,
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    description: 'Connect your local SMS integration.',
    Icon: Smartphone,
    isActive: false,
  },
];

const initialMessages: Message[] = [
  {
    id: 'm-1',
    sender: 'customer',
    body: "Hi! I'd like to book an appointment for a hair wash, treatment, and styling this week if you have any openings?",
    created_at: new Date().toISOString(),
  },
];

export default function Home() {
  const [globalTab, setGlobalTab] = useState<GlobalTab>('chats');
  const [showThread, setShowThread] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
    if (/(hello|hi|details)/.test(normalized)) {
      return 'Awesome, thank you! Do you have a free slot available this Tuesday afternoon?';
    }
    if (/(booking|scheduled|confirmed)/.test(normalized)) {
      return 'Perfect! 16:00 on Tuesday works beautifully for me. See you then!';
    }
    if (/(invoice|payment|r250)/.test(normalized)) {
      return "Got the summary, thank you! I'll see you on Tuesday and settle up right after.";
    }
    return 'Sounds good, thanks for confirming! Let me know what the next steps are.';
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
    const trimmed = input.trim();
    if (!trimmed) return;
    appendMessage(trimmed, 'business');
    setInput('');
    scheduleAutoReply(trimmed);
  }

  function handleToolAction(text: string) {
    appendMessage(text, 'business');
    scheduleAutoReply(text);
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-200 bg-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">inFlow</p>
            <p className="text-xs text-zinc-500">Meta App Review Sandbox</p>
          </div>
          <div className="hidden md:flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Client-side mock
          </div>
        </div>

        {/* Top Toolbar - Tool Pills */}
        <div className="border-t border-zinc-100 overflow-x-auto scrollbar-none px-4 py-3">
          <div className="flex gap-2 whitespace-nowrap">
            {TOOL_ACTIONS.map((tool) => (
              <button
                key={tool.label}
                onClick={() => handleToolAction(tool.text)}
                className="flex-shrink-0 inline-flex items-center rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200"
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">
        {globalTab === 'chats' && (
          <div className="h-full w-full overflow-hidden">
            {!showThread ? (
              /* Chats List */
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 px-4 py-4 border-b border-zinc-100 bg-white">
                  <h2 className="text-sm font-semibold text-zinc-900">Chats</h2>
                  <p className="mt-1 text-xs text-zinc-500">Tap to open conversation</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <button
                    onClick={() => setShowThread(true)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left transition hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-bold text-white">
                        C1
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-900">Customer One</p>
                        <p className="truncate text-xs text-zinc-500">WhatsApp Business • Consultation request</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Conversation Thread */
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-200 bg-white flex items-center gap-3">
                  <button
                    onClick={() => setShowThread(false)}
                    className="rounded-full border border-zinc-200 p-2 text-zinc-700 transition hover:bg-zinc-100 md:hidden"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Customer One</p>
                    <p className="text-xs text-zinc-500">WhatsApp Business</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 bg-zinc-50 flex flex-col gap-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'business' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                          message.sender === 'business'
                            ? 'rounded-br-none bg-amber-600 text-white'
                            : 'rounded-bl-none border border-zinc-200 bg-white text-zinc-900'
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

                <div className="flex-shrink-0 border-t border-zinc-200 bg-white px-4 py-4">
                  <div className="flex flex-row items-center justify-between w-full gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="flex h-9 w-9 items-center justify-center flex-shrink-0 rounded-full bg-amber-600 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {globalTab === 'tools' && (
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-lg font-semibold text-zinc-900">Tools</h2>
              <p className="mt-1 text-xs text-zinc-500">Administrative workspace for quick actions.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {TOOL_ACTIONS.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => handleToolAction(tool.text)}
                    className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-amber-600">
                      <Zap size={18} />
                    </div>
                    <p className="mt-3 font-semibold text-zinc-900">{tool.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">Send a mock card into chat</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {globalTab === 'settings' && (
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-lg font-semibold text-zinc-900">Connected Channels</h2>
              <p className="mt-1 text-xs text-zinc-500">Omni-channel integrations and connection status.</p>
              <div className="mt-6 space-y-3">
                {CHANNELS.map((channel) => (
                  <div key={channel.id} className={`rounded-2xl border px-6 py-4 ${channel.isActive ? 'border-zinc-200 bg-white' : 'border-zinc-100 bg-zinc-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg flex-shrink-0 ${channel.isActive ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        <channel.Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">{channel.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{channel.description}</p>
                        <div className="mt-3">
                          {channel.isActive ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Connected
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white md:static">
        <div className="flex items-center justify-around px-4 py-3 md:justify-start md:gap-2">
          <button
            onClick={() => {
              setGlobalTab('chats');
              setShowThread(false);
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              globalTab === 'chats' ? 'bg-amber-100 text-amber-900' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <MessageSquare size={18} />
            <span className="hidden sm:inline">Chats</span>
          </button>
          <button
            onClick={() => setGlobalTab('tools')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              globalTab === 'tools' ? 'bg-amber-100 text-amber-900' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Zap size={18} />
            <span className="hidden sm:inline">Tools</span>
          </button>
          <button
            onClick={() => setGlobalTab('settings')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              globalTab === 'settings' ? 'bg-amber-100 text-amber-900' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
