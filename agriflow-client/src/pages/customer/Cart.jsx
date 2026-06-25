import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  useCart,
  useUpdateCart,
  useRemoveFromCart,
  useClearCart,
} from "@/hooks/useQueries";

function CartSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { data: cartData, isLoading: loading } = useCart();
  const updateCart = useUpdateCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const [couponCode, setCouponCode] = useState("");

  const cart = cartData?.cart || null;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || items.reduce(
    (sum, item) => sum + (item.product?.price || item.price || 0) * item.qty,
    0
  );
  const gst = cart?.gstAmount || subtotal * 0.18;
  const discount = cart?.discount || 0;
  const grandTotal = cart?.grandTotal || subtotal + gst - discount;

  const handleUpdateQty = (productId, newQty) => {
    if (newQty < 1) return;
    updateCart.mutate(
      { productId, qty: newQty },
      {
        onError: () => toast.error("Failed to update quantity"),
      }
    );
  };

  const handleRemove = (productId) => {
    removeFromCart.mutate(productId, {
      onSuccess: () => toast.success("Removed from cart"),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  const handleClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Cart cleared"),
      onError: () => toast.error("Failed to clear cart"),
    });
  };

  if (loading) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild>
          <Link to="/shop">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart ({items.length} items)</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCart}
          disabled={clearCart.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {clearCart.isPending ? "Clearing..." : "Clear Cart"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items Table */}
        <div className="lg:col-span-2">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const product = item.product || item;
                  const price = product.price || 0;
                  const isUpdating = updateCart.isPending;
                  return (
                    <TableRow key={item._id || product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                          <div>
                            <Link
                              to={`/shop/${product.slug}`}
                              className="font-medium hover:text-primary line-clamp-1"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleUpdateQty(product._id, item.qty - 1)
                            }
                            disabled={item.qty <= 1 || isUpdating}
                            className="p-1 hover:bg-muted rounded disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {isUpdating ? "..." : item.qty}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQty(product._id, item.qty + 1)
                            }
                            disabled={isUpdating}
                            className="p-1 hover:bg-muted rounded disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {formatCurrency(price * item.qty)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemove(product._id)}
                          disabled={removeFromCart.isPending}
                          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-between items-center mt-4">
            <Button asChild variant="outline">
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
