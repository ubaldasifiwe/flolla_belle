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
  flutterwaveWebhookHandler,
} from '../controllers/flutterwaveCardController.js';

const router = Router();

router.post('/initiate', initiatePaymentHandler);
router.get('/order/:orderId/status', getPaymentStatusHandler);
router.post('/simulate-complete/:orderId', simulateCompleteHandler);

router.get('/card/config', cardConfigHandler);
router.post('/card/session', createCardSessionHandler);
router.get('/card/complete', completeCardSessionHandler);
router.post('/card/webhook', flutterwaveWebhookHandler);

export default router;
