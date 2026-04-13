import { normalizeRwandaMsisdn } from './rwandaPhone.js';
import { isMtnConfigured, requestToPay, getRequestToPayStatus } from './mtnMomoClient.js';
import { isAirtelConfigured, initiateCollection } from './airtelMoneyClient.js';
import { getOrderById, updateOrderPayment } from '../models/orderModel.js';
import { getStripe, isStripeConfigured } from './stripeCardService.js';

const PAID = 'paid';
const FAILED = 'failed';
const REQUESTED = 'payment_requested';

function parseOrderId(param) {
  const s = String(param);
  const m = s.match(/^ORD-(\d+)$/i);
  if (m) return parseInt(m[1], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : NaN;
}

export function isSimulateMode() {
  return process.env.PAYMENT_MODE === 'simulate';
}

/**
 * Start mobile money flow after order exists.
 */
export async function initiateMobilePayment({ orderIdParam, provider, phone }) {
  const orderId = parseOrderId(orderIdParam);
  if (!Number.isFinite(orderId)) throw new Error('Invalid order id');

  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  if (order.payment_method !== provider) {
    throw new Error('Order payment method does not match provider');
  }

  if (order.payment_method === 'cod') {
    throw new Error('Cash on delivery does not use mobile initiation');
  }

  if (['paid', 'completed', 'captured'].includes(String(order.payment_status || '').toLowerCase())) {
    return { alreadyPaid: true, orderId };
  }

  const msisdn = normalizeRwandaMsisdn(phone);
  if (!msisdn) throw new Error('Invalid Rwanda phone number (use 07… or 2507…)');

  const amount = Number(order.total);
  const externalId = `order-${orderId}`;

  if (isSimulateMode()) {
    const ref = `SIM-${orderId}-${Date.now()}`;
    await updateOrderPayment(orderId, {
      payment_status: REQUESTED,
      payment_reference: ref,
      payment_external_id: ref,
    });
    return {
      ok: true,
      mode: 'simulate',
      reference: ref,
      message:
        'Simulated payment requested. Use POST /api/payments/simulate-complete with PAYMENT_SIMULATE_SECRET to mark paid (dev only), or configure real MTN/Airtel keys.',
    };
  }

  if (provider === 'momo') {
    if (!isMtnConfigured()) {
      throw new Error(
        'MTN MoMo is not configured. Set MTN_MOMO_* env vars or use PAYMENT_MODE=simulate for testing.'
      );
    }
    const { referenceId } = await requestToPay({
      amount,
      currency: 'RWF',
      externalId,
      payerMsisdn: msisdn,
      payerMessage: `Payment for order ${orderId}`,
      payeeNote: `Floral shop order ${orderId}`,
    });
    await updateOrderPayment(orderId, {
      payment_status: REQUESTED,
      payment_reference: referenceId,
      payment_external_id: referenceId,
    });
    return {
      ok: true,
      mode: 'mtn',
      reference: referenceId,
      message: 'Check your MTN phone to approve Mobile Money.',
    };
  }

  if (provider === 'airtel') {
    if (!isAirtelConfigured()) {
      throw new Error(
        'Airtel Money is not configured. Set AIRTEL_* env vars or use PAYMENT_MODE=simulate.'
      );
    }
    const ref = `AIR-${orderId}-${Date.now()}`;
    await initiateCollection({ msisdn, amount, reference: ref });
    await updateOrderPayment(orderId, {
      payment_status: REQUESTED,
      payment_reference: ref,
      payment_external_id: ref,
    });
    return {
      ok: true,
      mode: 'airtel',
      reference: ref,
      message: 'Check your Airtel phone to approve the payment.',
    };
  }

  throw new Error('Unsupported provider');
}

/**
 * Poll provider + map to paid/failed when possible.
 */
export async function syncPaymentStatusFromProvider(orderIdParam) {
  const orderId = parseOrderId(orderIdParam);
  if (!Number.isFinite(orderId)) throw new Error('Invalid order id');

  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const st = String(order.payment_status || '').toLowerCase();
  if (['paid', 'completed', 'captured'].includes(st)) {
    return { payment_status: order.payment_status, paid: true };
  }

  if (String(order.payment_method).toLowerCase() === 'card' && order.payment_external_id && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(order.payment_external_id);
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        const piRef =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || session.id;
        await updateOrderPayment(orderId, {
          payment_status: PAID,
          payment_reference: piRef,
          payment_external_id: session.id,
        });
        return { payment_status: PAID, paid: true };
      }
      return { payment_status: order.payment_status, paid: false };
    } catch (e) {
      return { payment_status: order.payment_status, paid: false, error: e.message };
    }
  }

  if (order.payment_method === 'momo' && order.payment_external_id && isMtnConfigured() && !isSimulateMode()) {
    try {
      const status = await getRequestToPayStatus(order.payment_external_id);
      const statusStr = (status.status || '').toUpperCase();
      if (statusStr === 'SUCCESSFUL') {
        await updateOrderPayment(orderId, { payment_status: PAID });
        return { payment_status: PAID, paid: true, providerStatus: status };
      }
      if (statusStr === 'FAILED') {
        await updateOrderPayment(orderId, { payment_status: FAILED });
        return { payment_status: FAILED, paid: false, providerStatus: status };
      }
      return { payment_status: order.payment_status, paid: false, providerStatus: status };
    } catch (e) {
      return { payment_status: order.payment_status, paid: false, error: e.message };
    }
  }

  return { payment_status: order.payment_status, paid: false };
}

export async function simulateMarkPaid(orderIdParam, secret) {
  if (!isSimulateMode()) throw new Error('simulate-complete only when PAYMENT_MODE=simulate');
  const expected = process.env.PAYMENT_SIMULATE_SECRET;
  if (!expected || secret !== expected) throw new Error('Invalid simulate secret');

  const orderId = parseOrderId(orderIdParam);
  if (!Number.isFinite(orderId)) throw new Error('Invalid order id');

  await updateOrderPayment(orderId, { payment_status: PAID, payment_reference: `SIM-PAID-${Date.now()}` });
  return getOrderById(orderId);
}

export { parseOrderId };
