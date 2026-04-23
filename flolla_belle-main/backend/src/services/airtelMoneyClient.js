/**
 * Airtel Money Open API (Collections).
 * Portal: https://developers.airtel.africa — staging UAT vs production.
 *
 * Env:
 *   AIRTEL_BASE_URL         https://openapiuat.airtel.africa or https://openapi.airtel.africa
 *   AIRTEL_CLIENT_ID
 *   AIRTEL_CLIENT_SECRET
 *   AIRTEL_COUNTRY          RW
 *   AIRTEL_CURRENCY         RWF
 */

let cachedToken = null;
let tokenExpiresAt = 0;

export function isAirtelConfigured() {
  return Boolean(
    process.env.AIRTEL_CLIENT_ID &&
      process.env.AIRTEL_CLIENT_SECRET &&
      process.env.AIRTEL_BASE_URL
  );
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const base = process.env.AIRTEL_BASE_URL.replace(/\/$/, '');
  const res = await fetch(`${base}/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    body: JSON.stringify({
      client_id: process.env.AIRTEL_CLIENT_ID,
      client_secret: process.env.AIRTEL_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtel token failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  const ttl = (data.expires_in || 3600) * 1000;
  tokenExpiresAt = Date.now() + ttl;
  return cachedToken;
}

/**
 * Initiate collection (exact path may vary by Airtel API version — adjust from your portal docs).
 */
export async function initiateCollection({ msisdn, amount, reference }) {
  const base = process.env.AIRTEL_BASE_URL.replace(/\/$/, '');
  const token = await getAccessToken();
  const country = process.env.AIRTEL_COUNTRY || 'RW';
  const currency = process.env.AIRTEL_CURRENCY || 'RWF';

  const payload = {
    reference,
    subscriber: { country, currency, msisdn },
    transaction: { amount: Math.round(Number(amount)), country, currency, id: reference },
  };

  const res = await fetch(`${base}/merchant/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
      'X-Country': country,
      'X-Currency': currency,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Airtel collection failed: ${res.status} ${text}`);
  }

  return { reference, raw: json };
}
