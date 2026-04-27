/**
 * MTN MoMo Collection API (Open API).
 * Register: https://momodeveloper.mtn.com — Rwanda production often uses country-specific URLs from MTN.
 *
 * Env:
 *   MTN_MOMO_BASE_URL       e.g. https://sandbox.momodeveloper.mtn.com (sandbox) or MTN-provided Rwanda URL
 *   MTN_MOMO_SUBSCRIPTION_KEY  Ocp-Apim-Subscription-Key
 *   MTN_MOMO_API_USER          API user (UUID) from portal
 *   MTN_MOMO_API_KEY           API key
 *   MTN_MOMO_TARGET_ENV        sandbox | mtnrwanda (or value MTN gives)
 *   MTN_MOMO_CURRENCY          RWF
 */

import crypto from 'crypto';

function basicAuthUser() {
  const user = process.env.MTN_MOMO_API_USER;
  const key = process.env.MTN_MOMO_API_KEY;
  if (!user || !key) return null;
  return Buffer.from(`${user}:${key}`).toString('base64');
}

export function isMtnConfigured() {
  return Boolean(
    process.env.MTN_MOMO_SUBSCRIPTION_KEY &&
      process.env.MTN_MOMO_API_USER &&
      process.env.MTN_MOMO_API_KEY &&
      process.env.MTN_MOMO_BASE_URL
  );
}

export async function getCollectionAccessToken() {
  const base = process.env.MTN_MOMO_BASE_URL;
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const auth = basicAuthUser();
  if (!base || !subKey || !auth) throw new Error('MTN MoMo credentials not configured');

  const res = await fetch(`${base.replace(/\/$/, '')}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': subKey,
    },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`MTN token failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

/**
 * Request payment from customer (USSD push / prompt on their phone).
 * @returns {{ referenceId: string, raw: unknown }}
 */
export async function requestToPay({ amount, currency, externalId, payerMsisdn, payerMessage, payeeNote }) {
  const base = process.env.MTN_MOMO_BASE_URL.replace(/\/$/, '');
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';
  const token = await getCollectionAccessToken();
  const referenceId = crypto.randomUUID();

  const body = {
    amount: String(Math.round(Number(amount))),
    currency: currency || process.env.MTN_MOMO_CURRENCY || 'RWF',
    externalId: String(externalId),
    payer: {
      partyIdType: 'MSISDN',
      partyId: payerMsisdn,
    },
    payerMessage: payerMessage || 'Floral order',
    payeeNote: payeeNote || `Order ${externalId}`,
  };

  const res = await fetch(`${base}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': targetEnv,
      'Ocp-Apim-Subscription-Key': subKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 202 || res.status === 200) {
    return { referenceId, raw: { status: res.status } };
  }

  const t = await res.text();
  throw new Error(`MTN requestToPay failed: ${res.status} ${t}`);
}

/**
 * Check payment status for a reference UUID returned from requestToPay.
 */
export async function getRequestToPayStatus(referenceId) {
  const base = process.env.MTN_MOMO_BASE_URL.replace(/\/$/, '');
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';
  const token = await getCollectionAccessToken();

  const res = await fetch(`${base}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Target-Environment': targetEnv,
      'Ocp-Apim-Subscription-Key': subKey,
    },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`MTN status failed: ${res.status} ${t}`);
  }
  return res.json();
}
