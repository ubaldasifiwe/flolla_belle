import pool from '../config/db.js';

/** DB enum often uses `pending`; admin UI uses `processing`. */
function toDbOrderStatus(appStatus) {
  if (appStatus === 'processing') return 'pending';
  if (appStatus === 'delivered' || appStatus === 'cancelled') return appStatus;
  return 'pending';
}

function normalizeItemRow(row) {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    product_name_snapshot: row.product_name_snapshot,
    size_label: row.size_label,
    unit_price: Number(row.unit_price),
    quantity: row.quantity,
    custom_message: row.custom_message,
    image_url: row.image_url ?? null,
  };
}

export async function createOrder(orderData, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const paymentStatus = orderData.payment_status ?? 'pending';
    const fulfilmentStatus = orderData.status ?? 'pending';

    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        customer_name, customer_email, customer_phone,
        recipient_name, recipient_phone,
        address, city, delivery_date, delivery_time_slot,
        subtotal, delivery_fee, total, currency,
        payment_method, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        paymentStatus,
        fulfilmentStatus,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const vals = [
        orderId,
        item.product_id,
        item.product_name_snapshot,
        item.size_label || null,
        item.unit_price,
        item.quantity,
        item.custom_message || null,
        item.image_url || null,
      ];
      try {
        await conn.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name_snapshot,
            size_label, unit_price, quantity, custom_message, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          vals
        );
      } catch (e) {
        if (e.code === 'ER_BAD_FIELD_ERROR') {
          await conn.query(
            `INSERT INTO order_items (
              order_id, product_id, product_name_snapshot,
              size_label, unit_price, quantity, custom_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            vals.slice(0, 7)
          );
        } else {
          throw e;
        }
      }
    }

    try {
      await conn.query(
        `INSERT INTO customers (email, name, phone, first_order_at, last_order_at, order_count, total_spent)
         VALUES (?, ?, ?, NOW(), NOW(), 1, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           phone = COALESCE(NULLIF(VALUES(phone), ''), customers.phone),
           last_order_at = NOW(),
           order_count = customers.order_count + 1,
           total_spent = customers.total_spent + VALUES(total_spent)`,
        [
          orderData.customer_email,
          orderData.customer_name,
          orderData.customer_phone || '',
          orderData.total,
        ]
      );
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
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
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [id]);
  return { ...orders[0], items: items.map(normalizeItemRow) };
}

export async function listAllOrders() {
  const [orders] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
  if (!orders.length) return orders.map((o) => ({ ...o, items: [] }));

  const ids = orders.map((o) => o.id);
  const [items] = await pool.query(
    'SELECT * FROM order_items WHERE order_id IN (?) ORDER BY order_id ASC, id ASC',
    [ids]
  );

  const byOrder = new Map(orders.map((o) => [o.id, { ...o, items: [] }]));
  for (const it of items) {
    const o = byOrder.get(it.order_id);
    if (o) o.items.push(normalizeItemRow(it));
  }

  return Array.from(byOrder.values());
}

export async function updateOrder(id, { status, payment_status }) {
  const fields = [];
  const params = [];
  if (status != null) {
    fields.push('status = ?');
    params.push(toDbOrderStatus(status));
  }
  if (payment_status != null) {
    fields.push('payment_status = ?');
    params.push(payment_status);
  }
  if (!fields.length) return;
  params.push(id);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
}

const PAYMENT_PATCH_KEYS = ['payment_status', 'payment_reference', 'payment_external_id'];

export async function updateOrderPayment(id, patch) {
  const fields = [];
  const params = [];
  for (const key of PAYMENT_PATCH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(patch[key]);
    }
  }
  if (!fields.length) return;
  params.push(id);
  try {
    await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR' && patch.payment_status != null) {
      await pool.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [patch.payment_status, id]);
    } else {
      throw e;
    }
  }
}

export async function listCustomersFromTable() {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, name, phone, first_order_at, last_order_at, order_count, total_spent
       FROM customers
       ORDER BY last_order_at DESC`
    );
    return rows;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') return [];
    throw e;
  }
}
