import pool from '../config/db.js';

export async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}