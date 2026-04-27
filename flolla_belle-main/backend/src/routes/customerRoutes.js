import { Router } from 'express';
import { listCustomersHandler } from '../controllers/customerController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAdmin, listCustomersHandler);

export default router;
