import { getOrderById } from '../models/orderModel.js';
import {
  initiateMobilePayment,
  syncPaymentStatusFromProvider,
  simulateMarkPaid,
  parseOrderId,
} from '../services/paymentService.js';

export async function initiatePaymentHandler(req, res) {
  try {
    const { orderId, provider, phone } = req.body;
    if (!orderId || !provider || !phone) {
      return res.status(400).json({ message: 'orderId, provider, and phone are required' });
    }
    const result = await initiateMobilePayment({ orderIdParam: orderId, provider, phone });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Payment initiation failed' });
  }
}

/**
 * Poll payment state; optional ?email= must match order for basic abuse resistance.
 */
export async function getPaymentStatusHandler(req, res) {
  try {
    const id = parseOrderId(req.params.orderId);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid order id' });

    const email = (req.query.email || '').toString().trim().toLowerCase();
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (email && String(order.customer_email || '').toLowerCase() !== email) {
      return res.status(403).json({ message: 'Email does not match this order' });
    }

    await syncPaymentStatusFromProvider(id);
    const fresh = await getOrderById(id);
    const st = String(fresh.payment_status || '').toLowerCase();
    const paid = ['paid', 'completed', 'captured'].includes(st);

    res.json({
      orderId: id,
      payment_status: fresh.payment_status,
      paid,
      payment_reference: fresh.payment_reference ?? null,
      payment_method: fresh.payment_method,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load payment status' });
  }
}

export async function simulateCompleteHandler(req, res) {
  try {
    const secret = req.headers['x-payment-simulate-secret'] || req.body?.secret;
    const order = await simulateMarkPaid(req.params.orderId, secret);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Simulate complete failed' });
  }
}
