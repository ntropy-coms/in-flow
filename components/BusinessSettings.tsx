'use client';

import { useEffect, useState } from 'react';
import { supabase, Business } from '@/lib/supabase';

interface Props {
  business: Business;
  onUpdated: (b: Business) => void;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function BusinessSettings({ business, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v20.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.body.appendChild(js);
    }
  }, []);

  const handleEmbeddedSignup = () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!window.FB) {
      setError('Facebook SDK failed to load. Please refresh the page.');
      setLoading(false);
      return;
    }

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
          try {
            const apiRes = await fetch('/api/whatsapp/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                business_id: business.id,
                access_token: accessToken,
              }),
            });

            const data = await apiRes.json();

            if (!apiRes.ok) throw new Error(data.error || 'Failed to link account');

            setSuccess('Your WhatsApp Business channel has been successfully tied to inFlow!');
            if (data.business) onUpdated(data.business);
          } catch (err: any) {
            setError(err.message || 'An error occurred during onboarding.');
          } finally {
            setLoading(false);
          }
        } else {
          setError('Onboarding cancelled or permissions were not fully authorized.');
          setLoading(false);
        }
      },
      {
        scope: 'whatsapp_business_management, whatsapp_business_messaging, business_management',
        extras: {
          feature: 'whatsapp_embedded_signup',
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white">WhatsApp Integration</h3>
        <p className="text-sm text-[#9090a8] mt-1">
          Link your WhatsApp Business profile seamlessly via Meta Secure OAuth.
        </p>
      </div>

      <div className="bg-[#12121b] border border-[#1f1f2e] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Status</p>
            <p className="text-xs text-[#9090a8] mt-0.5">
              {business.whatsapp_phone_number_id 
                ? `Connected to ${business.whatsapp_number}` 
                : 'Not integrated'}
            </p>
          </div>
          
          <button
            onClick={handleEmbeddedSignup}
            disabled={loading}
            className="rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#7c73ff] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Connecting...' : business.whatsapp_phone_number_id ? 'Reconnect Channel' : 'Connect WhatsApp'}
          </button>
        </div>

        {error && <p className="text-xs text-[#ff6b6b] bg-[#2a1414] p-2.5 rounded-lg border border-[#4a1a1a]">{error}</p>}
        {success && <p className="text-xs text-[#7be495] bg-[#142a1e] p-2.5 rounded-lg border border-[#1a4a2e]">{success}</p>}
      </div>

      <div className="rounded-xl border border-[#1f1f2e] bg-[#0f0f16] p-4">
        <p className="text-xs font-medium text-white">How it works</p>
        <ul className="mt-2 space-y-2 text-xs text-[#9090a8] list-disc list-inside">
          <li>Authenticate your official business account via Meta's dialog securely.</li>
          <li>Select the specific active WhatsApp phone number you want to track.</li>
          <li>Inbound client messages will stream natively into your inFlow smart inbox.</li>
        </ul>
      </div>
    </div>
  
  );
}
