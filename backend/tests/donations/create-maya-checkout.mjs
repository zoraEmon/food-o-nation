// Create a Maya Checkout (sandbox) and print checkoutId + redirectUrl
// Prereq: .env has MAYA_SECRET_KEY and MAYA_API_BASE (default https://pg-sandbox.paymaya.com)
// Usage (from backend/):
//   node tests/donations/create-maya-checkout.mjs 500
// Amount defaults to 500 PHP if not provided.

import 'dotenv/config';
import fetch from 'node-fetch';

const amount = parseFloat(process.argv[2] || '500');
if (Number.isNaN(amount) || amount <= 0) {
  console.error('Amount must be a positive number.');
  process.exit(1);
}

const secret = process.env.MAYA_SECRET_KEY;
const pub = process.env.MAYA_PUBLIC_KEY;
const base = process.env.MAYA_API_BASE || 'https://pg-sandbox.paymaya.com';

if (!secret && !pub) {
  console.error('Missing MAYA_SECRET_KEY or MAYA_PUBLIC_KEY in environment.');
  process.exit(1);
}

const reference = `MAYA-CHECKOUT-${Date.now()}`;

const body = {
  totalAmount: {
    value: amount,
    currency: 'PHP',
  },
  requestReferenceNumber: reference,
  redirectUrl: {
    success: 'https://example.com/success',
    failure: 'https://example.com/failure',
    cancel: 'https://example.com/cancel',
  },
  items: [
    {
      name: 'Food Donation',
      quantity: 1,
      amount: { value: amount },
      totalAmount: { value: amount },
    },
  ],
};

async function createWithKey(key, label) {
  const res = await fetch(`${base}/checkout/v1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, statusText: res.statusText, text, label };
  }

  const json = await res.json();
  return { ok: true, json, label };
}

async function main() {
  const keys = [];
  if (pub) keys.push({ key: pub, label: 'public' });
  if (secret) keys.push({ key: secret, label: 'secret' });

  let lastErr = null;
  for (const k of keys) {
    const r = await createWithKey(k.key, k.label);
    if (r.ok) {
      const checkoutId = r.json.checkoutId || r.json.id;
      console.log(`Checkout created using ${k.label} key`);
      console.log(JSON.stringify(r.json, null, 2));
      console.log('\nUse this as paymentReference for Maya verification:', checkoutId);
      console.log('Redirect URL (complete payment with test card):', r.json.redirectUrl);
      return;
    }
    lastErr = r;
    if (r.status === 401 || r.status === 403) continue; // try next key on scope errors
    break;
  }

  console.error('Failed to create checkout:', lastErr?.status, lastErr?.statusText, lastErr?.text);
  console.error('Hint: Maya Checkout creation typically uses the PUBLIC key (pk-...). Ensure the key has Checkout scope.');
  process.exit(1);
}

main().catch((err) => {
  console.error('Error creating checkout:', err);
  process.exit(1);
});
