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
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <ClipboardCheck className="h-6 w-6" />
            <div>
              <div style={{ width: 140, height: 20, background: "rgba(255,255,255,0.3)", borderRadius: 4 }} />
              <div style={{ width: 100, height: 12, background: "rgba(255,255,255,0.2)", borderRadius: 4, marginTop: 6 }} />
            </div>
          </div>
        </div>
      </div>
      <div className="checkout-layout">
        <div className="checkout-card">
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 24 : 0 }}>
                <div style={{ width: 140, height: 16, background: "#f1f5f9", borderRadius: 4, marginBottom: 14 }} />
                {[1, 2].map((_, j) => (
                  <div key={j} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: j < 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f1f5f9" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: "40%", height: 12, background: "#f1f5f9", borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ width: "70%", height: 10, background: "#f1f5f9", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="checkout-summary">
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: "50%", height: 16, background: "#f1f5f9", borderRadius: 4 }} />
          </div>
          <div style={{ padding: 20 }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: "50%", height: 12, background: "#f1f5f9", borderRadius: 4 }} />
                <div style={{ width: "20%", height: 12, background: "#f1f5f9", borderRadius: 4 }} />
              </div>
            ))}
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
      <div className="shop-page">
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-state-icon"><ShoppingBag className="h-12 w-12" /></div>
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to checkout.</p>
          <Link to="/shop" className="empty-state-btn"><ShoppingBag className="h-4 w-4" /> Browse Products</Link>
        </div>
      </div>
    );
  }

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="shop-page">
      {/* Hero */}
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <ClipboardCheck className="h-6 w-6" />
            <div>
              <h1>Secure Checkout</h1>
              <p>{items.length} item{items.length !== 1 ? "s" : ""} • {formatCurrency(grandTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Main Content - Single Card */}
        <div>
          <div className="checkout-card">
            <div className="checkout-card-header">
              <h3><ClipboardCheck /> Complete Your Order</h3>
            </div>
            <div className="checkout-card-body">

              {/* Section 1: Delivery Address */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <div className="checkout-section-num">1</div>
                  <MapPin />
                  <span>Delivery Address</span>
                  {selectedAddr && <span className="checkout-section-done"><BadgeCheck /> Selected</span>}
                </div>
                {addresses.length === 0 ? (
                  <div className="addr-empty">
                    <div className="addr-empty-icon"><MapPin /></div>
                    <p>No saved addresses yet</p>
                    <button className="checkout-add-btn" style={{ margin: "12px auto 0" }} onClick={() => { setEditingAddress(null); setAddressForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "", type: "home" }); setShowAddressDialog(true); }}>
                      <Plus /> Add Address
                    </button>
                  </div>
                ) : (
                  <>
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`addr-card ${selectedAddress === addr._id ? "selected" : ""}`} onClick={() => setSelectedAddress(addr._id)}>
                        <div className="addr-radio" />
                        <div className="addr-info">
                          <p className="addr-name">{addr.fullName}</p>
                          <p className="addr-text">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="addr-text" style={{ marginTop: 2 }}>Phone: {addr.phone}</p>
                        </div>
                        <div className="addr-actions">
                          <button className="addr-action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditingAddress(addr._id); setAddressForm({ fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || "", city: addr.city, state: addr.state, pincode: addr.pincode, landmark: addr.landmark || "" }); setShowAddressDialog(true); }}>
                            <Pencil />
                          </button>
                          <button className="addr-action-btn" title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}>
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="checkout-add-btn" onClick={() => { setEditingAddress(null); setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", landmark: "" }); setShowAddressDialog(true); }}>
                      <Plus /> Add New Address
                    </button>
                  </>
                )}
              </div>

              <div className="checkout-section-divider" />

              {/* Section 2: Payment */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <div className="checkout-section-num">2</div>
                  <CreditCard />
                  <span>Payment</span>
                </div>
                <div className="pay-choose-list">
                  <div
                    className={`pay-choose-card ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("RAZORPAY")}
                  >
                    <div className="pay-choose-left">
                      <div className="pay-choose-radio">
                        {paymentMethod === "RAZORPAY" && <div className="pay-choose-radio-dot" />}
                      </div>
                      <div className="pay-choose-icon" style={{ background: "#16a34a", color: "#fff" }}>
                        <Smartphone />
                      </div>
                      <div className="pay-choose-info">
                        <p className="pay-choose-title">Pay via Razorpay</p>
                        <p className="pay-choose-desc">UPI, Credit/Debit Cards, Net Banking, Wallets</p>
                      </div>
                    </div>
                    {paymentMethod === "RAZORPAY" && <ShieldCheck style={{ width: 18, height: 18, color: "#16a34a", flexShrink: 0 }} />}
                  </div>

                  <div
                    className={`pay-choose-card ${paymentMethod === "COD" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <div className="pay-choose-left">
                      <div className="pay-choose-radio">
                        {paymentMethod === "COD" && <div className="pay-choose-radio-dot" />}
                      </div>
                      <div className="pay-choose-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                        <Banknote />
                      </div>
                      <div className="pay-choose-info">
                        <p className="pay-choose-title">Cash on Delivery</p>
                        <p className="pay-choose-desc">Pay when your order arrives at your doorstep</p>
                      </div>
                    </div>
                    {paymentMethod === "COD" && <BadgeCheck style={{ width: 18, height: 18, color: "#16a34a", flexShrink: 0 }} />}
                  </div>
                </div>

                {paymentMethod === "RAZORPAY" && (
                  <div className="pay-trust-row">
                    <Lock style={{ width: "13px", height: "13px" }} />
                    <span>Secured by Razorpay — 256-bit SSL encryption</span>
                  </div>
                )}
                {paymentMethod === "COD" && (
                  <div className="pay-trust-row" style={{ background: "#fff7ed" }}>
                    <Banknote style={{ width: "13px", height: "13px", color: "#ea580c" }} />
                    <span style={{ color: "#9a3412" }}>Pay cash when your order is delivered</span>
                  </div>
                )}
              </div>

              <div className="checkout-section-divider" />

              {/* Section 3: Order Items */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <div className="checkout-section-num">3</div>
                  <ShoppingBag />
                  <span>Order Items ({items.length})</span>
                </div>
                {items.map((item) => {
                  const product = item.productId || {};
                  return (
                    <div key={product._id} className="review-item">
                      <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
                      <div className="review-item-info">
                        <p className="review-item-name">{product.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="review-item-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-section-divider" />

              {/* Place Order */}
              <div className="checkout-btn-row">
                <button
                  className="checkout-btn-next checkout-btn-place"
                  onClick={handlePlaceOrder}
                  disabled={checkout.isPending || !selectedAddress}
                >
                  {checkout.isPending ? (
                    <>Processing...</>
                  ) : paymentMethod === "COD" ? (
                    <><CircleDollarSign style={{ width: 16, height: 16 }} /> Place Order</>
                  ) : (
                    <><Lock style={{ width: 16, height: 16 }} /> Pay {formatCurrency(grandTotal)} via Razorpay</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="checkout-summary">
            <div className="checkout-summary-header">
              <h3>Order Summary</h3>
            </div>
            <div className="checkout-summary-body">
              {items.map((item) => {
                const product = item.productId || {};
                return (
                  <div key={product._id} className="summary-item">
                    <span className="label">{product.name} × {item.quantity}</span>
                    <span className="value">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="summary-divider" />
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="label">GST (18%)</span>
                <span className="value">{formatCurrency(gst)}</span>
              </div>
              <div className="summary-row">
                <span className="label">Delivery</span>
                <span className="value" style={{ color: "#16a34a", fontWeight: 600 }}>FREE</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span className="label">Discount</span>
                  <span className="value">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-total">
                <span className="label">Total</span>
                <span className="value">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <div style={{ padding: "0 24px 20px" }}>
              <div className="trust-badge blue">
                <ShieldCheck /> 100% secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Dialog */}
      {showAddressDialog && (
        <div className="addr-dialog-overlay" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}>
          <div className="addr-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="addr-dialog-header">
              <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
              <button className="addr-dialog-close" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}><X /></button>
            </div>
            <div className="addr-dialog-body">
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input className={`addr-form-input ${formErrors.fullName ? "error" : ""}`} value={addressForm.fullName} onChange={(e) => { setAddressForm((p) => ({ ...p, fullName: e.target.value })); if (formErrors.fullName) setFormErrors((p) => ({ ...p, fullName: "" })); }} placeholder="John Doe" />
                  {formErrors.fullName && <p className="addr-form-error"><AlertCircle /> {formErrors.fullName}</p>}
                </div>
                <div className="addr-form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input className={`addr-form-input ${formErrors.phone ? "error" : ""}`} value={addressForm.phone} onChange={(e) => { setAddressForm((p) => ({ ...p, phone: e.target.value })); if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" })); }} placeholder="98765 43210" />
                  {formErrors.phone && <p className="addr-form-error"><AlertCircle /> {formErrors.phone}</p>}
                </div>
              </div>
              <div className="addr-form-group">
                <label>Address Line 1 <span className="required">*</span></label>
                <input className={`addr-form-input ${formErrors.addressLine1 ? "error" : ""}`} value={addressForm.addressLine1} onChange={(e) => { setAddressForm((p) => ({ ...p, addressLine1: e.target.value })); if (formErrors.addressLine1) setFormErrors((p) => ({ ...p, addressLine1: "" })); }} placeholder="Street address, apartment, etc." />
                {formErrors.addressLine1 && <p className="addr-form-error"><AlertCircle /> {formErrors.addressLine1}</p>}
              </div>
              <div className="addr-form-group">
                <label>Address Line 2</label>
                <input className="addr-form-input" value={addressForm.addressLine2} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))} placeholder="Flat, building, floor (optional)" />
              </div>
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>City <span className="required">*</span></label>
                  <input className={`addr-form-input ${formErrors.city ? "error" : ""}`} value={addressForm.city} onChange={(e) => { setAddressForm((p) => ({ ...p, city: e.target.value })); if (formErrors.city) setFormErrors((p) => ({ ...p, city: "" })); }} />
                  {formErrors.city && <p className="addr-form-error"><AlertCircle /> {formErrors.city}</p>}
                </div>
                <div className="addr-form-group">
                  <label>State <span className="required">*</span></label>
                  <input className={`addr-form-input ${formErrors.state ? "error" : ""}`} value={addressForm.state} onChange={(e) => { setAddressForm((p) => ({ ...p, state: e.target.value })); if (formErrors.state) setFormErrors((p) => ({ ...p, state: "" })); }} />
                  {formErrors.state && <p className="addr-form-error"><AlertCircle /> {formErrors.state}</p>}
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-form-group">
                  <label>Pincode <span className="required">*</span></label>
                  <input className={`addr-form-input ${formErrors.pincode ? "error" : ""}`} value={addressForm.pincode} onChange={(e) => { setAddressForm((p) => ({ ...p, pincode: e.target.value })); if (formErrors.pincode) setFormErrors((p) => ({ ...p, pincode: "" })); }} placeholder="456771" />
                  {formErrors.pincode && <p className="addr-form-error"><AlertCircle /> {formErrors.pincode}</p>}
                </div>
                <div className="addr-form-group">
                  <label>Landmark</label>
                  <input className="addr-form-input" value={addressForm.landmark} onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))} placeholder="Near temple, hospital (optional)" />
                </div>
              </div>
            </div>
            <div className="addr-dialog-footer">
              <button className="checkout-btn-back" onClick={() => { setShowAddressDialog(false); setFormErrors({}); }}>Cancel</button>
              <button className="checkout-btn-next" style={{ background: "#16a34a", color: "#fff", border: "none" }} onClick={handleSaveAddress} disabled={createAddress.isPending || updateAddress.isPending}>
                {editingAddress ? "Update" : "Save"} Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
