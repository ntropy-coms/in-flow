"use client";

import { useState } from "react";
import { FileText, CalendarCheck, Calculator, ShoppingBag, MapPin } from "lucide-react";
import { Chat, Business } from "@/lib/supabase";
import FastInvoice from "@/components/plugins/FastInvoice";
import BookedIt from "@/components/plugins/BookedIt";
import QuoteCraft from "@/components/plugins/QuoteCraft";
import MenuDrop from "@/components/plugins/MenuDrop";
import PinTracker from "@/components/plugins/PinTracker";
import BusinessSettings from "@/components/BusinessSettings";

interface PluginContainerProps {
  activeChat: Chat | null;
  business?: Business | null;
  onBusinessUpdate?: (b: Business) => void;
}

const TABS = [
  { id: "invoice", icon: FileText, label: "Invoice" },
  { id: "booked", icon: CalendarCheck, label: "Booked" },
  { id: "quote", icon: Calculator, label: "Quote" },
  { id: "menu", icon: ShoppingBag, label: "Menu" },
  { id: "pin", icon: MapPin, label: "Pin" },
  { id: "settings", icon: MapPin, label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PluginContainer({ activeChat, business, onBusinessUpdate }: PluginContainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("invoice");

  function renderPlugin() {
    switch (activeTab) {
      case "invoice":
        return <FastInvoice activeChat={activeChat} />;
      case "booked":
        return <BookedIt activeChat={activeChat} />;
      case "quote":
        return <QuoteCraft activeChat={activeChat} />;
      case "menu":
        return <MenuDrop activeChat={activeChat} />;
      case "pin":
        return <PinTracker activeChat={activeChat} />;
      case "settings":
        return (
          <div>
            {business ? (
              <BusinessSettings business={business} onUpdated={(b) => onBusinessUpdate?.(b)} />
            ) : (
              <div className="text-sm text-zinc-500">No business profile found.</div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* Tab bar: static header, mobile-first horizontal scrolling, touch-friendly */}
      <div className="flex-shrink-0 w-full relative">
        <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-none touch-scroll flex flex-row items-center gap-2 px-3 py-2 bg-white border-b border-zinc-200 md:overflow-visible md:flex-wrap">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={label}
              className={`flex-shrink-0 inline-flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-[44px] text-center transition-colors rounded-lg ${
                activeTab === id
                  ? "text-amber-600 bg-amber-50 border border-amber-100"
                  : "text-zinc-600 hover:text-zinc-900 bg-white border border-transparent"
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
        {/* subtle fade to indicate scrollable content on mobile */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-8 md:hidden"
          style={{ background: "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))" }}
        />
      </div>

      {/* Plugin area: scroll only this area, keep header and bottom nav fixed */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 max-w-full">{renderPlugin()}</div>
    </div>
  );
}
