'use client';

import { useEffect, useState } from 'react';
import BusinessOnboarding from '@/components/BusinessOnboarding';
import Auth from '@/components/Auth';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import PluginContainer from '@/components/PluginContainer';
import { supabase, Chat, Business } from '@/lib/supabase';

export default function Home() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [panel, setPanel] = useState<'chats' | 'chat' | 'plugins'>('chats');

  useEffect(() => {
    async function loadBusiness() {
      const { data } = await supabase.from('businesses').select('*').limit(1).single();
      if (data) {
        setBusiness(data as Business);
      }
      setLoading(false);
    }
    loadBusiness();
  }, []);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setSessionLoading(false);
      supabase.auth.onAuthStateChange((_event, sess) => {
        setIsAuthenticated(!!sess?.access_token);
      });
    }
    checkSession();
  }, []);

  if (loading || sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090f] text-[#9090a8]">
        Loading business profile...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onSignedIn={() => setIsAuthenticated(true)} />;
  }

  if (!business) {
    return <BusinessOnboarding onCompleted={(newBusiness) => setBusiness(newBusiness)} />;
  }

  return (
    <div className="flex min-h-screen w-screen flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#2a2a3a] bg-[#13131a] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-[#6c63ff] flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">iF</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
              in<span className="text-[#6c63ff]">Flow</span>
            </p>
            <p className="text-[11px] text-[#9090a8] truncate block">{business.business_name}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#9090a8] text-xs">Live</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden md:flex-row flex-col pt-12 pb-12 md:pt-0 md:pb-0">
        {/* Column 1 – Chat List */}
        <div className={`${panel === 'chats' ? 'flex' : 'hidden'} min-h-0 md:flex md:w-1/4 md:min-w-[240px] md:flex-col md:border-r md:border-[#2a2a3a]`}>
          <ChatList
            activeChat={activeChat}
            onSelectChat={(chat) => {
              setActiveChat(chat);
              setPanel('chat');
            }}
          />
        </div>

        {/* Column 2 – Chat Window */}
        <div className={`${panel === 'chat' ? 'flex' : 'hidden'} w-full flex-1 min-h-0 flex-col md:w-2/4 md:border-r md:border-[#2a2a3a]`}> 
          <ChatWindow activeChat={activeChat} />
        </div>

        {/* Column 3 – Plugin Container */}
        <div className={`${panel === 'plugins' ? 'flex' : 'hidden'} min-h-0 md:flex md:w-1/4 md:min-w-[280px] md:flex-col`}>
          <PluginContainer activeChat={activeChat} business={business} onBusinessUpdate={setBusiness} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#2a2a3a] bg-[#13131a] p-2 md:hidden">
        <button
          onClick={() => setPanel('chats')}
          className={`w-1/3 rounded-2xl px-3 py-2 text-sm font-medium transition ${panel === 'chats' ? 'bg-[#1f1b38] text-white' : 'text-[#9090a8] hover:text-white'}`}
        >
          Chats
        </button>
        <button
          onClick={() => setPanel('chat')}
          className={`w-1/3 rounded-2xl px-3 py-2 text-sm font-medium transition ${panel === 'chat' ? 'bg-[#1f1b38] text-white' : 'text-[#9090a8] hover:text-white'}`}
        >
          Conversation
        </button>
        <button
          onClick={() => setPanel('plugins')}
          className={`w-1/3 rounded-2xl px-3 py-2 text-sm font-medium transition ${panel === 'plugins' ? 'bg-[#1f1b38] text-white' : 'text-[#9090a8] hover:text-white'}`}
        >
          Tools
        </button>
      </div>
    </div>
  );
}
