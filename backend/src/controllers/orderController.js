import { createOrder, getOrderById, listAllOrders, updateOrder } from '../models/orderModel.js';
import { syncPaymentStatusFromProvider } from '../services/paymentService.js';

function parseOrderId(param) {
  const s = String(param);
  const m = s.match(/^ORD-(\d+)$/i);
  if (m) return parseInt(m[1], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : NaN;
}

export async function createOrderHandler(req, res) {
  try {
    const { customer, recipient, delivery, pricing, paymentMethod, items } = req.body;

    const payment_status =
      paymentMethod === 'cod'
        ? 'pending'
        : paymentMethod === 'momo' || paymentMethod === 'airtel' || paymentMethod === 'card'
          ? 'awaiting_payment'
          : 'pending';

    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,

      recipient_name: recipient.name,
      recipient_phone: recipient.phone,

      address: delivery.address,
      city: delivery.city,
      delivery_date: delivery.date,
      delivery_time_slot: delivery.timeSlot,

      subtotal: pricing.subtotal,
      delivery_fee: pricing.deliveryFee,
      total: pricing.total,
      currency: 'RWF',

      payment_method: paymentMethod,
      payment_status,
      status: 'pending',
    };

    const formattedItems = items.map((i) => ({
      product_id: i.productId,
      product_name_snapshot: i.name,
      size_label: i.sizeLabel,
      unit_price: i.unitPrice,
      quantity: i.quantity,
      custom_message: i.customMessage,
      image_url: i.imageUrl ?? i.image_url ?? null,
    }));

    const orderId = await createOrder(orderData, formattedItems);
    const order = await getOrderById(orderId);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
}

export async function listOrdersHandler(req, res) {
  try {
    let orders = await listAllOrders();
    // Card orders: DB can stay on awaiting_payment if return URL / complete failed — sync from Stripe when admin loads orders.
    for (const o of orders) {
      if (String(o.payment_method).toLowerCase() === 'card' && o.payment_external_id) {
        const st = String(o.payment_status || '').toLowerCase();
        if (!['paid', 'completed', 'captured'].includes(st)) {
          try {
            await syncPaymentStatusFromProvider(o.id);
          } catch (e) {
            console.error('sync card order', o.id, e);
          }
        }
      }
    }
    orders = await listAllOrders();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

export async function patchOrderHandler(req, res) {
  try {
    const id = parseOrderId(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid order id' });

    const { status, payment_status, paymentStatus } = req.body;
    const pay = payment_status ?? paymentStatus;

    await updateOrder(id, {
      status: status ?? undefined,
      payment_status: pay ?? undefined,
    });

    const order = await getOrderById(id);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order' });
  }
}

export async function getOrderHandler(req, res) {
  try {
    const id = parseOrderId(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid order id' });

    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
}
