import { Router } from 'express';
import {
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  patchOrderHandler,
} from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAdmin, listOrdersHandler);
router.post('/', createOrderHandler);
router.patch('/:id', requireAdmin, patchOrderHandler);
router.get('/:id', getOrderHandler);

export default router;
