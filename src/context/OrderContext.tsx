import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Order } from "@/types/order";
import type { DbCustomerRow } from "@/lib/api";
import { getDbCustomers, getOrders, patchOrder } from "@/lib/api";
import type { OrderStatus } from "@/types/order";
import { useAuth } from "@/context/AuthContext";

interface OrderContextType {
  orders: Order[];
  ordersLoading: boolean;
  dbCustomers: DbCustomerRow[];
  refreshOrdersAndCustomers: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin, authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbCustomers, setDbCustomers] = useState<DbCustomerRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const refreshOrdersAndCustomers = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const [nextOrders, nextCustomers] = await Promise.all([
        getOrders(),
        getDbCustomers().catch(() => [] as DbCustomerRow[]),
      ]);
      setOrders(nextOrders);
      setDbCustomers(Array.isArray(nextCustomers) ? nextCustomers : []);
    } catch {
      setOrders([]);
      setDbCustomers([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  /** Orders & customers APIs require admin auth — only load after session is known and user is admin. */
  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      setOrders([]);
      setDbCustomers([]);
      setOrdersLoading(false);
      return;
    }

    void refreshOrdersAndCustomers();
  }, [isAdmin, authLoading, refreshOrdersAndCustomers]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    await patchOrder(orderId, { status });
    await refreshOrdersAndCustomers();
  }, [refreshOrdersAndCustomers]);

  const value = useMemo<OrderContextType>(
    () => ({
      orders,
      ordersLoading,
      dbCustomers,
      refreshOrdersAndCustomers,
      updateOrderStatus,
    }),
    [orders, ordersLoading, dbCustomers, refreshOrdersAndCustomers, updateOrderStatus]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};

export type { Order, OrderStatus, PaymentMethod, OrderItemSnapshot, CreateOrderInput } from "@/types/order";
