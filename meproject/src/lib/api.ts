import type { Category, Product, ProductSize } from "@/data/products";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

type BackendImage = { id?: number; image_url: string; position?: number };
type BackendSize = { id?: number; label: string; price: number };

type BackendProduct = {
  id: number;
  name: string;
  base_price: number;
  original_price: number | null;
  main_image_url: string | null;
  category_slug?: string;
  flower_type: string | null;
  rating: number;
  review_count: number;
  in_stock: number;
  badge: string | null;
  short_description: string | null;
  description: string | null;
  images?: BackendImage[];
  sizes?: BackendSize[];
};

type BackendCategory = {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  emoji: string | null;
};

function mapProduct(raw: BackendProduct): Product {
  const images = (raw.images || []).map((i) => i.image_url).filter(Boolean);
  const mainImage = raw.main_image_url || images[0] || "";
  const mappedSizes: ProductSize[] = (raw.sizes || []).map((s) => ({
    label: s.label,
    price: Number(s.price),
  }));

  return {
    id: String(raw.id),
    name: raw.name,
    price: Number(raw.base_price),
    originalPrice: raw.original_price != null ? Number(raw.original_price) : undefined,
    image: mainImage,
    images: images.length ? images : [mainImage],
    category: raw.category_slug || "",
    flowerType: raw.flower_type || "Mixed Bouquet",
    rating: Number(raw.rating || 0),
    reviewCount: Number(raw.review_count || 0),
    inStock: Boolean(raw.in_stock),
    badge: raw.badge || undefined,
    shortDescription: raw.short_description || "",
    description: raw.description || "",
    sizes: mappedSizes,
  };
}

function mapCategory(raw: BackendCategory): Category {
  return {
    id: raw.slug,
    name: raw.name,
    image: raw.image_url || "",
    emoji: raw.emoji || "🌸",
    productCount: 0,
  };
}

export async function getProducts(params?: {
  category?: string;
  flowerType?: string;
  sort?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.flowerType) qs.set("flowerType", params.flowerType);
  if (params?.sort && params.sort !== "default") qs.set("sort", params.sort);

  const url = `${API_BASE}/products${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: BackendProduct[] = await res.json();
  return data.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  const data: BackendProduct = await res.json();
  return mapProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data: BackendCategory[] = await res.json();
  return data.map(mapCategory);
}

export async function createOrder(payload: unknown) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}

export async function subscribeToNewsletter(email: string) {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}