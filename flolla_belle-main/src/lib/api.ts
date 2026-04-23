import type { Category, Product, ProductSize } from "@/data/products";
import type { Order, OrderStatus, PaymentMethod } from "@/types/order";

/** Use `/api` with Vite dev proxy so httpOnly auth cookies stay same-origin. Override via `VITE_API_BASE_URL` for production. */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, { credentials: "include", ...init });
}

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
  stock_quantity?: number | null;
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

export type BackendOrderItem = {
  id?: number;
  product_id: number;
  product_name_snapshot: string;
  size_label?: string | null;
  unit_price: number;
  quantity: number;
  image_url?: string | null;
};

export type BackendOrderRow = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  city: string;
  delivery_date: string;
  delivery_time_slot: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency?: string;
  payment_method: string;
  payment_status: string;
  payment_reference?: string | null;
  payment_external_id?: string | null;
  status: string;
  created_at?: string;
  items?: BackendOrderItem[];
};

export type DbCustomerRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  first_order_at: string | null;
  last_order_at: string | null;
  order_count: number;
  total_spent: number | string;
};

function mapProduct(raw: BackendProduct): Product {
  const images = (raw.images || []).map((i) => i.image_url).filter(Boolean);
  const mainImage = raw.main_image_url || images[0] || "";
  const mappedSizes: ProductSize[] =
    (raw.sizes || []).length > 0
      ? (raw.sizes || []).map((s) => ({
          label: s.label,
          price: Number(s.price),
        }))
      : [{ label: "Standard", price: Number(raw.base_price) }];

  const stockQty =
    raw.stock_quantity != null && !Number.isNaN(Number(raw.stock_quantity))
      ? Number(raw.stock_quantity)
      : Number(raw.in_stock) > 1
        ? Number(raw.in_stock)
        : Number(raw.in_stock) > 0
          ? 50
          : 0;

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
    inStock: stockQty > 0,
    quantity: stockQty,
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

function mapDbStatus(status: string): OrderStatus {
  if (status === "delivered" || status === "cancelled") return status;
  return "processing";
}

export function mapBackendOrderToOrder(row: BackendOrderRow): Order {
  const createdRaw = row.created_at;
  const createdAt = createdRaw
    ? new Date(createdRaw).toISOString()
    : new Date().toISOString();

  const paid =
    row.payment_status === "paid" ||
    row.payment_status === "completed" ||
    row.payment_status === "captured";

  const items = (row.items || []).map((it) => ({
    productId: String(it.product_id),
    name: it.product_name_snapshot,
    image: it.image_url || "/placeholder.svg",
    price: Number(it.unit_price),
    quantity: Number(it.quantity),
  }));

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return {
    id: `ORD-${row.id}`,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    address: row.address,
    city: row.city,
    deliveryDate: row.delivery_date,
    deliveryTime: row.delivery_time_slot,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status || "pending",
    paymentReference: row.payment_reference ?? null,
    paid,
    status: mapDbStatus(row.status),
    itemCount,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    items,
    createdAt,
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
  const res = await apiFetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: BackendProduct[] = await res.json();
  return data.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  const data: BackendProduct = await res.json();
  return mapProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data: BackendCategory[] = await res.json();
  return data.map(mapCategory);
}

export type CreateOrderResponse = BackendOrderRow & { items?: BackendOrderItem[] };

export async function createOrder(payload: unknown): Promise<CreateOrderResponse> {
  const res = await apiFetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}

export async function initiateMobilePayment(body: {
  orderId: string | number;
  provider: "momo" | "airtel";
  phone: string;
}): Promise<{ ok?: boolean; alreadyPaid?: boolean; reference?: string; message?: string; mode?: string }> {
  const res = await apiFetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Payment initiation failed");
  return data;
}

export async function createCardCheckoutSession(orderId: number | string): Promise<{ url: string; sessionId?: string }> {
  const res = await apiFetch(`${API_BASE}/payments/card/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok) throw new Error(data.message || "Could not start card checkout");
  if (!data.url) throw new Error("No checkout URL returned");
  return data as { url: string; sessionId?: string };
}

export async function completeCardCheckoutSession(sessionId: string): Promise<{
  paid: boolean;
  orderId?: number;
  payment_status?: string;
}> {
  const res = await apiFetch(
    `${API_BASE}/payments/card/complete?session_id=${encodeURIComponent(sessionId)}`
  );
  const data = (await res.json().catch(() => ({}))) as {
    paid?: boolean;
    orderId?: number;
    payment_status?: string;
    message?: string;
  };
  if (!res.ok) throw new Error(data.message || "Could not verify payment");
  return {
    paid: Boolean(data.paid),
    orderId: data.orderId,
    payment_status: data.payment_status,
  };
}

export async function getOrderPaymentStatus(
  orderId: string | number,
  email?: string
): Promise<{
  orderId: number;
  payment_status: string;
  paid: boolean;
  payment_reference: string | null;
  payment_method: string;
}> {
  const id = typeof orderId === "string" ? orderId.replace(/^ORD-/i, "") : String(orderId);
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  const res = await apiFetch(`${API_BASE}/payments/order/${encodeURIComponent(id)}/status${qs}`);
  if (!res.ok) throw new Error("Failed to get payment status");
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const res = await apiFetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data: BackendOrderRow[] = await res.json();
  return data.map(mapBackendOrderToOrder);
}

export async function patchOrder(orderId: string, body: { status?: OrderStatus; payment_status?: string }) {
  const res = await apiFetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update order");
  const row: BackendOrderRow = await res.json();
  return mapBackendOrderToOrder(row);
}

export async function getDbCustomers(): Promise<DbCustomerRow[]> {
  const res = await apiFetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export type AdminProductPayload = {
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  flowerType: string;
  shortDescription: string;
  description: string;
  quantity: number;
  imageUrl: string;
};

export async function adminCreateProduct(payload: AdminProductPayload): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category_slug: payload.category,
      name: payload.name,
      price: payload.price,
      originalPrice: payload.originalPrice,
      flowerType: payload.flowerType,
      shortDescription: payload.shortDescription,
      description: payload.description,
      quantity: payload.quantity,
      imageUrl: payload.imageUrl || undefined,
      inStock: payload.quantity > 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to create product");
  const data: BackendProduct = await res.json();
  return mapProduct(data);
}

export async function adminUpdateProduct(id: string, payload: AdminProductPayload): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category_slug: payload.category,
      name: payload.name,
      price: payload.price,
      originalPrice: payload.originalPrice,
      flowerType: payload.flowerType,
      shortDescription: payload.shortDescription,
      description: payload.description,
      quantity: payload.quantity,
      imageUrl: payload.imageUrl || undefined,
      inStock: payload.quantity > 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to update product");
  const data: BackendProduct = await res.json();
  return mapProduct(data);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

export async function authLogin(email: string, password: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(data.message || "Login failed");
}

export async function authLogout(): Promise<void> {
  await apiFetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

export type AuthMeResult =
  | { authenticated: true; user: { email: string; role: string } }
  | { authenticated: false };

export async function authMe(): Promise<AuthMeResult> {
  const res = await apiFetch(`${API_BASE}/auth/me`);
  const data = (await res.json().catch(() => ({}))) as AuthMeResult;
  if (!res.ok) return { authenticated: false };
  return data;
}

export async function subscribeToNewsletter(email: string) {
  const res = await apiFetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}
