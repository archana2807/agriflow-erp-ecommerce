import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartGST,
  selectCartTotal,
  clearCart,
} from "../../store/cartSlice";
import { createOrder as postOrder } from "@/api/orders";
import { createRazorpayOrder, verifyRazorpayPayment } from "../../api/razorpay";
import { loadRazorpay, openRazorpay } from "../../utils/razorpay";
import { checkoutSchema } from "../../validations";
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Shield,
  CreditCard,
  Truck,
  ArrowLeft,
  Lock,
  User,
  MapPin,
} from "lucide-react";

export default function Checkout() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const gst = useSelector(selectCartGST);
  const total = useSelector(selectCartTotal);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const createOrderMut = useMutation({ mutationFn: createRazorpayOrder });
  const verifyMut = useMutation({ mutationFn: verifyRazorpayPayment });
  const postOrderMut = useMutation({ mutationFn: postOrder });

  const onSubmit = async (form) => {
    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) {
      toast.error("Failed to load payment gateway");
      return;
    }

    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }));

      const res = await createOrderMut.mutateAsync({
        amount: Math.round(total * 100),
        items: orderItems,
      });

      openRazorpay({
        order: res.order,
        user: { name: form.name, email: form.email },
        onSuccess: async (response) => {
          try {
            await verifyMut.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipping: form,
              items: orderItems,
            });

            await postOrderMut.mutateAsync({
              items: orderItems,
              shipping: form,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              total,
            });

            dispatch(clearCart());
            navigate("/order-success", {
              state: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                amount: total,
              },
            });
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        onError: (msg) => {
          toast.error(msg || "Payment failed");
        },
      });
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to create order");
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
  const errorClass = "mt-1 block text-xs text-destructive";

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/cart")}>
            <ArrowLeft size={16} />
          </Button>
          <h2 className="text-2xl font-semibold text-foreground">Checkout</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Checkout Form */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <User size={18} /> Contact Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <Input
                    {...register("name")}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                  {errors.name && (
                    <span className={errorClass}>{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <Input
                    {...register("email")}
                    placeholder="john@example.com"
                    className={inputClass}
                  />
                  {errors.email && (
                    <span className={errorClass}>{errors.email.message}</span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Phone</label>
                <Input
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
                {errors.phone && (
                  <span className={errorClass}>{errors.phone.message}</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MapPin size={18} /> Shipping Address
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Address</label>
                  <textarea
                    {...register("address")}
                    placeholder="Street address, apartment, suite, etc."
                    rows={3}
                    className={`${inputClass} min-h-[80px] resize-y`}
                  />
                  {errors.address && (
                    <span className={errorClass}>{errors.address.message}</span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>City</label>
                    <Input
                      {...register("city")}
                      placeholder="Mumbai"
                      className={inputClass}
                    />
                    {errors.city && (
                      <span className={errorClass}>{errors.city.message}</span>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <Input
                      {...register("state")}
                      placeholder="Maharashtra"
                      className={inputClass}
                    />
                    {errors.state && (
                      <span className={errorClass}>{errors.state.message}</span>
                    )}
                  </div>
                </div>
                <div className="sm:w-1/2">
                  <label className={labelClass}>PIN Code</label>
                  <Input
                    {...register("pincode")}
                    placeholder="400001"
                    className={inputClass}
                  />
                  {errors.pincode && (
                    <span className={errorClass}>{errors.pincode.message}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-600" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-green-600" />
                <span>Secure Payment via Razorpay</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-green-600" />
                <span>Free Shipping on all orders</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h3>

            <div className="mb-4 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 font-medium text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border" />

            <div className="my-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
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
              className="w-full gap-2"
              size="lg"
              onClick={handleSubmit(onSubmit)}
              disabled={createOrderMut.isPending}
            >
              <CreditCard size={18} />
              {createOrderMut.isPending
                ? "Creating Order..."
                : `Pay ₹${total.toFixed(2)}`}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span>Powered by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
