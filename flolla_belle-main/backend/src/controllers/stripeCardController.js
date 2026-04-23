import { parseOrderId } from '../services/paymentService.js';
import { updateOrderPayment } from '../models/orderModel.js';
import {
  isStripeConfigured,
  createCheckoutSessionForOrder,
  fulfillCheckoutSession,
  getStripe,
} from '../services/stripeCardService.js';

export async function createCardSessionHandler(req, res) {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        message:
          'Card payments are not configured. Add STRIPE_SECRET_KEY (test: sk_test_…) to backend environment.',
      });
    }
    const orderId = parseOrderId(req.body?.orderId);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ message: 'Valid orderId is required' });
    }

    const { url, sessionId } = await createCheckoutSessionForOrder(orderId);
    res.json({ url, sessionId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Could not start card checkout' });
  }
}

export async function completeCardSessionHandler(req, res) {
  try {
    const sessionId = String(req.query.session_id || '').trim();
    if (!sessionId) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    const result = await fulfillCheckoutSession(sessionId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Could not complete payment' });
  }
}

export async function cardConfigHandler(req, res) {
  res.json({
    enabled: isStripeConfigured(),
    mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live',
  });
}

/**
 * Stripe webhook — use Stripe CLI in dev: `stripe listen --forward-to localhost:4000/api/payments/card/webhook`
 */
export async function stripeWebhookHandler(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();
  if (!secret || !stripe) {
    return res.status(503).send('Webhook not configured');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing stripe-signature');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = parseInt(String(session.metadata?.orderId || ''), 10);
    if (Number.isFinite(orderId) && session.payment_status === 'paid') {
      try {
        await updateOrderPayment(orderId, {
          payment_status: 'paid',
          payment_reference: session.payment_intent || session.id,
          payment_external_id: session.id,
        });
      } catch (e) {
        console.error('Webhook fulfill error:', e);
      }
    }
  }

  res.json({ received: true });
}
