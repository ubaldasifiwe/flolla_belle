import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', requireAdmin, createProductHandler);
router.put('/:id', requireAdmin, updateProductHandler);
router.delete('/:id', requireAdmin, deleteProductHandler);

export default router;