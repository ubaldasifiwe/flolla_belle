import type { CartItem } from "@/context/CartContext";

export type OrderStatus = "processing" | "delivered" | "cancelled";
export type PaymentMethod = "momo" | "airtel" | "cod" | "card";

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  /** Raw DB value: awaiting_payment, payment_requested, paid, failed, pending (COD unpaid), etc. */
  paymentStatus: string;
  paymentReference?: string | null;
  paid: boolean;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItemSnapshot[];
  createdAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  paid: boolean;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: CartItem[];
}
