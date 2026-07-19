import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import ProductImage from "@/components/common/ProductImage";
import {
  useCart,
  useUpdateCart,
  useRemoveFromCart,
  useClearCart,
} from "@/hooks/useQueries";

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-600 text-white rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <div className="h-6 w-36 bg-white/30 rounded-md" />
                <div className="h-3.5 w-24 bg-white/20 rounded mt-1.5" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                <div className="w-20 h-20 rounded-lg bg-gray-100" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3.5 w-3/5 bg-gray-100 rounded" />
                  <div className="h-3 w-2/5 bg-gray-100 rounded" />
                </div>
                <div className="w-24 h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="h-4.5 w-3/5 bg-gray-100 rounded mb-5" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <div className="h-3 w-2/5 bg-gray-100 rounded" />
                <div className="h-3 w-1/4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
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
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const gst = cart?.gstAmount || subtotal * 0.18;
  const discount = cart?.discount || 0;
  const grandTotal = cart?.grandTotal || subtotal + gst - discount;

  const handleUpdateQty = (productId, newQty) => {
    if (newQty < 1) return;
    updateCart.mutate(
      { productId, quantity: newQty },
      { onError: () => toast.error("Failed to update quantity") }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-green-100">{loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""} in your cart`}</p>
            </div>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 ring-4 ring-gray-100">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        /* Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl border p-4 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cart Items ({items.length})</h3>
              <button
                onClick={handleClearCart}
                disabled={clearCart.isPending}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {clearCart.isPending ? "Clearing..." : "Clear Cart"}
              </button>
            </div>

            {items.map((item) => {
              const product = item.productId || {};
              const isUpdating = updateCart.isPending;
              return (
                <div key={item.productId?._id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link to={`/shop/${product.slug}`}>
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      {product.brandId?.name && (
                        <p className="text-xs text-gray-500">{product.brandId.name}</p>
                      )}
                      <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        <Link to={`/shop/${product.slug}`} className="hover:text-green-600 transition-colors">
                          {product.name}
                        </Link>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">{formatCurrency(item.price)} per unit</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center border rounded-lg shadow-sm">
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleUpdateQty(product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-gray-900">
                        {isUpdating ? "..." : item.quantity}
                      </span>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleUpdateQty(product._id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(product._id)}
                        disabled={removeFromCart.isPending}
                        title="Remove item"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mt-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border p-6 h-fit lg:sticky lg:top-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Apply
              </button>
            </div>

            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(gst)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-4" />

            <div className="flex justify-between py-2 text-base font-semibold">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 transition-all flex items-center justify-center gap-2 mt-4"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 mt-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
