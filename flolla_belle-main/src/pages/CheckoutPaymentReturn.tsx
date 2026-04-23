import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { completeCardCheckoutSession } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * After Stripe Checkout, user is redirected here with ?session_id=...
 */
const CheckoutPaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setMessage("Missing payment session. Return to checkout and try again.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await completeCardCheckoutSession(sessionId);
        if (cancelled) return;
        if (result.paid) {
          setState("success");
          setMessage("Your payment was successful. Thank you for your order!");
        } else {
          setState("error");
          setMessage(
            "Payment is not completed yet. If you just paid, wait a moment and refresh — or contact support with your order number."
          );
        }
      } catch (e) {
        if (cancelled) return;
        setState("error");
        setMessage(e instanceof Error ? e.message : "Could not verify payment.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <Layout>
      <div className="container py-16 max-w-md text-center">
        {state === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm">Confirming your payment…</p>
          </div>
        )}
        {state === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
            <h1 className="text-2xl font-display font-bold text-foreground">Payment received</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            <Link to="/" className="inline-block mt-4 text-primary font-medium hover:underline">
              Back to home
            </Link>
          </div>
        )}
        {state === "error" && (
          <div className="space-y-4">
            <XCircle className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-xl font-display font-bold text-foreground">Could not confirm payment</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            <Link to="/checkout" className="inline-block mt-4 text-primary font-medium hover:underline">
              Return to checkout
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPaymentReturn;
