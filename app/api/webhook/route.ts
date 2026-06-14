import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// ── GET: Meta webhook verification handshake ─────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ── POST: Incoming WhatsApp message handler ───────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Only process text messages
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const from: string = message.from; // customer phone number
    const text: string = message.text?.body ?? '';
    const contactName: string =
      value?.contacts?.[0]?.profile?.name ?? from;

    const supabase = getSupabase();

    // Upsert chat profile
    await supabase.from('chats').upsert(
      {
        id: from,
        name: contactName,
        last_message: text,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // Insert new message record
    await supabase.from('messages').insert({
      chat_id: from,
      sender: 'customer',
      body: text,
    });

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('[webhook] error:', err);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
