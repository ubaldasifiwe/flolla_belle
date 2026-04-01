import { useMemo, useState } from "react";
import { categories, formatPrice, Product } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import { type Order, type OrderStatus, useOrders } from "@/context/OrderContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ShoppingCart, Users, TrendingUp, DollarSign, Eye,
  BarChart3, Tag, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  XCircle, Star, Search, Filter, MoreVertical, Edit, Trash2, Plus, X, Save, ImageIcon, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { toast } from "sonner";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 1200000, orders: 45 },
  { month: "Feb", revenue: 1800000, orders: 62 },
  { month: "Mar", revenue: 1500000, orders: 53 },
  { month: "Apr", revenue: 2200000, orders: 78 },
  { month: "May", revenue: 2800000, orders: 95 },
  { month: "Jun", revenue: 2400000, orders: 82 },
  { month: "Jul", revenue: 3100000, orders: 110 },
];

const categoryRevenue = categories.slice(0, 7).map((cat, i) => ({
  name: cat.name,
  value: [35, 20, 12, 10, 8, 8, 7][i] || 5,
}));

const PIE_COLORS = [
  "hsl(333, 71%, 50%)", "hsl(355, 100%, 70%)", "hsl(30, 80%, 55%)",
  "hsl(200, 70%, 50%)", "hsl(150, 60%, 45%)", "hsl(270, 50%, 55%)", "hsl(45, 90%, 55%)"
];

const demoOrders: AdminOrderRow[] = [
  { id: "ORD-1042", customer: "Marie Uwase", items: 3, total: 85000, status: "delivered", paid: true, date: "2025-03-26" },
  { id: "ORD-1041", customer: "Jean Mugabo", items: 1, total: 35000, status: "processing", paid: true, date: "2025-03-26" },
  { id: "ORD-1040", customer: "Alice Kamari", items: 5, total: 142000, status: "processing", paid: false, date: "2025-03-25" },
  { id: "ORD-1039", customer: "David Habimana", items: 2, total: 67000, status: "delivered", paid: true, date: "2025-03-25" },
  { id: "ORD-1038", customer: "Grace Ingabire", items: 4, total: 115000, status: "delivered", paid: true, date: "2025-03-24" },
  { id: "ORD-1037", customer: "Samuel Niyonzima", items: 1, total: 22000, status: "cancelled", paid: false, date: "2025-03-24" },
  { id: "ORD-1036", customer: "Diane Mukiza", items: 2, total: 55000, status: "delivered", paid: true, date: "2025-03-23" },
  { id: "ORD-1035", customer: "Patrick Ndayisaba", items: 3, total: 98000, status: "delivered", paid: true, date: "2025-03-23" },
];

type AdminOrderRow = {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  address?: string;
  city?: string;
  items: number;
  total: number;
  status: OrderStatus;
  paid: boolean;
  date: string;
  createdAt?: string;
  paymentMethod?: string;
  lineItems?: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
};

