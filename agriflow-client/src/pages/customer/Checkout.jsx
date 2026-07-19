import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  ClipboardCheck,
  Plus,
  Smartphone,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  ShoppingBag,
  Lock,
  AlertCircle,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import ProductImage from "@/components/common/ProductImage";
import {
  useCart,
  useAddresses,
  useCheckout,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useQueries";

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-600 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6" />
            <div>
              <div className="h-5 w-36 bg-white/30 rounded" />
              <div className="h-3 w-24 bg-white/20 rounded mt-1.5" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className={i < 2 ? "mb-6" : ""}>
                  <div className="h-4 w-36 bg-slate-100 rounded mb-3.5" />
                  {[1, 2].map((_, j) => (
                    <div key={j} className={`flex gap-3.5 py-3 ${j < 1 ? "border-b border-slate-100" : ""}`}>
                      <div className="w-5 h-5 rounded-full bg-slate-100" />
                      <div className="flex-1">
                        <div className="h-3 w-2/5 bg-slate-100 rounded mb-2" />
                        <div className="h-2.5 w-[70%] bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
        </div>
        <div className="bg-white rounded-xl border">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>
          <div className="p-5">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex justify-between mb-3">
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-3 w-1/5 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const { data: cartData, isLoading: loadingCart } = useCart();
  const { data: addressesData, isLoading: loadingAddresses } = useAddresses();
  const checkout = useCheckout();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const cart = cartData?.cart || null;
  const addresses = addressesData?.addresses || [];
  const loading = loadingCart || loadingAddresses;
  const firstAddressId = addresses[0]?._id;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(firstAddressId);
    }
  }, [addresses.length, firstAddressId, selectedAddress]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity, 0
  );
  const gst = cart?.gstAmount || subtotal * 0.18;
  const discount = cart?.discount || 0;
  const grandTotal = cart?.grandTotal || subtotal + gst - discount;

  const validateForm = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!addressForm.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(addressForm.phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit phone number";
    if (!addressForm.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.state.trim()) errors.state = "State is required";
    if (!addressForm.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(addressForm.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validateForm()) return;
    const resetForm = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "" };
    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress, data: addressForm },
        { onSuccess: () => { toast.success("Address updated"); setShowAddressDialog(false); setEditingAddress(null); setAddressForm(resetForm); setFormErrors({}); }, onError: () => toast.error("Failed to save address") }
      );
    } else {
      createAddress.mutate(addressForm, {
        onSuccess: (res) => { if (res.address) setSelectedAddress(res.address._id); toast.success("Address added"); setShowAddressDialog(false); setEditingAddress(null); setAddressForm(resetForm); setFormErrors({}); },
        onError: () => toast.error("Failed to save address"),
      });
    }
  };

  const handleDeleteAddress = (id) => {
    deleteAddress.mutate(id, {
      onSuccess: () => { toast.success("Address deleted"); if (selectedAddress === id) setSelectedAddress(null); },
      onError: () => toast.error("Failed to delete address"),
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    checkout.mutate(
      { addressId: selectedAddress, paymentMethod },
      {
        onSuccess: (res) => {
          if (res.razorpayOrderId) {
            openRazorpay(res);
          } else {
            toast.success("Order placed successfully!");
            navigate(`/orders/${res.order?.id || ""}`);
          }
        },
        onError: (err) => toast.error(err.message || "Failed to place order"),
      }
    );
  };

  const openRazorpay = (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: "INR",
      name: "Ambika Krishi Yantra",
      description: "Order Payment",
      order_id: orderData.razorpayOrderId,
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await verifyRes.json();
          if (data.success) {
            toast.success("Payment successful!");
            navigate(`/orders/${orderData.order?.id || ""}`);
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        } catch {
          toast.error("Payment verification failed. Contact support.");
        }
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled. Your order is pending.");
        },
      },
      prefill: { name: orderData.customerName || "", email: orderData.email || "", contact: orderData.phone || "" },
      theme: { color: "#16a34a" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <CheckoutSkeleton />;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 mt-1">Add items to your cart to checkout.</p>
            <Link to="/shop" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
              <ShoppingBag className="h-4 w-4" /> Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Secure Checkout</h1>
            <p className="text-green-100 text-sm">{items.length} item{items.length !== 1 ? "s" : ""} • {formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" /> Complete Your Order
              </h3>
            </div>
            <div className="p-6">

              {/* Section 1: Delivery Address */}
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold mb-4">
                  <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Delivery Address</span>
                  {selectedAddr && <span className="ml-auto text-sm text-green-600 font-medium flex items-center gap-1"><BadgeCheck className="h-4 w-4" /> Selected</span>}
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No saved addresses yet</p>
                    <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition mx-auto" onClick={() => { setEditingAddress(null); setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "" }); setShowAddressDialog(true); }}>
                      <Plus className="h-4 w-4" /> Add Address
                    </button>
                  </div>
                ) : (
                  <>
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition mb-2 shadow-sm hover:shadow-md ${selectedAddress === addr._id ? "border-green-500 bg-green-50" : "hover:border-green-300"}`} onClick={() => setSelectedAddress(addr._id)}>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selectedAddress === addr._id ? "border-green-600" : "border-gray-300"}`}>
                          {selectedAddress === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-gray-500 text-xs mt-0.5">Phone: {addr.phone}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit" onClick={(e) => { e.stopPropagation(); setEditingAddress(addr._id); setAddressForm({ fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || "", city: addr.city, state: addr.state, pincode: addr.pincode, landmark: addr.landmark || "" }); setShowAddressDialog(true); }}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition mt-2" onClick={() => { setEditingAddress(null); setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "" }); setShowAddressDialog(true); }}>
                      <Plus className="h-4 w-4" /> Add New Address
                    </button>
                  </>
                )}
              </div>

              <div className="border-b border-gray-100 my-6" />

              {/* Section 2: Payment */}
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold mb-4">
                  <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Payment</span>
                </div>
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition shadow-sm ${paymentMethod === "RAZORPAY" ? "border-green-500 bg-green-50" : "hover:border-green-300"}`}
                    onClick={() => setPaymentMethod("RAZORPAY")}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "RAZORPAY" ? "border-green-600" : "border-gray-300"}`}>
                        {paymentMethod === "RAZORPAY" && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-600 text-white">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Pay via Razorpay</p>
                        <p className="text-gray-500 text-xs">UPI, Credit/Debit Cards, Net Banking, Wallets</p>
                      </div>
                    </div>
                    {paymentMethod === "RAZORPAY" && <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />}
                  </div>

                  <div
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition shadow-sm ${paymentMethod === "COD" ? "border-green-500 bg-green-50" : "hover:border-green-300"}`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "COD" ? "border-green-600" : "border-gray-300"}`}>
                        {paymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600">
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                        <p className="text-gray-500 text-xs">Pay when your order arrives at your doorstep</p>
                      </div>
                    </div>
                    {paymentMethod === "COD" && <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0" />}
                  </div>
                </div>

                {paymentMethod === "RAZORPAY" && (
                  <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secured by Razorpay — 256-bit SSL encryption</span>
                  </div>
                )}
                {paymentMethod === "COD" && (
                  <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-orange-50 rounded-lg text-xs">
                    <Banknote className="h-3.5 w-3.5 text-orange-600" />
                    <span className="text-orange-700">Pay cash when your order is delivered</span>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-100 my-6" />

              {/* Section 3: Order Items */}
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold mb-4">
                  <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span>Order Items ({items.length})</span>
                </div>
                {items.map((item) => {
                  const product = item.productId || {};
                  return (
                    <div key={product._id} className="flex items-center gap-3 py-3">
                      <ProductImage src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-b border-gray-100 my-6" />

              {/* Place Order */}
              <div className="pt-2">
                <button
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/30 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePlaceOrder}
                  disabled={checkout.isPending || !selectedAddress}
                >
                  {checkout.isPending ? (
                    <>Processing...</>
                  ) : paymentMethod === "COD" ? (
                    <><CircleDollarSign className="h-4 w-4" /> Place Order</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Pay {formatCurrency(grandTotal)} via Razorpay</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white rounded-xl border p-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </div>
            <div className="p-4">
              {items.map((item) => {
                const product = item.productId || {};
                return (
                  <div key={product._id} className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600 truncate pr-2">{product.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-100 my-3" />
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 my-3" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <ShieldCheck className="h-4 w-4" /> 100% secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Dialog */}
      {showAddressDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.fullName ? "border-red-400" : "border-gray-300"}`} value={addressForm.fullName} onChange={(e) => { setAddressForm((p) => ({ ...p, fullName: e.target.value })); if (formErrors.fullName) setFormErrors((p) => ({ ...p, fullName: "" })); }} placeholder="John Doe" />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                  <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.phone ? "border-red-400" : "border-gray-300"}`} value={addressForm.phone} onChange={(e) => { setAddressForm((p) => ({ ...p, phone: e.target.value })); if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" })); }} placeholder="98765 43210" />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.addressLine1 ? "border-red-400" : "border-gray-300"}`} value={addressForm.addressLine1} onChange={(e) => { setAddressForm((p) => ({ ...p, addressLine1: e.target.value })); if (formErrors.addressLine1) setFormErrors((p) => ({ ...p, addressLine1: "" })); }} placeholder="Street address, apartment, etc." />
                {formErrors.addressLine1 && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.addressLine1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={addressForm.addressLine2} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))} placeholder="Flat, building, floor (optional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.city ? "border-red-400" : "border-gray-300"}`} value={addressForm.city} onChange={(e) => { setAddressForm((p) => ({ ...p, city: e.target.value })); if (formErrors.city) setFormErrors((p) => ({ ...p, city: "" })); }} />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                  <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.state ? "border-red-400" : "border-gray-300"}`} value={addressForm.state} onChange={(e) => { setAddressForm((p) => ({ ...p, state: e.target.value })); if (formErrors.state) setFormErrors((p) => ({ ...p, state: "" })); }} />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.state}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                  <input className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formErrors.pincode ? "border-red-400" : "border-gray-300"}`} value={addressForm.pincode} onChange={(e) => { setAddressForm((p) => ({ ...p, pincode: e.target.value })); if (formErrors.pincode) setFormErrors((p) => ({ ...p, pincode: "" })); }} placeholder="456771" />
                  {formErrors.pincode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={addressForm.landmark} onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))} placeholder="Near temple, hospital (optional)" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}>Cancel</button>
              <button className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50" onClick={handleSaveAddress} disabled={createAddress.isPending || updateAddress.isPending}>
                {editingAddress ? "Update" : "Save"} Address
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
