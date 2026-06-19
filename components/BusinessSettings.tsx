'use client';

import { useState } from 'react';
import { supabase, Business } from '@/lib/supabase';

interface Props {
  business: Business;
  onUpdated: (b: Business) => void;
}

function normalizeWhatsAppNumber(value: string) {
  const cleaned = value.replace(/[^^\d+]/g, '').replace(/\D/g, '');
  if (!cleaned) return '';
  return `+${cleaned}`;
}

export default function BusinessSettings({ business, onUpdated }: Props) {
  const [number, setNumber] = useState(business.whatsapp_number ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [confirming, setConfirming] = useState(false);

  async function handleLink() {
    setError('');
    setSuccess('');
    const normalized = normalizeWhatsAppNumber(number);
    if (!normalized) {
      setError('Enter a phone number');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .update({ whatsapp_number: normalized, updated_at: new Date().toISOString() })
      .eq('id', business.id)
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError('Failed to link number.');
      console.error(error);
      return;
    }
    setSuccess('Number linked');
    onUpdated(data as Business);
  }

  async function handleVerify() {
    setError('');
    setSuccess('');
    const normalized = normalizeWhatsAppNumber(number);
    if (!normalized) {
      setError('Enter a phone number');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_number: normalized, business_id: business.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Verification failed');
        setApiErrorDetails(json?.details ? JSON.stringify(json.details, null, 2) : null);
      } else {
        setSuccess('Verification message sent — check the number for a code.');
        setApiErrorDetails(null);
      }
    } catch (e) {
      console.error(e);
      setError('Verification request failed.');
      setApiErrorDetails(String(e));
    } finally {
      setVerifying(false);
    }
  }

  async function handleConfirm() {
    setError('');
    setSuccess('');
    if (!codeInput) {
      setError('Enter the verification code');
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch('/api/whatsapp/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: business.id, code: codeInput }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Confirmation failed');
      } else {
        setSuccess('Number verified and linked.');
        onUpdated(json.business as Business);
      }
    } catch (e) {
      console.error(e);
      setError('Confirmation request failed.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Business Settings</h3>
      <label className="text-sm text-[#e8e8f0] block">
        WhatsApp Business number
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="+27..." className="w-full mt-2 rounded-lg px-3 py-2 bg-[#12121b] text-white outline-none" />
      </label>
      {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}
      {success && <p className="text-sm text-[#7be495]">{success}</p>}
      <div className="flex gap-2">
          <button onClick={handleLink} disabled={loading} className="rounded-2xl bg-[#6c63ff] px-4 py-2 text-white">Link WhatsApp</button>
          <button onClick={handleVerify} disabled={verifying || !number} className="rounded-2xl border border-[#2a2a3a] px-4 py-2 text-white">Send verification</button>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm text-[#e8e8f0] block">
          Verification code
          <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="123456" className="w-full mt-2 rounded-lg px-3 py-2 bg-[#12121b] text-white outline-none" />
        </label>
        <div className="flex gap-2">
          <button onClick={handleConfirm} disabled={confirming} className="rounded-2xl bg-[#4ade80] px-4 py-2 text-black">Confirm code</button>
        </div>
      </div>
      {apiErrorDetails && (
        <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-[#0b0b0f] p-3 text-xs text-[#ffb4b4]">
          {apiErrorDetails}
        </pre>
      )}
    </div>
  );
}
