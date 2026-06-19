import { NextResponse } from 'next/server';

type VerifyRequest = {
  whatsapp_number?: string;
  business_id?: string;
};

export async function POST(request: Request) {
  try {
    const body: VerifyRequest = await request.json();
    const { whatsapp_number, business_id } = body;

    if (!whatsapp_number) {
      return NextResponse.json({ error: 'whatsapp_number is required' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      return NextResponse.json({ error: 'WhatsApp credentials not configured on server' }, { status: 500 });
    }

    // Generate a 6-digit code and persist it if Supabase service key is available
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      // insert verification code via Supabase REST
      try {
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/verification_codes`, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify([
            {
              business_id: business_id || null,
              whatsapp_number,
              code,
              expires_at: expiresAt,
            },
          ]),
        });
        const insertJson = await insertRes.json();
        if (!insertRes.ok) {
          console.error('Failed to persist verification code', insertJson);
        }
      } catch (e) {
        console.error('Persist error', e);
      }
    }

    // Send the verification message
    const payload = {
      messaging_product: 'whatsapp',
      to: whatsapp_number.replace(/\D/g, ''),
      type: 'text',
      text: { body: `Your inFlow verification code is: ${code}` },
    };

    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch((e) => ({ error: 'invalid-json-response', raw: String(e) }));

    // Log Meta response for debugging
    console.error('[whatsapp/verify] meta response status=', res.status, 'body=', data);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send verification message', details: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, details: data });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
