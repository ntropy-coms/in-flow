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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center h-12 px-5 bg-[#13131a] border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#6c63ff] flex items-center justify-center">
            <span className="text-white text-xs font-bold">iF</span>
          </div>
          <span className="text-white font-semibold tracking-wide text-sm">
            in<span className="text-[#6c63ff]">Flow</span>
          </span>
          <span className="ml-4 text-sm text-[#e8e8f0] truncate">{business.business_name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#9090a8] text-xs">Live</span>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 pt-12">
        {/* Column 1 – Chat List (1/4) */}
        <div className="w-1/4 min-w-[240px] border-r border-[#2a2a3a] flex flex-col">
          <ChatList activeChat={activeChat} onSelectChat={setActiveChat} />
        </div>

        {/* Column 2 – Chat Window (2/4) */}
        <div className="w-2/4 flex flex-col border-r border-[#2a2a3a]">
          <ChatWindow activeChat={activeChat} />
        </div>

        {/* Column 3 – Plugin Container (1/4) */}
        <div className="w-1/4 min-w-[280px] flex flex-col">
          <PluginContainer activeChat={activeChat} business={business} onBusinessUpdate={setBusiness} />
        </div>
      </div>
    </div>
  );
}
