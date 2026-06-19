Local verification flow test
===========================

This folder contains a small script to test the WhatsApp verification flow against a running local Next.js server.

Prerequisites:
- Run `npm run dev` in one terminal.
- Ensure env vars are set: `NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN`, `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID`, and `SUPABASE_SERVICE_ROLE_KEY` (for persistence).
- Install `jq` for pretty JSON output (optional).

Usage:

```bash
bash tests/verify-flow/run-local-test.sh <business_id> "+27123456789"
```

The script will call `/api/whatsapp/verify` and instruct you how to call `/api/whatsapp/confirm` with the received code.
