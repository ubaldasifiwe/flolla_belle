import { Heart } from "lucide-react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Wishlist = () => (
  <Layout>
    <div className="container py-20 text-center">
      <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your Wishlist is Empty</h1>
      <p className="text-muted-foreground text-sm mb-6">Save your favorite flowers to send later.</p>
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
      >
        Browse Flowers
      </Link>
    </div>
  </Layout>
);

export default Wishlist;
