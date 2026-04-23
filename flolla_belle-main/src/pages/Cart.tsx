import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Flower2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, deliveryFee, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Flower2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground text-sm mb-6">Add some beautiful flowers to brighten someone's day!</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Browse Flowers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">
          Your Bouquet Cart <span className="text-muted-foreground text-lg font-sans font-normal">({itemCount} items)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-3">
            {items.map((item, i) => (
              <motion.div key={item.product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4 p-4 bg-card rounded-xl shadow-card">
                <Link to={`/product/${item.product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="font-semibold text-sm text-card-foreground hover:text-primary transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-sm font-bold text-foreground mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1.5 hover:bg-secondary transition-colors text-foreground">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-xs font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1.5 hover:bg-secondary transition-colors text-foreground">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:w-80 shrink-0">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-20">
              <h2 className="font-display font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                </div>
                {deliveryFee === 0 && (
                  <p className="text-xs text-accent font-medium">🎉 You qualify for free delivery!</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full mt-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm text-center">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="block text-center mt-3 text-sm text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
