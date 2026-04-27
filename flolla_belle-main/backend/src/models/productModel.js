import pool from '../config/db.js';

const UPDATE_WHITELIST = new Set([
  'category_id',
  'name',
  'slug',
  'base_price',
  'original_price',
  'flower_type',
  'badge',
  'short_description',
  'description',
  'main_image_url',
  'rating',
  'review_count',
  'in_stock',
  'stock_quantity',
]);

async function imagesByProductIds(productIds) {
  if (!productIds.length) return new Map();
  const [imgs] = await pool.query(
    'SELECT product_id, image_url FROM product_images WHERE product_id IN (?) ORDER BY product_id ASC, position ASC',
    [productIds]
  );
  const m = new Map();
  for (const im of imgs) {
    if (!m.has(im.product_id)) m.set(im.product_id, []);
    m.get(im.product_id).push({ image_url: im.image_url });
  }
  return m;
}

async function sizesByProductIds(productIds) {
  if (!productIds.length) return new Map();
  const [rows] = await pool.query(
    'SELECT product_id, label, price FROM product_sizes WHERE product_id IN (?) ORDER BY product_id ASC, id ASC',
    [productIds]
  );
  const m = new Map();
  for (const r of rows) {
    if (!m.has(r.product_id)) m.set(r.product_id, []);
    m.get(r.product_id).push({ label: r.label, price: Number(r.price) });
  }
  return m;
}

export async function getAllProducts(filters) {
  const { category, flowerType, sort } = filters;
  let sql = `
    SELECT p.*, c.slug AS category_slug
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (flowerType) {
    sql += ' AND flower_type = ?';
    params.push(flowerType);
  }

  if (sort === 'price-asc') sql += ' ORDER BY p.base_price ASC';
  else if (sort === 'price-desc') sql += ' ORDER BY p.base_price DESC';
  else if (sort === 'rating') sql += ' ORDER BY p.rating DESC';
  else sql += ' ORDER BY p.id DESC';

  const [rows] = await pool.query(sql, params);
  const ids = rows.map((r) => r.id);
  const imgMap = await imagesByProductIds(ids);
  const sizeMap = await sizesByProductIds(ids);
  return rows.map((r) => ({
    ...r,
    images: imgMap.get(r.id) || [],
    sizes: sizeMap.get(r.id) || [],
  }));
}

export async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.slug AS category_slug
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const imgMap = await imagesByProductIds([row.id]);
  const sizeMap = await sizesByProductIds([row.id]);
  return { ...row, images: imgMap.get(row.id) || [], sizes: sizeMap.get(row.id) || [] };
}

export async function createProduct(data) {
  const {
    category_id,
    name,
    slug,
    base_price,
    original_price,
    flower_type,
    badge,
    short_description,
    description,
    main_image_url,
    in_stock,
    stock_quantity,
  } = data;

  const inStockVal = in_stock != null ? (in_stock ? 1 : 0) : 1;
  const stockQty = stock_quantity != null ? Number(stock_quantity) : (inStockVal ? 50 : 0);

  const [result] = await pool.query(
    `INSERT INTO products
     (category_id, name, slug, base_price, original_price, flower_type,
      badge, short_description, description, main_image_url, in_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category_id,
      name,
      slug,
      base_price,
      original_price || null,
      flower_type || null,
      badge || null,
      short_description || null,
      description || null,
      main_image_url || null,
      inStockVal,
    ]
  );

  const productId = result.insertId;

  try {
    await pool.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [stockQty, productId]);
  } catch (e) {
    if (e.code !== 'ER_BAD_FIELD_ERROR') throw e;
  }

  if (main_image_url) {
    await pool.query(
      'INSERT INTO product_images (product_id, image_url, position) VALUES (?, ?, 0)',
      [productId, main_image_url]
    );
  }

  await pool.query('INSERT INTO product_sizes (product_id, label, price) VALUES (?, ?, ?)', [
    productId,
    'Standard',
    base_price,
  ]);

  return productId;
}

export async function updateProduct(id, data) {
  const fields = [];
  const params = [];

  Object.entries(data).forEach(([key, value]) => {
    if (!UPDATE_WHITELIST.has(key)) return;
    fields.push(`${key} = ?`);
    params.push(value);
  });

  if (!fields.length) return;

  params.push(id);
  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);

  if (Object.prototype.hasOwnProperty.call(data, 'main_image_url')) {
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    if (data.main_image_url) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, position) VALUES (?, ?, 0)',
        [id, data.main_image_url]
      );
    }
  }
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
  await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}
