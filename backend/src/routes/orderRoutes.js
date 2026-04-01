import { Router } from 'express';
import { createOrderHandler, getOrderHandler } from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrderHandler);
router.get('/:id', getOrderHandler);

export default router;