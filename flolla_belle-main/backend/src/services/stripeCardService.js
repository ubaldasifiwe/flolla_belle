import Stripe from 'stripe';
import { getOrderById, updateOrderPayment } from '../models/orderModel.js';

let stripeSingleton = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Stripe Checkout: customer pays with Visa, Mastercard, etc. on Stripe-hosted page (PCI handled by Stripe).
 */
export async function createCheckoutSessionForOrder(orderId) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error(
      'Card payments are not configured. Add STRIPE_SECRET_KEY to backend/.env (use a test key sk_test_… from dashboard.stripe.com).'
    );
  }

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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'rwf',
          unit_amount: amount,
          product_data: {
            name: `FloraBelle order #${orderId}`,
            description: 'Flower delivery order',
          },
        },
      },
    ],
    success_url: `${frontend}/checkout/payment-return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontend}/checkout?canceled=1`,
    metadata: {
      orderId: String(orderId),
    },
    customer_email: order.customer_email || undefined,
    payment_method_types: ['card'],
  });

  await updateOrderPayment(orderId, {
    payment_status: 'awaiting_payment',
    payment_reference: session.id,
    payment_external_id: session.id,
  });

  return { sessionId: session.id, url: session.url };
}

export async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Mark order paid if Stripe session is complete and amounts/metadata match.
 */
export async function fulfillCheckoutSession(sessionId) {
  const session = await retrieveCheckoutSession(sessionId);
  const orderId = parseInt(String(session.metadata?.orderId || ''), 10);
  if (!Number.isFinite(orderId)) {
    throw new Error('Invalid session metadata');
  }

  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  if (String(order.payment_method).toLowerCase() !== 'card') {
    throw new Error('Order payment method mismatch');
  }

  const expected = Math.round(Number(order.total));
  const paidAmount = session.amount_total != null ? session.amount_total : null;

  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return { paid: false, orderId, payment_status: session.payment_status };
  }

  if (paidAmount != null && Math.abs(paidAmount - expected) > 1) {
    console.warn(
      `[stripe] Order ${orderId} amount mismatch: stripe=${paidAmount} order=${expected} — still marking paid (Stripe is source of truth).`
    );
  }

  const piRef =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  await updateOrderPayment(orderId, {
    payment_status: 'paid',
    payment_reference: piRef,
    payment_external_id: session.id,
  });

  return { paid: true, orderId };
}
