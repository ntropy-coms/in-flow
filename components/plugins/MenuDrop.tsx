'use client';

import { useState } from 'react';
import { ShoppingBag, Send, Plus, Minus } from 'lucide-react';
import { supabase, Chat } from '@/lib/supabase';

interface MenuDropProps {
  activeChat: Chat | null;
}

const MENU_ITEMS = [
  { id: 'q1', name: 'Quarter Leg & Chips', price: 55 },
  { id: 'bw', name: 'Boerewors Roll', price: 40 },
  { id: 'sd', name: 'Soft Drink', price: 15 },
  { id: 'cb', name: 'Chicken Burger', price: 65 },
  { id: 'fp', name: 'Gatsbys (Large)', price: 90 },
  { id: 'pw', name: 'Pap & Wors', price: 50 },
];

export default function MenuDrop({ activeChat }: MenuDropProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);

  function adjust(id: string, delta: number) {
    setQuantities((prev) => {
      const next = { ...prev };
      const val = (next[id] ?? 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  }

  const orderItems = MENU_ITEMS.filter((i) => (quantities[i.id] ?? 0) > 0);
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * quantities[i.id], 0);

  async function handleSend() {
    if (!activeChat || orderItems.length === 0) return;
    setSending(true);

    const lines = orderItems
      .map((i) => `• ${i.name} x${quantities[i.id]} — R${i.price * quantities[i.id]}`)
      .join('\n');

    const orderText =
      `🍽️ *Order Summary*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `${lines}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Total: R${subtotal}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Reply YES to confirm your order! 🔥`;

    await supabase.from('messages').insert({
      chat_id: activeChat.id,
      sender: 'business',
      body: orderText,
    });

    await supabase
      .from('chats')
      .update({
        last_message: `Order: R${subtotal}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeChat.id);

    setQuantities({});
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShoppingBag size={16} className="text-amber-600" />
        <h3 className="text-sm font-bold text-zinc-900">MenuDrop</h3>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {MENU_ITEMS.map((item) => {
          const qty = quantities[item.id] ?? 0;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-3 py-2.5 w-full max-w-full"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 truncate">{item.name}</p>
                <p className="text-[10px] text-zinc-600">R{item.price}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {qty > 0 && (
                  <button
                    onClick={() => adjust(item.id, -1)}
                    className="w-8 h-8 rounded-md bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                  >
                    <Minus size={12} className="text-zinc-700" />
                  </button>
                )}
                {qty > 0 && (
                  <span className="text-sm text-amber-600 font-bold w-6 text-center">
                    {qty}
                  </span>
                )}
                <button
                  onClick={() => adjust(item.id, 1)}
                  className="w-8 h-8 rounded-md bg-amber-600 hover:bg-amber-700 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Plus size={12} className="text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      {orderItems.length > 0 && (
        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 flex justify-between items-center">
          <span className="text-xs text-zinc-600">
            {orderItems.length} item{orderItems.length > 1 ? 's' : ''}
          </span>
          <span className="text-sm font-bold text-amber-600">R{subtotal}</span>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={orderItems.length === 0 || !activeChat || sending}
        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        <Send size={14} />
        Send Order Summary
      </button>
    </div>
  );
}
