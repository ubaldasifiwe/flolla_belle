import { listCustomersFromTable } from '../models/orderModel.js';

export async function listCustomersHandler(req, res) {
  try {
    const rows = await listCustomersFromTable();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
}
