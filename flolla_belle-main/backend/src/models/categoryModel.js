import pool from '../config/db.js';

export async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

export async function getCategoryBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] || null;
}
