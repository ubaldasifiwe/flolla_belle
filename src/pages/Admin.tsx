import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Flower2, LogOut, Home, LayoutDashboard, Package, ShoppingCart,
  Users, BarChart3, Settings, Menu, X, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OverviewTab, ProductsTab, OrdersTab, AnalyticsTab, CustomersTab } from "@/components/admin/AdminTabs";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const Admin = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/account");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "products": return <ProductsTab />;
      case "orders": return <OrdersTab />;
      case "customers": return <CustomersTab />;
      case "analytics": return <AnalyticsTab />;
      default: return <OverviewTab />;
    }
  };

  const activeLabel = sidebarItems.find(i => i.id === activeTab)?.label || "Overview";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-card border-r border-border fixed inset-y-0 left-0 z-40">
        <div className="flex items-center gap-2 px-5 h-14 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Flower2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Flora<span className="text-primary">Belle</span>
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /> Back to Store
          </Link>
          <button
            onClick={() => { logout(); navigate("/account"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card z-50 shadow-2xl lg:hidden">
              <div className="flex items-center justify-between px-5 h-14 border-b border-border">
                <span className="font-display text-lg font-bold text-foreground">
                  Flora<span className="text-primary">Belle</span>
                </span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-foreground" /></button>
              </div>
              <nav className="p-3 space-y-1">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-3 border-t border-border space-y-1">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50">
                  <Home className="w-4 h-4" /> Back to Store
                </Link>
                <button onClick={() => { logout(); navigate("/account"); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">{activeLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">{activeLabel}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {activeTab === "overview" && "Your store at a glance"}
              {activeTab === "products" && "Manage your product catalog"}
              {activeTab === "orders" && "Track and manage customer orders"}
              {activeTab === "customers" && "View your customer base"}
              {activeTab === "analytics" && "Detailed performance insights"}
            </p>
            {renderTab()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
