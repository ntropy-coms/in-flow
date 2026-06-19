import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const metaAppSecret = process.env.META_APP_SECRET;
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;

    const result: Record<string, any> = {
      env: {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
        META_APP_SECRET: !!metaAppSecret,
        NEXT_PUBLIC_META_APP_ID: !!metaAppId,
      },
      supabase: { ok: false, error: '' },
    };

    if (supabaseUrl && serviceKey) {
      try {
        // Try to read one business record to verify DB connectivity
        const res = await fetch(`${supabaseUrl}/rest/v1/businesses?select=id&limit=1`, {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        });
        if (!res.ok) {
          result.supabase.error = `Supabase responded ${res.status}`;
        } else {
          result.supabase.ok = true;
        }
      } catch (err: any) {
        result.supabase.error = err?.message || String(err);
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}
