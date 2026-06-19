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
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

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

    // Timeout in case the FB dialog is blocked or the callback never fires
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      setLoading(false);
      setError('Login timed out — the auth dialog may be blocked by your browser. Please allow popups and try again.');
    }, 20000);

    try {
      window.FB.login(
        async (response: any) => {
          clearTimeout(timer);
          if (timedOut) return;

          if (response?.authResponse) {
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

              let data: any = {};
              try { data = await apiRes.json(); } catch (e) { /* ignore JSON parse errors */ }

              if (!apiRes.ok) {
                const message = data?.error || data?.message || `Server responded with status ${apiRes.status}`;
                throw new Error(message);
              }

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
          extras: { feature: 'whatsapp_embedded_signup' },
        }
      );
    } catch (err: any) {
      clearTimeout(timer);
      setLoading(false);
      setError(err?.message || 'Facebook login failed to start.');
    }
  };

  // Run diagnostics first, then attempt login if diagnostics pass
  const attemptConnectWithDiagnostics = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/diagnostics', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Diagnostics failed.');
        setLoading(false);
        return;
      }

      const diag = data.result;
      // If any required env is missing or supabase check failed, show details
      const missing = Object.entries(diag.env).filter(([, v]) => !v).map(([k]) => k);
      if (missing.length > 0) {
        setError(`Missing env: ${missing.join(', ')}.`);
        setLoading(false);
        return;
      }

      if (!diag.supabase?.ok) {
        setError(`Supabase connectivity issue: ${diag.supabase?.error || 'unknown'}`);
        setLoading(false);
        return;
      }

      // Diagnostics passed — proceed with embedded signup
      handleEmbeddedSignup();
    } catch (err: any) {
      setError(err?.message || 'Diagnostics request failed');
      setLoading(false);
    }
  };

  return (
    <>
      {/* fb-root for SDK rendering */}
      <div id="fb-root" />
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
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmbeddedSignup}
              disabled={loading}
              className="rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#7c73ff] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Connecting...' : business.whatsapp_phone_number_id ? 'Reconnect Channel' : 'Connect WhatsApp'}
            </button>
            <button
              onClick={() => {
                setError('');
                setSuccess('');
                handleEmbeddedSignup();
              }}
              disabled={loading}
              className="rounded-xl border border-[#2a2a3a] px-3 py-2 text-xs text-[#e8e8f0] hover:bg-[#1a1a24] disabled:opacity-50"
            >
              Retry
            </button>
            <button
              onClick={() => setShowTroubleshoot(true)}
              className="rounded-xl border border-[#2a2a3a] px-3 py-2 text-xs text-[#9090a8] hover:bg-[#1a1a24]"
            >
              Troubleshoot
            </button>
          </div>
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
      {showTroubleshoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-lg rounded-xl bg-[#0f0f16] border border-[#2a2a3a] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">WhatsApp Troubleshooting</h4>
                <p className="text-xs text-[#9090a8] mt-1">Steps to resolve common connection issues.</p>
              </div>
              <button onClick={() => setShowTroubleshoot(false)} className="text-[#9090a8]">Close</button>
            </div>

            <ol className="mt-3 space-y-2 text-xs text-[#e8e8f0] list-decimal list-inside">
              <li>Allow popups and redirects for this site in your browser.</li>
              <li>Make sure third-party cookies are enabled or try in a private window.</li>
              <li>Check that your Meta app ID (NEXT_PUBLIC_META_APP_ID) is configured and correct.</li>
              <li>If using browser extensions, temporarily disable blockers that may interfere.</li>
              <li>Try again with the <strong>Retry</strong> button after applying the steps above.</li>
            </ol>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowTroubleshoot(false)} className="rounded-md px-3 py-2 text-xs border border-[#2a2a3a]">Done</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
