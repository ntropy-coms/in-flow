'use client';

import { useState } from 'react';
import { supabase, Business } from '@/lib/supabase';

const CATEGORY_OPTIONS = [
  'Retail',
  'Food',
  'Services',
  'Beauty',
  'Health',
  'Education',
  'Wellness',
  'Other',
] as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneDigitsRegex = /^\+\d{8,15}$/;

function normalizeWhatsAppNumber(value: string) {
  const cleaned = value.replace(/[^\d+]/g, '');
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return `+${digitsOnly}`;
}

function formatWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length <= 3) {
    return `+${digits}`;
  }

  const country = digits.slice(0, 3);
  const rest = digits.slice(3);
  const groups = rest.match(/.{1,3}/g) ?? [];
  return `+${country} ${groups.join(' ')}`;
}

interface BusinessOnboardingProps {
  onCompleted: (business: Business) => void;
}

export default function BusinessOnboarding({ onCompleted }: BusinessOnboardingProps) {
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  // onboarding no longer requires linking WhatsApp — that's done from dashboard
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((item) => item !== category));
      setError('');
      return;
    }

    if (selectedCategories.length >= 2) {
      setError('You can choose up to 2 categories.');
      return;
    }

    setSelectedCategories((prev) => [...prev, category]);
    setError('');
  }

  function validateStepOne() {
    if (!businessName.trim()) {
      setError('Business name is required.');
      return false;
    }
    if (selectedCategories.length === 0) {
      setError('Select at least one category.');
      return false;
    }
    if (!address.trim()) {
      setError('Address is required.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleCreateAccount() {
    if (!validateStepOne()) return;

    setSaving(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('businesses')
      .insert([
        {
          business_name: businessName.trim(),
          categories: selectedCategories,
          address: address.trim(),
          email: email.trim(),
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (insertError || !data) {
      console.error('[BusinessOnboarding] insert error', insertError);
      if (
        insertError?.code === 'PGRST205' ||
        insertError?.message?.toLowerCase().includes('could not find')
      ) {
        setError(
          'Database table not found. Please create the businesses table in Supabase before continuing.'
        );
      } else {
        setError('Unable to create your account right now. Please try again.');
      }
      return;
    }

    onCompleted(data as Business);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090f] px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-[#2a2a3a] bg-[#111118] p-8 shadow-xl shadow-black/20">
        <div className="mb-6 border-b border-[#2a2a3a] pb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-[#6c63ff]">Welcome to inFlow</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Set up your business account</h1>
          <p className="mt-2 text-sm text-[#9090a8]">
            Create your business profile, choose your categories, and connect your WhatsApp Business number.
          </p>
        </div>

        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[#e8e8f0]">
                <span>Business name</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sunrise Salon"
                  className="w-full rounded-2xl border border-[#2a2a3a] bg-[#15151d] px-4 py-3 text-sm text-white outline-none focus:border-[#6c63ff]"
                />
              </label>
              <label className="space-y-2 text-sm text-[#e8e8f0]">
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@business.com"
                  className="w-full rounded-2xl border border-[#2a2a3a] bg-[#15151d] px-4 py-3 text-sm text-white outline-none focus:border-[#6c63ff]"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-[#e8e8f0]">
              <span>Address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Business Avenue, City"
                className="w-full rounded-2xl border border-[#2a2a3a] bg-[#15151d] px-4 py-3 text-sm text-white outline-none focus:border-[#6c63ff]"
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Categories</p>
                  <p className="text-xs text-[#9090a8]">Choose up to 2 categories that match your business.</p>
                </div>
                <span className="text-xs text-[#6c63ff]">{selectedCategories.length}/2 selected</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? 'border-[#6c63ff] bg-[#1f1b38] text-white'
                        : 'border-[#2a2a3a] bg-[#12121b] text-[#c8c8d0] hover:border-[#6c63ff] hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

            <div className="flex justify-end">
              <button
                onClick={handleCreateAccount}
                disabled={saving}
                className="rounded-2xl bg-[#6c63ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c73ff] disabled:opacity-50"
              >
                Finish setup
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
