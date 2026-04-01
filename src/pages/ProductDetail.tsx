import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { productList: products } = useProducts();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [customMessage, setCustomMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Arrangement Not Found</h1>
          <Link to="/shop" className="text-primary hover:underline text-sm">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const currentPrice = product.sizes[selectedSize]?.price || product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {product.badge && (
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className={`text-sm font-medium mb-4 ${product.inStock ? "text-accent" : "text-destructive"}`}>
              {product.inStock ? "✓ In Stock — Ready for delivery" : "✗ Currently Unavailable"}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground mb-2 block">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(i)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        selectedSize === i
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {size.label} — {formatPrice(size.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom message */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" /> Add a Personal Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your message here (e.g., Happy Birthday! With love...)"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm border border-border resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{customMessage.length}/200 characters</p>
            </div>

            {/* Delivery date */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Preferred Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={today}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-secondary text-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm border border-border"
              />
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-secondary transition-colors text-foreground">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2.5 font-medium text-sm min-w-[3rem] text-center text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 hover:bg-secondary transition-colors text-foreground">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 text-sm"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground text-sm">
                <Heart className="w-4 h-4" /> Wishlist
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Same-day delivery" },
                { icon: Shield, text: "Freshness guaranteed" },
                { icon: MessageSquare, text: "Free card message" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
                  <f.icon className="w-4 h-4 text-primary shrink-0" /> {f.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-6">You May Also Love</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
