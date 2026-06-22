import { NextResponse } from 'next/server';

type ConnectRequest = {
  business_id?: string;
  code?: string;
  waba_id?: string;
  phone_number_id?: string;
};

export async function POST(request: Request) {
  try {
    const body: ConnectRequest = await request.json();
    const { business_id, code, waba_id, phone_number_id } = body;

    if (!business_id || !code) {
      return NextResponse.json({ error: 'Missing business_id or code' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const metaAppSecret = process.env.META_APP_SECRET;
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server database configuration missing' }, { status: 500 });
    }

    // Step 1: Exchange the authorization code for a user access token.
    // Note: config_id-based Facebook Login for Business returns a `code`,
    // not a token directly — this is a standard OAuth code exchange.
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Meta Code Exchange Error:', tokenData);
      return NextResponse.json({ error: 'Failed Meta token validation check' }, { status: 502 });
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for a long-lived token
    const exchangeUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${shortLivedToken}`;

    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok || !exchangeData.access_token) {
      console.error('Meta Long-Lived Token Exchange Error:', exchangeData);
      return NextResponse.json({ error: 'Failed Meta long-lived token exchange' }, { status: 502 });
    }

    const longLivedToken = exchangeData.access_token;

    // Step 3: Resolve WABA ID — prefer the value captured during Embedded
    // Signup (most reliable), fall back to API lookup if it's missing.
    let resolvedWabaId = waba_id;
    if (!resolvedWabaId) {
      const wabaUrl = `https://graph.facebook.com/v20.0/me/whatsapp_business_accounts?access_token=${longLivedToken}`;
      const wabaRes = await fetch(wabaUrl);
      const wabaData = await wabaRes.json();

      if (!wabaRes.ok || !wabaData.data || wabaData.data.length === 0) {
        return NextResponse.json({ error: 'No authorized WhatsApp Business Accounts found.' }, { status: 400 });
      }
      resolvedWabaId = wabaData.data[0].id;
    }

    // Step 4: Resolve phone number ID — same preference order as above.
    let resolvedPhoneNumberId = phone_number_id;
    let displayPhoneNumber: string | undefined;

    if (!resolvedPhoneNumberId) {
      const phoneUrl = `https://graph.facebook.com/v20.0/${resolvedWabaId}/phone_numbers?access_token=${longLivedToken}`;
      const phoneRes = await fetch(phoneUrl);
      const phoneData = await phoneRes.json();

      if (!phoneRes.ok || !phoneData.data || phoneData.data.length === 0) {
        return NextResponse.json({ error: 'No active phone lines discovered on that account.' }, { status: 400 });
      }

      resolvedPhoneNumberId = phoneData.data[0].id;
      displayPhoneNumber = phoneData.data[0].display_phone_number;
    } else {
      // We have the phone_number_id from Embedded Signup already —
      // fetch its display number for storage/display purposes.
      const phoneDetailUrl = `https://graph.facebook.com/v20.0/${resolvedPhoneNumberId}?fields=display_phone_number&access_token=${longLivedToken}`;
      const phoneDetailRes = await fetch(phoneDetailUrl);
      const phoneDetailData = await phoneDetailRes.json();
      displayPhoneNumber = phoneDetailData?.display_phone_number;
    }

    // Step 5: Save metadata mapping directly to your Supabase business profile
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${business_id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        whatsapp_number: displayPhoneNumber,
        whatsapp_waba_id: resolvedWabaId,
        whatsapp_phone_number_id: resolvedPhoneNumberId,
        whatsapp_access_token: longLivedToken,
        whatsapp_verified: true,
        updated_at: new Date().toISOString(),
      }),
    });

    const updateJson = await updateRes.json();
    if (!updateRes.ok) {
      console.error('Database write error:', updateJson);
      return NextResponse.json({ error: 'Failed to record secure channel state.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, business: updateJson[0] });
  } catch (err) {
    console.error('WhatsApp connect route error:', err);
    return NextResponse.json({ error: 'Invalid processing request' }, { status: 400 });
  }
}
