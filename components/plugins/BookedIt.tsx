'use client';

import { useState } from 'react';
import { CalendarCheck, Send } from 'lucide-react';
import { supabase, Chat } from '@/lib/supabase';

interface BookedItProps {
  activeChat: Chat | null;
}

const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookedIt({ activeChat }: BookedItProps) {
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function toggleSlot(slot: string) {
    if (booked.has(slot)) return; // can't unbook directly
    setSelected(slot === selected ? null : slot);
  }

  function bookSlot(slot: string) {
    setBooked((prev) => new Set([...prev, slot]));
    setSelected(null);
  }

  async function sendConfirmation() {
    if (!selected || !activeChat) return;
    setSending(true);

    const today = new Date().toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const confirmText =
      `📅 *Appointment Confirmed*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Date: ${today}\n` +
      `Time: ${selected}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Please arrive 5 minutes early.\n` +
      `Reply CANCEL to reschedule. ✅`;

    await supabase.from('messages').insert({
      chat_id: activeChat.id,
      sender: 'business',
      body: confirmText,
    });

    await supabase
      .from('chats')
      .update({
        last_message: `Booking confirmed: ${selected}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeChat.id);

    bookSlot(selected);
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CalendarCheck size={16} className="text-amber-600" />
        <h3 className="text-sm font-bold text-zinc-900">BookedIt</h3>
      </div>

      <p className="text-xs text-zinc-600">
        Today&apos;s slots — tap an available slot to select it
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-full">
        {SLOTS.map((slot) => {
          const isBooked = booked.has(slot);
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              onClick={() => toggleSlot(slot)}
              disabled={isBooked}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isBooked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                  : isSelected
                  ? 'bg-amber-600 text-white border border-amber-600'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              {slot}
              {isBooked && (
                <span className="block text-[9px] mt-0.5 text-emerald-600 font-medium">Booked</span>
              )}
              {!isBooked && !isSelected && (
                <span className="block text-[9px] mt-0.5 text-zinc-500">Free</span>
              )}
            </button>
          );
        })}
      </div>

      {selected && activeChat && (
        <div className="bg-zinc-50 rounded-lg p-3 border border-amber-200 text-xs text-zinc-700 w-full max-w-full">
          <span className="text-amber-600 font-medium">Draft:</span> Appointment at {selected}
        </div>
      )}

      <button
        onClick={sendConfirmation}
        disabled={!selected || !activeChat || sending}
        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        <Send size={14} />
        Confirm & Send Booking
      </button>
    </div>
  );
}
