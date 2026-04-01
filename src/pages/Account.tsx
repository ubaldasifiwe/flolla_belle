import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Flower2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const Account = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (success) {
      navigate("/admin");
    } else {
      setError("Invalid credentials. Only admin access is allowed.");
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
                <Flower2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Admin Login</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@florabelle.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Only authorized administrators can access the dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Account;
