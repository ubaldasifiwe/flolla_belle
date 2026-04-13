import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/productModel.js';
import { getCategoryBySlug } from '../models/categoryModel.js';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildProductPatch(body) {
  const patch = {};

  if (body.name != null) patch.name = body.name;
  if (body.slug != null) patch.slug = body.slug;

  if (body.base_price != null) patch.base_price = body.base_price;
  if (body.price != null) patch.base_price = body.price;

  if (body.original_price !== undefined) patch.original_price = body.original_price;
  if (body.originalPrice !== undefined) patch.original_price = body.originalPrice;

  if (body.flower_type != null) patch.flower_type = body.flower_type;
  if (body.flowerType != null) patch.flower_type = body.flowerType;

  if (body.badge !== undefined) patch.badge = body.badge;

  if (body.short_description != null) patch.short_description = body.short_description;
  if (body.shortDescription != null) patch.short_description = body.shortDescription;

  if (body.description != null) patch.description = body.description;

  if (body.main_image_url != null) patch.main_image_url = body.main_image_url;
  if (body.mainImageUrl != null) patch.main_image_url = body.mainImageUrl;
  if (body.imageUrl != null) patch.main_image_url = body.imageUrl;

  if (body.rating != null) patch.rating = body.rating;
  if (body.review_count != null) patch.review_count = body.review_count;
  if (body.reviewCount != null) patch.review_count = body.reviewCount;

  if (body.in_stock != null) patch.in_stock = body.in_stock ? 1 : 0;
  if (body.inStock != null) patch.in_stock = body.inStock ? 1 : 0;

  if (body.stock_quantity != null) patch.stock_quantity = body.stock_quantity;
  if (body.stockQuantity != null) patch.stock_quantity = body.stockQuantity;
  if (body.quantity != null) patch.stock_quantity = body.quantity;

  if (body.category_id != null) patch.category_id = body.category_id;

  return patch;
}

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

export async function createProductHandler(req, res) {
  try {
    let { category_id } = req.body;
    if (req.body.category_slug && !category_id) {
      const cat = await getCategoryBySlug(req.body.category_slug);
      if (!cat) return res.status(400).json({ message: 'Invalid category_slug' });
      category_id = cat.id;
    }
    if (!category_id) {
      return res.status(400).json({ message: 'category_id or category_slug is required' });
    }

    const name = req.body.name;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'name is required' });
    }

    const base_price = req.body.base_price ?? req.body.price;
    if (base_price == null || Number(base_price) < 0) {
      return res.status(400).json({ message: 'price / base_price is required' });
    }

    const slug = req.body.slug || slugify(name);

    const id = await createProduct({
      category_id,
      name: String(name).trim(),
      slug,
      base_price: Number(base_price),
      original_price: req.body.original_price ?? req.body.originalPrice,
      flower_type: req.body.flower_type ?? req.body.flowerType,
      badge: req.body.badge,
      short_description: req.body.short_description ?? req.body.shortDescription,
      description: req.body.description,
      main_image_url: req.body.main_image_url ?? req.body.mainImageUrl ?? req.body.imageUrl,
      in_stock: req.body.in_stock ?? req.body.inStock,
      stock_quantity: req.body.stock_quantity ?? req.body.stockQuantity ?? req.body.quantity,
    });

    const product = await getProductById(id);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
}

export async function updateProductHandler(req, res) {
  try {
    const patch = buildProductPatch(req.body);

    if (req.body.category_slug) {
      const cat = await getCategoryBySlug(req.body.category_slug);
      if (!cat) return res.status(400).json({ message: 'Invalid category_slug' });
      patch.category_id = cat.id;
    }

    if (patch.stock_quantity != null) {
      patch.in_stock = Number(patch.stock_quantity) > 0 ? 1 : 0;
    }

    await updateProduct(req.params.id, patch);
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
