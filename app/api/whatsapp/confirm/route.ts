import { NextResponse } from 'next/server';

type ConfirmRequest = {
  business_id?: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body: ConfirmRequest = await request.json();
    const { business_id, code } = body;
    if (!business_id || !code) {
      return NextResponse.json({ error: 'business_id and code required' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service key not configured on server' }, { status: 500 });
    }

    // Query verification_codes for matching, not expired, and not already verified
    const query = `${supabaseUrl}/rest/v1/verification_codes?business_id=eq.${business_id}&code=eq.${code}&verified=eq.false&expires_at=gt.${new Date().toISOString()}`;
    const res = await fetch(query, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const rows = await res.json().catch((e) => ({ error: 'invalid-json-response', raw: String(e) }));
    if (!res.ok) {
      console.error('[whatsapp/confirm] query error status=', res.status, 'body=', rows);
      return NextResponse.json({ error: 'Failed to query verification codes', details: rows }, { status: 502 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const codeRow = rows[0];

    // Mark verification_codes.verified = true
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/verification_codes?id=eq.${codeRow.id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verified: true }),
    });
    const updateJson = await updateRes.json().catch((e) => ({ error: 'invalid-json-response', raw: String(e) }));
    if (!updateRes.ok) {
      console.error('[whatsapp/confirm] update verification_codes failed status=', updateRes.status, 'body=', updateJson);
      return NextResponse.json({ error: 'Failed to mark code verified', details: updateJson }, { status: 502 });
    }

    // Update businesses.whatsapp_verified = true
    const bizRes = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${business_id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ whatsapp_verified: true, updated_at: new Date().toISOString() }),
    });
    const bizJson = await bizRes.json().catch((e) => ({ error: 'invalid-json-response', raw: String(e) }));
    if (!bizRes.ok) {
      console.error('[whatsapp/confirm] update business failed status=', bizRes.status, 'body=', bizJson);
      return NextResponse.json({ error: 'Failed to update business', details: bizJson }, { status: 502 });
    }

    return NextResponse.json({ success: true, business: bizJson[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
