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

interface BusinessOnboardingProps {
  onCompleted: (business: Business) => void;
}

export default function BusinessOnboarding({ onCompleted }: BusinessOnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
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
    if (!validateStepOne()) {
      return;
    }
    setStep(2);
  }

  async function handleConnectWhatsApp() {
    if (!whatsappNumber.trim()) {
      setError('WhatsApp business number is required.');
      return;
    }

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
          whatsapp_number: whatsappNumber.trim(),
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (insertError || !data) {
      console.error('[BusinessOnboarding] insert error', insertError);
      setError('Unable to create your account right now. Please try again.');
      return;
    }

    onCompleted(data as any);
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

        {step === 1 ? (
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
                Continue to WhatsApp setup
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Connect your WhatsApp Business number</p>
              <p className="text-sm text-[#9090a8]">
                Enter the WhatsApp Business phone number that will receive customer messages. This links your account to the messaging channel.
              </p>
            </div>

            <label className="space-y-2 text-sm text-[#e8e8f0]">
              <span>WhatsApp Business number</span>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +1234567890"
                className="w-full rounded-2xl border border-[#2a2a3a] bg-[#15151d] px-4 py-3 text-sm text-white outline-none focus:border-[#6c63ff]"
              />
            </label>

            {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border border-[#2a2a3a] px-5 py-3 text-sm text-white transition hover:border-[#6c63ff]"
              >
                Back to business details
              </button>
              <button
                type="button"
                onClick={handleConnectWhatsApp}
                disabled={saving}
                className="rounded-2xl bg-[#6c63ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c73ff] disabled:opacity-50"
              >
                Link WhatsApp number
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
