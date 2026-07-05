import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
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
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <div style={{ width: 140, height: 24, background: "rgba(255,255,255,0.3)", borderRadius: 6 }} />
              <div style={{ width: 100, height: 14, background: "rgba(255,255,255,0.2)", borderRadius: 4, marginTop: 6 }} />
            </div>
          </div>
        </div>
      </div>
      <div className="cart-layout">
        <div className="cart-items-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cart-item">
              <div style={{ width: 80, height: 80, borderRadius: 10, background: "#f0f0f0" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: "60%", height: 14, background: "#f0f0f0", borderRadius: 4 }} />
                <div style={{ width: "40%", height: 12, background: "#f0f0f0", borderRadius: 4 }} />
              </div>
              <div style={{ width: 100, height: 32, background: "#f0f0f0", borderRadius: 8 }} />
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div style={{ width: "60%", height: 18, background: "#f0f0f0", borderRadius: 4, marginBottom: 20 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: "40%", height: 12, background: "#f0f0f0", borderRadius: 4 }} />
              <div style={{ width: "25%", height: 12, background: "#f0f0f0", borderRadius: 4 }} />
            </div>
          ))}
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
    <div className="shop-page">
      {/* Hero Banner */}
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <h1>Shopping Cart</h1>
              <p>{loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""} in your cart`}</p>
            </div>
          </div>
          <Link to="/shop" className="page-hero-btn">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 ? (
        <div className="empty-state mt-6">
          <div className="empty-state-icon">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="empty-state-btn">
            <ShoppingBag className="h-4 w-4" /> Browse Products
          </Link>
        </div>
      ) : (
        /* Cart Layout */
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-card">
            <div className="cart-items-header">
              <h3>Cart Items ({items.length})</h3>
              <button
                className="cart-clear-btn"
                onClick={handleClearCart}
                disabled={clearCart.isPending}
              >
                <Trash2 />
                {clearCart.isPending ? "Clearing..." : "Clear Cart"}
              </button>
            </div>

            {items.map((item) => {
              const product = item.productId || {};
              const isUpdating = updateCart.isPending;
              return (
                <div key={item.productId?._id} className="cart-item">
                  <Link to={`/shop/${product.slug}`}>
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="cart-item-img"
                    />
                  </Link>
                  <div className="cart-item-info">
                    {product.brandId?.name && (
                      <p className="cart-item-brand">{product.brandId.name}</p>
                    )}
                    <h4 className="cart-item-name">
                      <Link to={`/shop/${product.slug}`}>{product.name}</Link>
                    </h4>
                    <p className="cart-item-unit">{formatCurrency(item.price)} per unit</p>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      className="cart-qty-btn"
                      onClick={() => handleUpdateQty(product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating}
                    >
                      <Minus />
                    </button>
                    <span className="cart-qty-value">
                      {isUpdating ? "..." : item.quantity}
                    </span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => handleUpdateQty(product._id, item.quantity + 1)}
                      disabled={isUpdating}
                    >
                      <Plus />
                    </button>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-price">
                      <span className="total">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleRemove(product._id)}
                      disabled={removeFromCart.isPending}
                      title="Remove item"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              );
            })}

            <Link to="/shop" className="cart-continue-link">
              <ArrowLeft /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="cart-coupon">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button>Apply</button>
            </div>

            <div className="cart-summary-row">
              <span className="label">Subtotal</span>
              <span className="value">{formatCurrency(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="label">GST (18%)</span>
              <span className="value">{formatCurrency(gst)}</span>
            </div>
            {discount > 0 && (
              <div className="cart-summary-row discount">
                <span className="label">Discount</span>
                <span className="value">-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span className="label">Grand Total</span>
              <span className="value">{formatCurrency(grandTotal)}</span>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
              <ArrowRight />
            </button>

            <Link to="/shop" className="cart-continue-link justify-center mt-3">
              <ArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
