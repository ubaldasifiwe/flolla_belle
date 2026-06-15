import { getOrderById, updateOrderPayment } from '../models/orderModel.js';

const FLW_API = 'https://api.flutterwave.com/v3';

function getSecretKey() {
  return (process.env.FLUTTERWAVE_SECRET_KEY || '').trim();
}

/** Must be the Secret Key (FLWSECK…), not the Public Key (FLWPUBK…). */
export function isFlutterwaveConfigured() {
  const key = getSecretKey();
  if (!key) return false;
  if (/PASTE_|YOUR_.*_HERE/i.test(key)) return false;
  if (key.startsWith('FLWPUBK')) return false;
  return key.startsWith('FLWSECK');
}

function assertFlutterwaveKey() {
  const key = getSecretKey();
  if (!key) {
    throw new Error(
      'Flutterwave is not configured. Add FLUTTERWAVE_SECRET_KEY to backend/src/.env and restart the server.'
    );
  }
  if (/PASTE_|YOUR_.*_HERE/i.test(key)) {
    throw new Error(
      'Flutterwave secret key is still a placeholder. Paste your real Secret Key from dashboard.flutterwave.com → Settings → API Keys (starts with FLWSECK_TEST-).'
    );
  }
  if (key.startsWith('FLWPUBK')) {
    throw new Error(
      'You pasted the Flutterwave Public Key (FLWPUBK…). Use the Secret Key (FLWSECK…) instead.'
    );
  }
  if (!key.startsWith('FLWSECK')) {
    throw new Error(
      'Invalid Flutterwave secret key format. It should start with FLWSECK_TEST- (test) or FLWSECK- (live).'
    );
  }
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getSecretKey()}`,
    'Content-Type': 'application/json',
  };
}

export function parseOrderIdFromTxRef(txRef) {
  const m = String(txRef || '').match(/^florabelle-ord-(\d+)-/i);
  return m ? parseInt(m[1], 10) : NaN;
}

function buildTxRef(orderId) {
  return `florabelle-ord-${orderId}-${Date.now()}`;
}

async function flwJson(path, options = {}) {
  const res = await fetch(`${FLW_API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status !== 'success') {
    const msg = data.message || `Flutterwave API error (${res.status})`;
    if (/invalid authorization/i.test(msg)) {
      throw new Error(
        'Flutterwave rejected the secret key. Use the Secret Key (FLWSECK_TEST-…) from dashboard.flutterwave.com → Settings → API Keys, then restart the backend.'
      );
    }
    throw new Error(msg);
  }
  return data;
}

/**
 * Flutterwave hosted checkout — cards, mobile money, etc. on Flutterwave page.
 */
export async function createPaymentLinkForOrder(orderId) {
  assertFlutterwaveKey();

  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  if (String(order.payment_method).toLowerCase() !== 'card') {
    throw new Error('Order is not using card payment');
  }

  const st = String(order.payment_status || '').toLowerCase();
  if (['paid', 'completed', 'captured'].includes(st)) {
    throw new Error('Order is already paid');
  }

  const amount = Math.round(Number(order.total));
  if (!Number.isFinite(amount) || amount < 100) {
    throw new Error('Invalid order total for payment (minimum 100 RWF)');
  }

  const frontend = (process.env.FRONTEND_ORIGIN || 'http://localhost:8080').replace(/\/$/, '');
  const txRef = buildTxRef(orderId);

  const payload = await flwJson('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: 'RWF',
      redirect_url: `${frontend}/checkout/payment-return`,
      customer: {
        email: order.customer_email,
        name: order.customer_name,
        phonenumber: order.customer_phone || undefined,
      },
      customizations: {
        title: 'FloraBelle',
        description: `Flower delivery order #${orderId}`,
        logo: '',
      },
      meta: {
        order_id: String(orderId),
      },
    }),
  });

  const link = payload.data?.link;
  if (!link) throw new Error('Flutterwave did not return a payment link');

  await updateOrderPayment(orderId, {
    payment_status: 'awaiting_payment',
    payment_reference: txRef,
    payment_external_id: txRef,
  });

  return { url: link, txRef };
}

async function verifyByTransactionId(transactionId) {
  return flwJson(`/transactions/${encodeURIComponent(transactionId)}/verify`);
}

async function verifyByTxRef(txRef) {
  return flwJson(
    `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`
  );
}

async function markPaidIfValid(orderId, txData) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  if (String(order.payment_method).toLowerCase() !== 'card') {
    throw new Error('Order payment method mismatch');
  }

  const status = String(txData.status || '').toLowerCase();
  if (status !== 'successful') {
    return { paid: false, orderId, payment_status: status };
  }

  const expected = Math.round(Number(order.total));
  const paidAmount = Math.round(Number(txData.amount));
  if (Number.isFinite(paidAmount) && Math.abs(paidAmount - expected) > 1) {
    console.warn(
      `[flutterwave] Order ${orderId} amount mismatch: flw=${paidAmount} order=${expected}`
    );
  }

  const txId = txData.id != null ? String(txData.id) : txData.tx_ref;

  await updateOrderPayment(orderId, {
    payment_status: 'paid',
    payment_reference: txData.tx_ref || txId,
    payment_external_id: txId,
  });

  return { paid: true, orderId };
}

/**
 * Verify with Flutterwave after customer returns from hosted checkout.
 */
export async function fulfillFlutterwavePayment({ transactionId, txRef }) {
  const tid = String(transactionId || '').trim();
  const ref = String(txRef || '').trim();

  if (!tid && !ref) {
    throw new Error('transaction_id or tx_ref is required');
  }

  const payload = tid ? await verifyByTransactionId(tid) : await verifyByTxRef(ref);
  const txData = payload.data;

  let orderId = parseInt(String(txData.meta?.order_id || ''), 10);
  if (!Number.isFinite(orderId)) {
    orderId = parseOrderIdFromTxRef(txData.tx_ref);
  }
  if (!Number.isFinite(orderId)) {
    throw new Error('Could not determine order from Flutterwave transaction');
  }

  return markPaidIfValid(orderId, txData);
}

/** Sync unpaid card orders using stored tx_ref. */
export async function syncFlutterwaveOrderPayment(order) {
  if (!isFlutterwaveConfigured()) {
    return { payment_status: order.payment_status, paid: false };
  }

  const ref = order.payment_reference || order.payment_external_id;
  if (!ref) {
    return { payment_status: order.payment_status, paid: false };
  }

  try {
    const payload = await verifyByTxRef(ref);
    const orderId =
      parseInt(String(payload.data?.meta?.order_id || ''), 10) ||
      parseOrderIdFromTxRef(payload.data?.tx_ref) ||
      order.id;

    if (String(payload.data?.status || '').toLowerCase() === 'successful') {
      return markPaidIfValid(orderId, payload.data);
    }
    return { payment_status: order.payment_status, paid: false };
  } catch (e) {
    return { payment_status: order.payment_status, paid: false, error: e.message };
  }
}
