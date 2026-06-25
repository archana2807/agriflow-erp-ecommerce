import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  ClipboardCheck,
  CheckCircle,
  Plus,
  Banknote,
  Building2,
  Smartphone,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
  });

  const { data: cartData, isLoading: loadingCart } = useCart();
  const { data: addressesData, isLoading: loadingAddresses } = useAddresses();
  const checkout = useCheckout();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const cart = cartData?.cart || null;
  const addresses = addressesData?.addresses || [];
  const loading = loadingCart || loadingAddresses;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]._id);
    }
  }, [addresses, selectedAddress]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || items.reduce(
    (sum, item) => sum + (item.product?.price || item.price || 0) * item.qty,
    0
  );
  const gst = cart?.gstAmount || subtotal * 0.18;
  const discount = cart?.discount || 0;
  const grandTotal = cart?.grandTotal || subtotal + gst - discount;

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress, data: addressForm },
        {
          onSuccess: () => {
            toast.success("Address updated");
            setShowAddressDialog(false);
            setEditingAddress(null);
            setAddressForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "", type: "home" });
          },
          onError: () => toast.error("Failed to save address"),
        }
      );
    } else {
      createAddress.mutate(addressForm, {
        onSuccess: (res) => {
          const newAddr = res.address;
          if (newAddr) setSelectedAddress(newAddr._id);
          toast.success("Address added");
          setShowAddressDialog(false);
          setEditingAddress(null);
          setAddressForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "", type: "home" });
        },
        onError: () => toast.error("Failed to save address"),
      });
    }
  };

  const handleDeleteAddress = (id) => {
    deleteAddress.mutate(id, {
      onSuccess: () => {
        toast.success("Address deleted");
        if (selectedAddress === id) setSelectedAddress(null);
      },
      onError: () => toast.error("Failed to delete address"),
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    checkout.mutate(
      { addressId: selectedAddress, paymentMethod },
      {
        onSuccess: (res) => {
          toast.success("Order placed successfully!");
          navigate(`/orders/${res.data?._id || ""}`);
        },
        onError: (err) => toast.error(err.message || "Failed to place order"),
      }
    );
  };

  if (loading) return <CheckoutSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add items to your cart to checkout.</p>
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);

  const paymentMethods = [
    { value: "CASH", label: "Cash on Delivery", icon: Banknote },
    { value: "CARD", label: "Credit / Debit Card", icon: CreditCard },
    { value: "UPI", label: "UPI Payment", icon: Smartphone },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 },
  ];

  const steps = [
    { num: 1, label: "Address", icon: MapPin },
    { num: 2, label: "Payment", icon: CreditCard },
    { num: 3, label: "Review", icon: ClipboardCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => s.num <= step && setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step > s.num ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Delivery Address</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "", type: "home" });
                    setShowAddressDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No saved addresses. Please add one.
                  </p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === addr._id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setSelectedAddress(addr._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={selectedAddress === addr._id}
                            onChange={() => setSelectedAddress(addr._id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{addr.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {addr.type || "home"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr._id);
                              setAddressForm({
                                name: addr.name,
                                phone: addr.phone,
                                address: addr.address,
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                type: addr.type || "home",
                              });
                              setShowAddressDialog(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    if (!selectedAddress) {
                      toast.error("Please select an address");
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === pm.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/30"
                      }`}
                    >
                      <RadioGroupItem value={pm.value} />
                      <pm.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{pm.label}</span>
                    </label>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Address */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Delivery Address
                  </h4>
                  {selectedAddr && (
                    <div className="border rounded-lg p-3">
                      <p className="font-medium">{selectedAddr.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAddr.address}, {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">Phone: {selectedAddr.phone}</p>
                      <Button variant="link" size="sm" className="px-0" onClick={() => setStep(1)}>
                        Change
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Payment Method
                  </h4>
                  <div className="border rounded-lg p-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">
                      {paymentMethods.find((pm) => pm.value === paymentMethod)?.label}
                    </span>
                    <Button variant="link" size="sm" className="px-0 ml-auto" onClick={() => setStep(2)}>
                      Change
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Order Items ({items.length})
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const product = item.product || item;
                      return (
                        <div key={item._id || product._id} className="flex items-center gap-3 border rounded-lg p-3">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency((product.price || 0) * item.qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? "Placing Order..." : `Place Order - ${formatCurrency(grandTotal)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const product = item.product || item;
                return (
                  <div key={item._id || product._id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1">
                      {product.name} x {item.qty}
                    </span>
                    <span>{formatCurrency((product.price || 0) * item.qty)}</span>
                  </div>
                );
              })}
              <Separator />
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
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addr-name">Full Name *</Label>
                <Input
                  id="addr-name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="addr-phone">Phone *</Label>
                <Input
                  id="addr-phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="addr-address">Address *</Label>
              <Input
                id="addr-address"
                value={addressForm.address}
                onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Street address, apartment, etc."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="addr-state">State *</Label>
                <Input
                  id="addr-state"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="addr-pincode">Pincode *</Label>
                <Input
                  id="addr-pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Address Type</Label>
              <div className="flex gap-2 mt-1">
                {["home", "work", "other"].map((t) => (
                  <Button
                    key={t}
                    variant={addressForm.type === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddressForm((p) => ({ ...p, type: t }))}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={createAddress.isPending || updateAddress.isPending}>
              {editingAddress ? "Update" : "Save"} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
