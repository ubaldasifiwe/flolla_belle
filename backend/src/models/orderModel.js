import pool from '../config/db.js';

export async function createOrder(orderData, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        customer_name, customer_email, customer_phone,
        recipient_name, recipient_phone,
        address, city, delivery_date, delivery_time_slot,
        subtotal, delivery_fee, total, currency,
        payment_method, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        orderData.recipient_name,
        orderData.recipient_phone,
        orderData.address,
        orderData.city,
        orderData.delivery_date,
        orderData.delivery_time_slot,
        orderData.subtotal,
        orderData.delivery_fee,
        orderData.total,
        orderData.currency || 'RWF',
        orderData.payment_method,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name_snapshot,
          size_label, unit_price, quantity, custom_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name_snapshot,
          item.size_label || null,
          item.unit_price,
          item.quantity,
          item.custom_message || null,
        ]
      );
    }

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getOrderById(id) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  return { ...orders[0], items };
}