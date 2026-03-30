import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

const steps = ["Customer Info", "Delivery", "Payment", "Review"];

const Checkout = () => {
  const { items, subtotal, deliveryFee, total, clearCart, itemCount } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    recipientName: "",
    recipientPhone: "",
    address: "",
    city: "Kigali",
    deliveryDate: "",
    deliveryTime: "morning",
    paymentMethod: "momo",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">No items to checkout</h1>
          <Link to="/shop" className="text-primary hover:underline text-sm">Browse Flowers</Link>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = () => {
    const paid = form.paymentMethod !== "cod";

    addOrder({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      address: form.address,
      city: form.city,
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      paymentMethod: form.paymentMethod as "momo" | "airtel" | "cod",
      paid,
      subtotal,
      deliveryFee,
      total,
      items,
    });

    toast.success("Order placed successfully! 🌸 We'll deliver your flowers with love.");
    clearCart();
    navigate("/");
  };

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.phone;
    if (step === 1) return form.recipientName && form.recipientPhone && form.address && form.deliveryDate;
    if (step === 2) return form.paymentMethod;
    return true;
  };

  const inputCls = "w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm border border-border";

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-3xl">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-6 sm:w-10 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl shadow-card p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-foreground mb-2">Your Information</h2>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                    <input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Jean Claude" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                    <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone *</label>
                    <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+250 7XX XXX XXX" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-foreground mb-2">Delivery Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Recipient Name *</label>
                      <input className={inputCls} value={form.recipientName} onChange={(e) => update("recipientName", e.target.value)} placeholder="Who receives the flowers?" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Recipient Phone *</label>
                      <input className={inputCls} value={form.recipientPhone} onChange={(e) => update("recipientPhone", e.target.value)} placeholder="+250 7XX XXX XXX" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Delivery Address *</label>
                    <input className={inputCls} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, house number, area" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">City</label>
                    <input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Delivery Date *</label>
                      <input type="date" className={inputCls} value={form.deliveryDate} onChange={(e) => update("deliveryDate", e.target.value)} min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Preferred Time</label>
                      <select className={inputCls} value={form.deliveryTime} onChange={(e) => update("deliveryTime", e.target.value)}>
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 8PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-foreground mb-2">Payment Method</h2>
                  {[
                    { id: "momo", label: "MTN Mobile Money", desc: "Pay via MTN MoMo" },
                    { id: "airtel", label: "Airtel Money", desc: "Pay via Airtel Money" },
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your flowers" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        form.paymentMethod === method.id ? "border-primary bg-primary-light" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={(e) => update("paymentMethod", e.target.value)} className="mt-1 accent-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-foreground mb-2">Order Review</h2>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-muted-foreground">Name:</p><p className="text-foreground font-medium">{form.name}</p>
                      <p className="text-muted-foreground">Email:</p><p className="text-foreground font-medium">{form.email}</p>
                      <p className="text-muted-foreground">Recipient:</p><p className="text-foreground font-medium">{form.recipientName}</p>
                      <p className="text-muted-foreground">Delivery:</p><p className="text-foreground font-medium">{form.deliveryDate} ({form.deliveryTime})</p>
                      <p className="text-muted-foreground">Address:</p><p className="text-foreground font-medium">{form.address}, {form.city}</p>
                      <p className="text-muted-foreground">Payment:</p><p className="text-foreground font-medium capitalize">{form.paymentMethod === "momo" ? "MTN MoMo" : form.paymentMethod === "airtel" ? "Airtel Money" : "Cash on Delivery"}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Items ({itemCount})</h3>
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                        <span className="text-foreground font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6 pt-4 border-t border-border">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canNext()}
                    className="inline-flex items-center gap-1 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-40"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    className="inline-flex items-center gap-1 px-6 py-2.5 bg-accent text-accent-foreground font-semibold rounded-lg hover:brightness-110 transition-all text-sm"
                  >
                    🌸 Place Order
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Summary sidebar */}
          <div>
            <div className="bg-card rounded-xl shadow-card p-5 sticky top-20">
              <h3 className="font-display font-bold text-foreground mb-3 text-sm">Summary</h3>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-2">
                    <img src={item.product.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Delivery</span><span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground text-sm pt-1">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
