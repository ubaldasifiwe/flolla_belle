import pool from '../config/db.js';

/**
 * @param {string} email
 * @returns {Promise<{ id: number; email: string; password_hash: string } | null>}
 */
export async function findAdminByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;

  const [rows] = await pool.query(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1',
    [normalized]
  );
  const row = rows[0];
  return row || null;
}
