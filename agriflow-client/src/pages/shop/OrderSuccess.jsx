import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const { state } = useLocation();
  const { orderId, paymentId, amount } = state || {};

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <div className="mx-auto max-w-lg px-4 py-24">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={48} strokeWidth={1.5} className="text-green-600" />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            Order Placed Successfully!
          </h1>
          <p className="mb-6 text-center text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {(orderId || paymentId || amount) && (
            <div className="mb-6 w-full rounded-lg border border-border bg-muted/50 p-4">
              {orderId && (
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium text-foreground">{orderId}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-medium text-foreground">{paymentId}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    ₹{amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Package size={16} />
            <span>You will receive an email confirmation shortly.</span>
          </div>

          <div className="flex gap-3">
            <Link to="/products">
              <Button className="gap-2">Continue Shopping</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
