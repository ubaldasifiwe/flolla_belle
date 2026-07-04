import { parseOrderId } from '../services/paymentService.js';
import { updateOrderPayment } from '../models/orderModel.js';
import {
  isFlutterwaveConfigured,
  createPaymentLinkForOrder,
  fulfillFlutterwavePayment,
  parseOrderIdFromTxRef,
} from '../services/flutterwaveCardService.js';

export async function createCardSessionHandler(req, res) {
  try {
    if (!isFlutterwaveConfigured()) {
      return res.status(503).json({
        message:
          'Card payments are not configured. Set FLUTTERWAVE_SECRET_KEY in backend/src/.env to your Flutterwave Secret Key (FLWSECK_TEST-…), then restart the server.',
      });
    }
    const orderId = parseOrderId(req.body?.orderId);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ message: 'Valid orderId is required' });
    }

    const { url, txRef } = await createPaymentLinkForOrder(orderId);
    res.json({ url, txRef });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
    res.status(400).json({ message: err.message || 'Could not start card checkout' });
=======
    res.status(400).json({ message: err.message || 'Could not start Flutterwave checkout' });
>>>>>>> b3cd0bea (otp number verification)
  }
}

export async function completeCardSessionHandler(req, res) {
  try {
    const transactionId = String(req.query.transaction_id || '').trim();
    const txRef = String(req.query.tx_ref || '').trim();
    const status = String(req.query.status || '').trim().toLowerCase();

    if (status === 'cancelled') {
      return res.json({ paid: false, payment_status: 'cancelled' });
    }

    const result = await fulfillFlutterwavePayment({ transactionId, txRef });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Could not complete payment' });
  }
}

export async function cardConfigHandler(req, res) {
  const key = process.env.FLUTTERWAVE_SECRET_KEY || '';
  res.json({
    enabled: isFlutterwaveConfigured(),
    provider: 'flutterwave',
    mode: key.includes('TEST') ? 'test' : 'live',
  });
}

/**
 * Flutterwave webhook — set URL in dashboard to /api/payments/card/webhook
 * and FLUTTERWAVE_WEBHOOK_SECRET to your dashboard secret hash.
 */
export async function flutterwaveWebhookHandler(req, res) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const hash = req.headers['verif-hash'];
  if (secret && hash !== secret) {
    return res.status(401).send('Invalid verif-hash');
  }

  const payload = req.body;
  const event = payload?.event;
  const data = payload?.data;

  if (
    (event === 'charge.completed' || event === 'checkout.complete') &&
    String(data?.status || '').toLowerCase() === 'successful'
  ) {
    let orderId = parseInt(String(data?.meta?.order_id || ''), 10);
    if (!Number.isFinite(orderId)) {
      orderId = parseOrderIdFromTxRef(data?.tx_ref);
    }
    if (Number.isFinite(orderId)) {
      try {
        await updateOrderPayment(orderId, {
          payment_status: 'paid',
          payment_reference: data.tx_ref || String(data.id),
          payment_external_id: data.id != null ? String(data.id) : data.tx_ref,
        });
      } catch (e) {
        console.error('Flutterwave webhook fulfill error:', e);
      }
    }
  }

  res.status(200).send('OK');
}