type CustomerRow = {
  name: string;
  email?: string;
  phone?: string;
  orders: number;
  spent: number;
  avatar: string;
  lastOrderDate: string;
  status: "New" | "Repeat";
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CU";

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

const paymentMethodLabel = (value?: string) => {
  switch (value) {
    case "momo":
      return "MTN MoMo";
    case "airtel":
      return "Airtel Money";
    case "cod":
      return "Cash on Delivery";
    default:
      return value || "—";
  }
};

const mapOrdersForAdmin = (orders: Order[]): AdminOrderRow[] =>
  orders.map((order) => ({
    id: order.id,
    customer: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    address: order.address,
    city: order.city,
    items: order.itemCount,
    total: order.total,
    status: order.status,
    paid: order.paid,
    date: formatOrderDate(order.createdAt),
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod,
    lineItems: order.items,
  }));

const buildCustomerRows = (orders: AdminOrderRow[]): CustomerRow[] => {
  const customers = new Map<string, CustomerRow>();

  orders.forEach((order) => {
    const key = order.customerEmail || `${order.customer}-${order.customerPhone || ""}`;
    const existing = customers.get(key);

    if (existing) {
      existing.orders += 1;
      existing.spent += order.total;
      if (new Date(order.date).getTime() >= new Date(existing.lastOrderDate).getTime()) {
        existing.lastOrderDate = order.date;
      }
      existing.status = existing.orders > 1 ? "Repeat" : "New";
      return;
    }

    customers.set(key, {
      name: order.customer,
      email: order.customerEmail,
      phone: order.customerPhone,
      orders: 1,
      spent: order.total,
      avatar: getInitials(order.customer),
      lastOrderDate: order.date,
      status: "New",
    });
  });

  return Array.from(customers.values()).sort((a, b) => b.spent - a.spent);
};

const statusIcon = (s: string) => {
  switch (s) {
    case "delivered": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "processing": return <Clock className="w-4 h-4 text-amber-500" />;
    case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
    default: return null;
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "delivered": return "bg-green-100 text-green-700";
    case "processing": return "bg-amber-100 text-amber-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-muted text-muted-foreground";
  }
};

// ── Overview Tab ──
export const OverviewTab = () => {
  const { productList } = useProducts();
  const { orders } = useOrders();
  const liveOrders = useMemo(() => mapOrdersForAdmin(orders), [orders]);
  const overviewOrders = liveOrders.length > 0 ? liveOrders : demoOrders;
  const topCustomers = useMemo(() => buildCustomerRows(overviewOrders).slice(0, 5), [overviewOrders]);
  const totalRevenue = overviewOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = overviewOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const stats = [
    { label: "Total Revenue", value: `RWF ${(totalRevenue / 1000000).toFixed(1)}M`, change: "+18.2%", up: true, icon: DollarSign },
    { label: "Total Orders", value: totalOrders.toString(), change: "+12.5%", up: true, icon: ShoppingCart },
    { label: "Avg Order Value", value: formatPrice(avgOrderValue), change: "+4.1%", up: true, icon: TrendingUp },
    { label: "Products", value: productList.length.toString(), change: "+6", up: true, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-green-600" : "text-red-500"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(333, 71%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(333, 71%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 83%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(333, 71%, 50%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {categoryRevenue.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryRevenue.slice(0, 6).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Orders</h3>
            <span className="text-xs text-muted-foreground">{overviewOrders.length} orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {overviewOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium text-primary">{o.id}</td>
                    <td className="p-3 text-foreground">{o.customer}</td>
                    <td className="p-3 text-foreground">{formatPrice(o.total)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusColor(o.status)}`}>
                        {statusIcon(o.status)}
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Top Customers</h3>
          <div className="space-y-4">
            {topCustomers.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                </div>
                <p className="text-sm font-semibold text-foreground whitespace-nowrap">{formatPrice(c.spent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Product Form defaults ──
const emptyProduct = {
  name: "",
  price: 0,
  originalPrice: undefined as number | undefined,
  category: "love",
  flowerType: "Roses",
  shortDescription: "",
  description: "",
  quantity: 50,
  imageUrl: "",
};

// ── Products Tab with CRUD ──
export const ProductsTab = () => {
  const { productList, setProductList } = useProducts();
  
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({ ...emptyProduct });

  const allCategories = [...new Set(productList.map(p => p.category))];
  const filtered = productList.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ ...emptyProduct });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      flowerType: product.flowerType,
      shortDescription: product.shortDescription,
      description: product.description,
      quantity: product.quantity,
      imageUrl: typeof product.image === "string" ? product.image : "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || formData.price <= 0) {
      toast.error("Please fill in product name and a valid price.");
      return;
    }

    if (editingProduct) {
      // Update existing
      setProductList(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                price: formData.price,
                originalPrice: formData.originalPrice,
                category: formData.category,
                flowerType: formData.flowerType,
                shortDescription: formData.shortDescription,
                description: formData.description,
                quantity: formData.quantity,
                inStock: formData.quantity > 0,
              }
            : p
        )
      );
      toast.success(`"${formData.name}" updated successfully!`);
    } else {
      // Add new
      const newProduct: Product = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        originalPrice: formData.originalPrice,
        image: formData.imageUrl || "/placeholder.svg",
        images: formData.imageUrl ? [formData.imageUrl] : ["/placeholder.svg"],
        category: formData.category,
        flowerType: formData.flowerType,
        rating: 0,
        reviewCount: 0,
        inStock: formData.quantity > 0,
        quantity: formData.quantity,
        shortDescription: formData.shortDescription,
        description: formData.description,
        sizes: [{ label: "Standard", price: formData.price }],
      };
      setProductList(prev => [newProduct, ...prev]);
      toast.success(`"${formData.name}" added successfully!`);
    }

    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    const product = productList.find(p => p.id === id);
    setProductList(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    toast.success(`"${product?.name}" deleted.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none"
          >
            <option value="all">All Categories</option>
            {allCategories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <Button size="sm" onClick={openAddForm}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Qty</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground capitalize">{p.category}</td>
                  <td className="p-4 text-foreground font-medium">{formatPrice(p.price)}</td>
                  <td className="p-4 text-foreground">{p.quantity}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-foreground">{p.rating}</span>
                      <span className="text-muted-foreground">({p.reviewCount})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditForm(p)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {productList.length} products
        </div>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Product Name *</Label>
              <Input id="prod-name" placeholder="e.g. Red Rose Bouquet" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prod-price">Price (RWF) *</Label>
                <Input id="prod-price" type="number" min={0} value={formData.price || ""} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-original-price">Original Price (RWF)</Label>
                <Input id="prod-original-price" type="number" min={0} placeholder="Optional" value={formData.originalPrice || ""} onChange={e => setFormData(f => ({ ...f, originalPrice: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prod-category">Category</Label>
                <select
                  id="prod-category"
                  value={formData.category}
                  onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-qty">Quantity *</Label>
                <Input id="prod-qty" type="number" min={0} value={formData.quantity} onChange={e => setFormData(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-type">Product Type</Label>
              <Input id="prod-type" placeholder="e.g. Roses, Whisky, Necklace" value={formData.flowerType} onChange={e => setFormData(f => ({ ...f, flowerType: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-short">Short Description</Label>
              <Input id="prod-short" placeholder="Brief product summary" value={formData.shortDescription} onChange={e => setFormData(f => ({ ...f, shortDescription: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">Full Description</Label>
              <Textarea id="prod-desc" placeholder="Detailed product description..." rows={4} value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-img">Image URL</Label>
              <Input id="prod-img" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Paste an image URL or leave blank for placeholder.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productList.find(p => p.id === deleteConfirm)?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Orders Tab ──
export const OrdersTab = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const adminOrders = useMemo(() => mapOrdersForAdmin(orders), [orders]);
  const filtered = statusFilter === "all" ? adminOrders : adminOrders.filter(o => o.status === statusFilter);
  const selectedOrder = adminOrders.find((order) => order.id === selectedOrderId) || null;

  const orderStats = [
    { label: "All Orders", count: adminOrders.length, color: "text-foreground" },
    { label: "Processing", count: adminOrders.filter(o => o.status === "processing").length, color: "text-amber-600" },
    { label: "Delivered", count: adminOrders.filter(o => o.status === "delivered").length, color: "text-green-600" },
    { label: "Cancelled", count: adminOrders.filter(o => o.status === "cancelled").length, color: "text-red-500" },
  ];

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order ${orderId} marked as ${status}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {orderStats.map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.label === "All Orders" ? "all" : s.label.toLowerCase())}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              (s.label === "All Orders" ? "all" : s.label.toLowerCase()) === statusFilter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted/50"
            }`}
          >
            {s.label} <span className={`ml-1 ${s.color}`}>({s.count})</span>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {adminOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No customer orders yet. Orders placed from checkout will appear here.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-primary">{o.id}</td>
                    <td className="p-4 text-foreground">{o.customer}</td>
                    <td className="p-4 text-muted-foreground">{o.items}</td>
                    <td className="p-4 text-foreground font-medium">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${o.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <CreditCard className="w-3.5 h-3.5" />
                        {o.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusColor(o.status)}`}>
                        {statusIcon(o.status)} {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{o.date}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 min-w-[170px]">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrderId(o.id)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground outline-none"
                        >
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Review customer details, purchased items, payment, and delivery info.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <p className="font-medium text-foreground">Customer</p>
                  <p className="text-muted-foreground">{selectedOrder.customer}</p>
                  <p className="text-muted-foreground">{selectedOrder.customerEmail || "No email"}</p>
                  <p className="text-muted-foreground">{selectedOrder.customerPhone || "No phone"}</p>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <p className="font-medium text-foreground">Delivery</p>
                  <p className="text-muted-foreground">{selectedOrder.recipientName || "—"}</p>
                  <p className="text-muted-foreground">{selectedOrder.recipientPhone || "—"}</p>
                  <p className="text-muted-foreground">{selectedOrder.address}, {selectedOrder.city}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap gap-2 justify-between">
                  <div>
                    <p className="font-medium text-foreground">Payment</p>
                    <p className="text-muted-foreground">{paymentMethodLabel(selectedOrder.paymentMethod)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${selectedOrder.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    <CreditCard className="w-3.5 h-3.5" />
                    {selectedOrder.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.lineItems?.map((item) => (
                    <div key={`${selectedOrder.id}-${item.name}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Analytics Tab ──
export const AnalyticsTab = () => {
  const { productList } = useProducts();
  const ordersByMonth = revenueData.map(d => ({ month: d.month, orders: d.orders }));

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ordersByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 83%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(333, 71%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 83%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(240, 5%, 10%)" tickFormatter={v => `${v / 1000000}M`} />
              <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(333, 71%, 50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(333, 71%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-2">Top Selling Products</h3>
          <div className="space-y-3 mt-4">
            {productList.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.reviewCount} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-2">Category Performance</h3>
          <div className="space-y-3 mt-4">
            {categoryRevenue.map((c, i) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground">{c.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-2">Quick Stats</h3>
          <div className="space-y-4 mt-4">
            {[
              { label: "Conversion Rate", value: "3.2%", sub: "+0.4% from last month" },
              { label: "Avg Items Per Order", value: "2.8", sub: "Across all categories" },
              { label: "Return Rate", value: "1.2%", sub: "Below industry avg" },
              { label: "Customer Satisfaction", value: "4.7/5", sub: "Based on 342 reviews" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Customers Tab ──
export const CustomersTab = () => {
  const { orders } = useOrders();
  const customerOrders = useMemo(() => mapOrdersForAdmin(orders), [orders]);
  const customers = useMemo(() => buildCustomerRows(customerOrders), [customerOrders]);
  const repeatCustomers = customers.filter((customer) => customer.orders > 1).length;
  const avgLifetimeValue = customers.length
    ? Math.round(customers.reduce((sum, customer) => sum + customer.spent, 0) / customers.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length.toString(), icon: Users },
          { label: "New This Month", value: customers.filter((customer) => customer.status === "New").length.toString(), icon: ArrowUpRight },
          { label: "Repeat Rate", value: customers.length ? `${Math.round((repeatCustomers / customers.length) * 100)}%` : "0%", icon: TrendingUp },
          { label: "Avg Lifetime Value", value: customers.length ? formatPrice(avgLifetimeValue) : formatPrice(0), icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">All Customers</h3>
        </div>
        <div className="overflow-x-auto">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No customers yet. Once someone completes checkout, they will appear here.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Orders</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total Spent</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Order</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={`${c.name}-${c.email || c.phone}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.avatar}
                        </div>
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="space-y-1">
                        <p>{c.email || "No email"}</p>
                        <p>{c.phone || "No phone"}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.orders}</td>
                    <td className="p-4 text-foreground font-medium">{formatPrice(c.spent)}</td>
                    <td className="p-4 text-muted-foreground">{c.lastOrderDate}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === "Repeat" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
