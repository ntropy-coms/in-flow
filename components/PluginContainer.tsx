'use client';

import { useState } from 'react';
import { FileText, CalendarCheck, Calculator, ShoppingBag, MapPin } from 'lucide-react';
import { Chat, Business } from '@/lib/supabase';
import FastInvoice from '@/components/plugins/FastInvoice';
import BookedIt from '@/components/plugins/BookedIt';
import QuoteCraft from '@/components/plugins/QuoteCraft';
import MenuDrop from '@/components/plugins/MenuDrop';
import PinTracker from '@/components/plugins/PinTracker';
import BusinessSettings from '@/components/BusinessSettings';

interface PluginContainerProps {
  activeChat: Chat | null;
  business?: Business | null;
  onBusinessUpdate?: (b: Business) => void;
}

const TABS = [
  { id: 'invoice', icon: FileText, label: 'Invoice' },
  { id: 'booked', icon: CalendarCheck, label: 'Booked' },
  { id: 'quote', icon: Calculator, label: 'Quote' },
  { id: 'menu', icon: ShoppingBag, label: 'Menu' },
  { id: 'pin', icon: MapPin, label: 'Pin' },
  { id: 'settings', icon: MapPin, label: 'Settings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function PluginContainer({ activeChat, business, onBusinessUpdate }: PluginContainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('invoice');

  function renderPlugin() {
    switch (activeTab) {
      case 'invoice':
        return <FastInvoice activeChat={activeChat} />;
      case 'booked':
        return <BookedIt activeChat={activeChat} />;
      case 'quote':
        return <QuoteCraft activeChat={activeChat} />;
      case 'menu':
        return <MenuDrop activeChat={activeChat} />;
      case 'pin':
        return <PinTracker activeChat={activeChat} />;
      case 'settings':
        return (
          <div>
            {business ? (
              <BusinessSettings business={business} onUpdated={(b) => onBusinessUpdate?.(b)} />
            ) : (
              <div className="text-sm text-[#9090a8]">No business profile found.</div>
            )}
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#13131a]">
      {/* Tab bar */}
      <div className="flex border-b border-[#2a2a3a] bg-[#0a0a0f]">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            title={label}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === id
                ? 'text-[#6c63ff] border-b-2 border-[#6c63ff]'
                : 'text-[#4a4a5a] hover:text-[#9090a8]'
            }`}
          >
            <Icon size={16} />
            <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* Plugin area */}
      <div className="flex-1 overflow-y-auto p-3">{renderPlugin()}</div>
    </div>
  );
}
