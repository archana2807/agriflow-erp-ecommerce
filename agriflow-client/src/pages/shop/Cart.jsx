import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartGST,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/cartSlice";
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Package,
} from "lucide-react";

const PRODUCT_EMOJIS = ["🌾", "🌽", "🌻", "🌿", "🍃", "🌱", "🚜", "💧", "🧪", "📦"];

function getEmoji(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PRODUCT_EMOJIS[Math.abs(hash) % PRODUCT_EMOJIS.length];
}

export default function Cart() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const gst = useSelector(selectCartGST);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontNavbar />
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
          <ShoppingBag size={72} strokeWidth={1.2} className="text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/shop">
            <Button className="mt-2 gap-2">
              <ArrowLeft size={18} /> Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <ShoppingBag size={24} /> Shopping Cart
          </h2>
          <span className="text-sm text-muted-foreground">{totalItems} item(s)</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart Items */}
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const gstAmount = (item.price * item.quantity * item.gstPercent) / 100;
              const lineTotal = item.price * item.quantity + gstAmount;

              return (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                    {getEmoji(item.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium text-foreground">{item.name}</h3>
                    <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                      <span>SKU: {item.sku}</span>
                      <span>{item.gstPercent}% GST</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-muted-foreground">
                    ₹{item.price}/unit
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (item.quantity === 1) {
                          dispatch(removeFromCart(item.productId));
                        } else {
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            })
                          );
                        }
                      }}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <div className="w-24 shrink-0 text-right font-semibold text-foreground">
                    ₹{lineTotal.toFixed(0)}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Link to="/shop">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft size={16} /> Continue Shopping
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => dispatch(clearCart())}
              >
                <Trash2 size={16} /> Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h3>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full gap-2"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Package size={14} />
              <span>Secure checkout powered by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
