import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, Clock, Star, Mail, Flower2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import heroBanner from "@/assets/hero-banner.jpg";

const testimonials = [
  { name: "Marie L.", text: "The roses were absolutely stunning! Delivered fresh and on time. My wife loved them.", rating: 5 },
  { name: "Jean P.", text: "Best flower shop in Kigali. The wedding centerpieces were breathtaking.", rating: 5 },
  { name: "Alice K.", text: "Same-day delivery saved me! Beautiful arrangement for my mom's birthday.", rating: 5 },
];

const Index = () => {
  const { productList: products } = useProducts();
  const bestSellers = products.filter((p) => p.badge === "Best Seller" || p.badge === "Popular").slice(0, 4);
  const newArrivals = products.filter((p) => p.badge === "New" || p.badge === "Premium").slice(0, 4);
  const sweetTreats = products.filter((p) => p.category === "cupcakes" || p.category === "cakes");
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark">
        <img
          src={heroBanner}
          alt="Beautiful flower arrangements at Flora Belle"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative container py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              <Flower2 className="w-3.5 h-3.5" /> Same-Day Delivery in Kigali
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground leading-tight mb-4">
              Send Beautiful Flowers for Every Occasion
            </h1>
            <p className="text-primary-foreground/80 text-sm sm:text-base mb-6 leading-relaxed">
              Fresh roses, lilies, sunflowers &amp; handcrafted bouquets — delivered with love across Rwanda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 transition-all text-sm"
              >
                Shop Flowers <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?category=love"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary-foreground/30 text-primary-foreground font-medium rounded-lg hover:bg-primary-foreground/10 transition-all text-sm"
              >
                ❤️ Valentine's Collection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Shop by Occasion</h2>
            <p className="text-sm text-muted-foreground mt-1">Find the perfect arrangement for every moment</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/shop?category=${cat.id}`}
                  className="group block rounded-xl overflow-hidden relative aspect-[4/3]"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-lg mb-0.5 block">{cat.emoji}</span>
                    <h3 className="text-sm font-semibold text-background">{cat.name}</h3>
                    <p className="text-[10px] text-background/70">{cat.productCount} arrangements</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-10 sm:py-16 bg-secondary">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Best Sellers</h2>
            <Link to="/shop" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Same-day delivery promo */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="rounded-2xl bg-primary p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground mb-3">
                🌹 Same-Day Flower Delivery
              </h2>
              <p className="text-primary-foreground/80 text-sm mb-5">
                Order before 2 PM and receive your flowers the same day in Kigali. Free delivery on orders over RWF 50,000!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:brightness-110 transition-all text-sm"
              >
                Order Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 text-primary-foreground text-center">
              {[
                { value: "200+", label: "Arrangements" },
                { value: "5K+", label: "Happy Recipients" },
                { value: "Same Day", label: "Delivery" },
              ].map((s) => (
                <div key={s.label} className="px-4">
                  <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
                  <div className="text-xs opacity-70 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sweet Treats — Cakes & Cupcakes */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">🧁 Cakes & Cupcakes</h2>
            <Link to="/shop?category=cupcakes" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sweetTreats.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-10 sm:py-16 bg-secondary">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">New & Premium</h2>
            <Link to="/shop" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 sm:py-16 bg-secondary">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card rounded-xl shadow-card"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <p className="text-sm font-semibold text-card-foreground">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Same-Day Delivery", desc: "Free delivery in Kigali on orders over RWF 50,000." },
              { icon: Shield, title: "Freshness Guaranteed", desc: "We source the freshest flowers from local Rwandan farms." },
              { icon: Clock, title: "Custom Messages", desc: "Add a personal note to every bouquet you send." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 bg-card rounded-xl shadow-card">
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-10 sm:py-16 bg-secondary">
        <div className="container max-w-2xl text-center">
          <Mail className="w-10 h-10 mx-auto mb-4 text-primary" />
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">Get Flower Inspiration</h2>
          <p className="text-sm text-muted-foreground mb-6">Subscribe for exclusive deals, seasonal arrangements, and flower care tips.</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); toast("Subscribed! 🌸"); }}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm border border-border"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

function toast(msg: string) {
  import("sonner").then((m) => m.toast.success(msg));
}
