import pool from '../config/db.js';

export async function getAllProducts(filters) {
  const { category, flowerType, sort } = filters;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category_id = ?';
    params.push(category);
  }
  if (flowerType) {
    sql += ' AND flower_type = ?';
    params.push(flowerType);
  }

  if (sort === 'price-asc') sql += ' ORDER BY base_price ASC';
  else if (sort === 'price-desc') sql += ' ORDER BY base_price DESC';
  else if (sort === 'rating') sql += ' ORDER BY rating DESC';
  else sql += ' ORDER BY id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
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
  } = data;

  const [result] = await pool.query(
    `INSERT INTO products
     (category_id, name, slug, base_price, original_price, flower_type,
      badge, short_description, description, main_image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );

  return result.insertId;
}

export async function updateProduct(id, data) {
  const fields = [];
  const params = [];

  Object.entries(data).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    params.push(value);
  });

  if (!fields.length) return;

  params.push(id);

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}