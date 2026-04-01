import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/context/CartContext";

export type OrderStatus = "processing" | "delivered" | "cancelled";
export type PaymentMethod = "momo" | "airtel" | "cod";

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
  paid: boolean;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItemSnapshot[];
  createdAt: string;
}

interface CreateOrderInput {
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

interface OrderContextType {
  orders: Order[];
  addOrder: (input: CreateOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const STORAGE_KEY = "flora-belle-orders";

const readStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
};

const createOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(readStoredOrders);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const value = useMemo<OrderContextType>(() => ({
    orders,
    addOrder: (input) => {
      const nextOrder: Order = {
        id: createOrderId(),
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        address: input.address,
        city: input.city,
        deliveryDate: input.deliveryDate,
        deliveryTime: input.deliveryTime,
        paymentMethod: input.paymentMethod,
        paid: input.paid,
        status: "processing",
        itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        total: input.total,
        items: input.items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [nextOrder, ...prev]);
      return nextOrder;
    },
    updateOrderStatus: (orderId, status) => {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
    },
  }), [orders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};