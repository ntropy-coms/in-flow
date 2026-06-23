'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, Chat, Message } from '@/lib/supabase';
import { Send, MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  activeChat: Chat | null;
}

export default function ChatWindow({ activeChat }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChat!.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    }
    fetchMessages();
  }, [activeChat]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!activeChat) return;

    const channel = supabase
      .channel(`messages-${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !activeChat || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);

    try {
      // Send via Meta WhatsApp API
      await fetch(
        `https://graph.facebook.com/v20.0/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: activeChat.id,
            type: 'text',
            text: { body },
          }),
        }
      );

      // Record outbound message in Supabase
      await supabase.from('messages').insert({
        chat_id: activeChat.id,
        sender: 'business',
        body,
      });

      // Update chat last_message
      await supabase
        .from('chats')
        .update({ last_message: body, updated_at: new Date().toISOString() })
        .eq('id', activeChat.id);
    } catch (err) {
      console.error('[send]', err);
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!activeChat) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center p-6 h-full min-h-[50dvh]">
        <MessageSquare size={56} strokeWidth={2} className="text-zinc-300 mb-4" />
        <p className="text-sm text-zinc-600">Select a conversation to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-white">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">
            {(activeChat.name ?? activeChat.id).slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 truncate max-w-[180px]">
            {activeChat.name ?? activeChat.id}
          </p>
          <p className="text-[11px] text-zinc-500 truncate max-w-[180px]">+{activeChat.id}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                msg.sender === 'business'
                  ? 'bg-amber-600 text-white rounded-br-none'
                  : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-none'
              }`}
            >
              <p>{msg.body}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === 'business' ? 'text-amber-100' : 'text-zinc-500'
                } text-right`}
              >
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-zinc-200 bg-white">
        <div className="flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
          <textarea
            rows={1}
            placeholder="Type a reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none resize-none max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
