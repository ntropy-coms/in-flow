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

// Configuration ID from Meta App Dashboard -> Facebook Login for Business -> Configurations
const META_CONFIG_ID = '2301977283876651';

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

    // Embedded Signup posts WABA/phone details here via window.postMessage
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;

      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'WA_EMBEDDED_SIGNUP') return;

        if (data.event === 'FINISH') {
          const { phone_number_id, waba_id } = data.data || {};
          if (phone_number_id && waba_id) {
            // Stash for use once FB.login's callback fires with the auth code
            window.sessionStorage.setItem(
              'wa_embedded_signup',
              JSON.stringify({ phone_number_id, waba_id })
            );
          }
        } else if (data.event === 'CANCEL' || data.event === 'ERROR') {
          console.warn('WhatsApp Embedded Signup did not complete:', data);
        }
      } catch (e) {
        // Not a JSON message we care about — ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      setLoading(false);
      setError('Login timed out — the auth dialog may be blocked by your browser. Please allow popups and try again.');
    }, 30000);

    try {
      window.FB.login(
        (response: any) => {
          clearTimeout(timer);
          if (timedOut) return;

          if (response?.authResponse?.code) {
            const authCode = response.authResponse.code;

            // Pull the WABA/phone details captured by the postMessage listener
            let signupMeta: { phone_number_id?: string; waba_id?: string } = {};
            try {
              const raw = window.sessionStorage.getItem('wa_embedded_signup');
              if (raw) signupMeta = JSON.parse(raw);
            } catch (e) {
              // ignore parse errors, route will fall back to API lookup
            }

            fetch('/api/whatsapp/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                business_id: business.id,
                code: authCode,
                waba_id: signupMeta.waba_id,
                phone_number_id: signupMeta.phone_number_id,
              }),
            })
              .then(async (apiRes) => {
                let data: any = {};
                try {
                  data = await apiRes.json();
                } catch (e) {
                  // ignore JSON parse errors
                }

                if (!apiRes.ok) {
                  const message = data?.error || data?.message || `Server responded with status ${apiRes.status}`;
                  throw new Error(message);
                }

                setSuccess('Your WhatsApp Business channel has been successfully tied to inFlow!');
                if (data.business) onUpdated(data.business);
                window.sessionStorage.removeItem('wa_embedded_signup');
              })
              .catch((err: any) => {
                setError(err?.message || 'An error occurred during onboarding.');
              })
              .finally(() => {
                setLoading(false);
              });
          } else {
            setError('Onboarding cancelled or permissions were not fully authorized.');
            setLoading(false);
          }
        },
        {
          config_id: META_CONFIG_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: '3',
          },
        }
      );
    } catch (err: any) {
      clearTimeout(timer);
      setLoading(false);
      setError(err?.message || 'Facebook login failed to start.');
    }
  };

  // Run diagnostics first, then attempt login if diagnostics pass
  const attemptConnectWithDiagnostics = () => {
    setError('');
    setSuccess('');
    setLoading(true);
    fetch('/api/whatsapp/diagnostics', { method: 'POST' })
      .then((res) => res.json().then(data => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok || !data?.ok) {
          setError(data?.error || 'Diagnostics failed.');
          setLoading(false);
          return;
        }

        const diag = data.result;
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

        handleEmbeddedSignup();
      })
      .catch((err: any) => {
        setError(err?.message || 'Diagnostics request failed');
        setLoading(false);
      });
  };

  return (
    <>
      <div id="fb-root" />
      <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-zinc-900">WhatsApp Integration</h3>
        <p className="text-sm text-zinc-600 mt-2">
          Link your WhatsApp Business profile seamlessly via Meta Secure OAuth.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900">Status</p>
            <p className="text-xs text-zinc-500 mt-1 truncate">
              {business.whatsapp_phone_number_id 
                ? `Connected to ${business.whatsapp_number}` 
                : 'Not integrated'}
            </p>
          </div>
          <div className="flex gap-2 items-center sm:items-stretch">
            <button
              onClick={attemptConnectWithDiagnostics}
              disabled={loading}
              className="rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Connecting...' : business.whatsapp_phone_number_id ? 'Reconnect Channel' : 'Connect WhatsApp'}
            </button>
            <button
              onClick={attemptConnectWithDiagnostics}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 min-h-[44px]"
            >
              Retry
            </button>
            <button
              onClick={() => setShowTroubleshoot(true)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 min-h-[44px]"
            >
              Troubleshoot
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
        {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{success}</p>}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-xs font-semibold text-zinc-900">How it works</p>
        <ul className="mt-3 space-y-2 text-xs text-zinc-600 list-disc list-inside">
          <li>Authenticate your official business account via Meta's dialog securely.</li>
          <li>Select the specific active WhatsApp phone number you want to track.</li>
          <li>Inbound client messages will stream natively into your inFlow smart inbox.</li>
        </ul>
      </div>
      {showTroubleshoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="w-[90%] max-w-lg rounded-lg bg-white border border-zinc-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">WhatsApp Troubleshooting</h4>
                <p className="text-xs text-zinc-500 mt-1">Steps to resolve common connection issues.</p>
              </div>
              <button onClick={() => setShowTroubleshoot(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>

            <ol className="mt-4 space-y-2 text-xs text-zinc-700 list-decimal list-inside">
              <li>Allow popups and redirects for this site in your browser.</li>
              <li>Make sure third-party cookies are enabled or try in a private window.</li>
              <li>Check that your Meta app ID (NEXT_PUBLIC_META_APP_ID) is configured and correct.</li>
              <li>If using browser extensions, temporarily disable blockers that may interfere.</li>
              <li>Try again with the <strong>Retry</strong> button after applying the steps above.</li>
            </ol>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowTroubleshoot(false)} className="rounded-lg px-4 py-2 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-50">Done</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
