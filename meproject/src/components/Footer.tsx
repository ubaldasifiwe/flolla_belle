import { Link } from "react-router-dom";
import { Flower2, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background pt-12 pb-24 sm:pb-8">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Flower2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Flora<span className="text-primary"> Belle</span>
            </span>
          </Link>
          <p className="text-sm opacity-70 leading-relaxed">
            Rwanda's premier online flower shop. Fresh bouquets, same-day delivery, and flowers for every occasion.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm opacity-70">
            {["All Flowers", "Roses", "Lilies", "Birthday", "Wedding", "Sympathy"].map((l) => (
              <li key={l}>
                <Link to="/shop" className="hover:text-primary transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm opacity-70">
            {["Delivery Info", "Returns", "FAQ", "Privacy Policy", "Terms"].map((l) => (
              <li key={l}>
                <Link to="/shop" className="hover:text-primary transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Kigali, Rwanda</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> +250 788 000 000</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> hello@FloraBelle.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 pt-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} Ifeza.rw — Fresh Flowers, Delivered with Love 🌸
      </div>
    </div>
  </footer>
);

export default Footer;
