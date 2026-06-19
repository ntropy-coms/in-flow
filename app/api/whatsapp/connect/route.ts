import { NextResponse } from 'next/server';

type ConnectRequest = {
  business_id?: string;
  access_token?: string;
};

export async function POST(request: Request) {
  try {
    const body: ConnectRequest = await request.json();
    const { business_id, access_token } = body;

    if (!business_id || !access_token) {
      return NextResponse.json({ error: 'Missing business_id or access_token' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const metaAppSecret = process.env.META_APP_SECRET;
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server database configuration missing' }, { status: 500 });
    }

    // Step 1: Exchange short-lived token for a long-lived access token
    const tokenExchangeUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${access_token}`;
    
    const exchangeRes = await fetch(tokenExchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok) {
      console.error('Meta Token Exchange Error:', exchangeData);
      return NextResponse.json({ error: 'Failed Meta token validation check' }, { status: 502 });
    }

    const longLivedToken = exchangeData.access_token;

    // Step 2: Fetch shared WhatsApp Business Accounts (WABA)
    const wabaUrl = `https://graph.facebook.com/v20.0/me/whatsapp_business_accounts?access_token=${longLivedToken}`;
    const wabaRes = await fetch(wabaUrl);
    const wabaData = await wabaRes.json();

    if (!wabaRes.ok || !wabaData.data || wabaData.data.length === 0) {
      return NextResponse.json({ error: 'No authorized WhatsApp Business Accounts found.' }, { status: 400 });
    }

    const wabaId = wabaData.data[0].id;

    // Step 3: Fetch phone numbers tied to that specific WABA account
    const phoneUrl = `https://graph.facebook.com/v20.0/${wabaId}/phone_numbers?access_token=${longLivedToken}`;
    const phoneRes = await fetch(phoneUrl);
    const phoneData = await phoneRes.json();

    if (!phoneRes.ok || !phoneData.data || phoneData.data.length === 0) {
      return NextResponse.json({ error: 'No active phone lines discovered on that account.' }, { status: 400 });
    }

    const targetPhone = phoneData.data[0];
    const phoneNumberId = targetPhone.id;
    const displayPhoneNumber = targetPhone.display_phone_number;

    // Step 4: Save metadata mapping directly to your Supabase business profile
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
        whatsapp_waba_id: wabaId,
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_access_token: longLivedToken,
        whatsapp_verified: true,
        updated_at: new Date().toISOString(),
      }),
    });

    const updateJson = await updateRes.json();
    if (!updateRes.ok) {
      console.error('Database write error:', updateJson);
      return NextResponse.json({ error: 'Failed to record secure channel states.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, business: updateJson[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid processing request loop' }, { status: 400 });
  }
}
