import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin CRUD (later add auth middleware)
router.post('/', createProductHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;