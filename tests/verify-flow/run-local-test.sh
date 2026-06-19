#!/usr/bin/env bash
set -euo pipefail

echo "This script performs a basic verification flow against a running local Next.js dev server."
echo "Ensure NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN, NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID, and SUPABASE_SERVICE_ROLE_KEY are set in your environment, and run 'npm run dev' in another terminal."

API_BASE="http://localhost:3000/api/whatsapp"
BUSINESS_ID="$1"
NUMBER="$2"

if [ -z "$BUSINESS_ID" ] || [ -z "$NUMBER" ]; then
  echo "Usage: $0 <business_id> <whatsapp_number>" >&2
  exit 2
fi

echo "Sending verify request for $NUMBER (business $BUSINESS_ID)"
curl -s -X POST "$API_BASE/verify" -H "Content-Type: application/json" -d "{\"whatsapp_number\": \"$NUMBER\", \"business_id\": \"$BUSINESS_ID\"}" | jq .

echo "Now check your WhatsApp number for the code, then run:"
echo "  curl -s -X POST \"$API_BASE/confirm\" -H 'Content-Type: application/json' -d '{\"business_id\": \"$BUSINESS_ID\",\"code\": \"<CODE>\"}' | jq ."
