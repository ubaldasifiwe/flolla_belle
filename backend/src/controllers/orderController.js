import { createOrder, getOrderById } from '../models/orderModel.js';

export async function createOrderHandler(req, res) {
  try {
    const { customer, recipient, delivery, pricing, paymentMethod, items } = req.body;

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
    };

    const formattedItems = items.map((i) => ({
      product_id: i.productId,
      product_name_snapshot: i.name,
      size_label: i.sizeLabel,
      unit_price: i.unitPrice,
      quantity: i.quantity,
      custom_message: i.customMessage,
    }));

    const orderId = await createOrder(orderData, formattedItems);
    const order = await getOrderById(orderId);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
}

export async function getOrderHandler(req, res) {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
}