import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Heart, User, Home, Grid3X3, Flower2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/cart", label: "Cart" },
  { to: "/wishlist", label: "Wishlist" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <>
      {/* Top bar */}
      <div className="hidden sm:block bg-primary text-primary-foreground text-xs py-1.5">
        <div className="container flex justify-between items-center">
          <span>🌹 Same-day flower delivery in Kigali — Free over RWF 50,000</span>
          <span>📞 +250 788 000 000</span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14 sm:h-16">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-foreground" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Flower2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Flora<span className="text-primary">Belle</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/wishlist" className="hidden sm:flex p-2 rounded-full hover:bg-secondary transition-colors text-foreground">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="hidden sm:flex p-2 rounded-full hover:bg-secondary transition-colors text-foreground">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
              <div className="container py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search flowers, bouquets, occasions..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm" autoFocus />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-lg font-bold">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <nav className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-secondary text-foreground">
                  My Account
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border sm:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/shop", icon: Grid3X3, label: "Shop" },
            { to: "/cart", icon: ShoppingCart, label: "Cart", badge: itemCount },
            { to: "/wishlist", icon: Heart, label: "Wishlist" },
            { to: "/account", icon: User, label: "Account" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-0.5 text-[10px] relative px-3 py-1 ${location.pathname === item.to ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="w-5 h-5" />
              {item.badge ? (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{item.badge}</span>
              ) : null}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
