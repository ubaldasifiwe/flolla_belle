import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { getProducts } from "@/lib/api";

interface ProductContextType {
  productList: Product[];
  productsLoading: boolean;
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await getProducts();
      setProductList(data);
    } catch {
      setProductList([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const value = useMemo<ProductContextType>(
    () => ({
      productList,
      productsLoading,
      setProductList,
      refreshProducts,
    }),
    [productList, productsLoading, refreshProducts]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};
