import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { categories, flowerTypes } from "@/data/products";
import { getProducts } from "@/lib/api";

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCategory = searchParams.get("category") || "";
  const [activeFlowerType, setActiveFlowerType] = useState("");
  const [sort, setSort] = useState("default");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts({
          category: activeCategory || undefined,
          flowerType: activeFlowerType || undefined,
          sort,
        });
        setProducts(data);
      } catch (e) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, activeFlowerType, sort]);

  const filtered = useMemo(() => products, [products]);

  const setCategory = (cat: string) => {
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground">Occasion</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
          >
            All Flowers
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground">Flower Type</h3>
        <div className="space-y-1">
          <button
            onClick={() => setActiveFlowerType("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeFlowerType ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
          >
            All Types
          </button>
          {flowerTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFlowerType(type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeFlowerType === type ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              {activeCategory ? categories.find((c) => c.id === activeCategory)?.name || "Shop" : "All Flowers"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} arrangements</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterContent />
          </aside>
          <div className="flex-1">
            {loading && <p className="text-sm text-muted-foreground mb-4">Loading products...</p>}
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            {!loading && !error && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No flowers found for this selection.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-72 bg-background z-50 shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-foreground">Filters</h2>
                <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Shop;