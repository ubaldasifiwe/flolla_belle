import pool from '../config/db.js';

export async function subscribe(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await pool.query(
      `INSERT INTO newsletter_subscribers (email)
       VALUES (?) ON DUPLICATE KEY UPDATE status = 'active'`,
      [email]
    );

    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to subscribe' });
  }
}