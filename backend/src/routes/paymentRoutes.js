import { Router } from 'express';
import {
  initiatePaymentHandler,
  getPaymentStatusHandler,
  simulateCompleteHandler,
} from '../controllers/paymentController.js';
import {
  createCardSessionHandler,
  completeCardSessionHandler,
  cardConfigHandler,
} from '../controllers/stripeCardController.js';

const router = Router();

router.post('/initiate', initiatePaymentHandler);
router.get('/order/:orderId/status', getPaymentStatusHandler);
router.post('/simulate-complete/:orderId', simulateCompleteHandler);

router.get('/card/config', cardConfigHandler);
router.post('/card/session', createCardSessionHandler);
router.get('/card/complete', completeCardSessionHandler);

export default router;
