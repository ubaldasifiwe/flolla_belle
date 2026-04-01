import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/productModel.js';

export async function listProducts(req, res) {
  try {
    const filters = {
      category: req.query.category || null,
      flowerType: req.query.flowerType || null,
      sort: req.query.sort || 'default',
    };
    const products = await getAllProducts(filters);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
}

// For admin use; later you can protect with auth middleware
export async function createProductHandler(req, res) {
  try {
    const id = await createProduct(req.body);
    const product = await getProductById(id);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
}

export async function updateProductHandler(req, res) {
  try {
    await updateProduct(req.params.id, req.body);
    const product = await getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
}

export async function deleteProductHandler(req, res) {
  try {
    await deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
}