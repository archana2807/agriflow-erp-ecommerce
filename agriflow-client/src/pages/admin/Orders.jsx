import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Eye, ChevronLeft, ChevronRight, Plus, X, UserCheck, ShoppingCart } from "lucide-react";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { adminService } from "@/services/admin.service";
import { format } from "date-fns";

const ORDERS_PER_PAGE = 10;
const statusFilters = ["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusStyles = {
  PENDING: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED: "text-blue-700 bg-blue-50 border-blue-200",
  PROCESSING: "text-purple-700 bg-purple-50 border-purple-200",
  SHIPPED: "text-indigo-700 bg-indigo-50 border-indigo-200",
  DELIVERED: "text-emerald-700 bg-emerald-50 border-emerald-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};

function WalkInOrderDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  const { data: customerSearchRes } = useQuery({
    queryKey: ["admin-customer-search", customerPhone],
    queryFn: () => adminService.customers.getAll({ search: customerPhone, limit: 5 }),
    enabled: customerPhone.length >= 3,
  });

  const { data: productSearchRes } = useQuery({
    queryKey: ["admin-product-search", productSearch],
    queryFn: () => productService.getAll({ search: productSearch, limit: 20 }),
    enabled: productSearch.length >= 1,
  });

  const createCustomerMut = useMutation({
    mutationFn: (data) => adminService.customers.create(data),
    onSuccess: (res) => {
      setSelectedCustomer(res.customer || res);
      toast.success("Walk-in customer created");
      setStep(2);
    },
    onError: (e) => toast.error(e.message || "Failed to create customer"),
  });

  const createOrderMut = useMutation({
    mutationFn: (data) => orderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Walk-in order created successfully");
      resetForm();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message || "Failed to create order"),
  });

  const customers = customerSearchRes?.customers || [];
  const products = productSearchRes?.products || [];

  const resetForm = () => {
    setStep(1);
    setCustomerPhone("");
    setCustomerName("");
    setSelectedCustomer(null);
    setIsWalkIn(true);
    setItems([]);
    setProductSearch("");
    setPaymentMethod("CASH");
    setPaymentAmount("");
    setNotes("");
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerPhone(customer.phone || "");
    setCustomerName(customer.name || "");
    setStep(2);
  };

  const handleCreateCustomer = () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Enter a valid phone number (min 10 digits)");
      return;
    }
    if (!customerName || customerName.length < 2) {
      toast.error("Enter customer name");
      return;
    }
    createCustomerMut.mutate({
      name: customerName,
      phone: customerPhone,
      isWalkIn: true,
    });
  };

  const handleAddProduct = (product) => {
    const existing = items.find((i) => i.productId === product._id);
    if (existing) {
      setItems(items.map((i) =>
        i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([...items, {
        productId: product._id,
        name: product.name,
        price: product.sellingPrice || product.price,
        quantity: 1,
        stock: product.stock || 0,
        unit: product.unit || "kg",
      }]);
    }
    setProductSearch("");
  };

  const handleUpdateQuantity = (productId, qty) => {
    if (qty < 1) {
      setItems(items.filter((i) => i.productId !== productId));
      return;
    }
    setItems(items.map((i) =>
      i.productId === productId ? { ...i, quantity: qty } : i
    ));
  };

  const handleUpdatePrice = (productId, price) => {
    setItems(items.map((i) =>
      i.productId === productId ? { ...i, price: Number(price) || 0 } : i
    ));
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast.error("Select or create a customer");
      setStep(1);
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    const payload = {
      customerId: selectedCustomer._id,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      orderType: "WALKIN",
      paymentMethod,
      paymentAmount: paymentAmount ? Number(paymentAmount) : 0,
    };
    createOrderMut.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-slate-200">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-900">Create Walk-in Order</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-500">Search for an existing customer by phone, or create a new walk-in customer.</p>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Phone Number *</Label>
              <Input
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setSelectedCustomer(null);
                }}
                placeholder="Enter phone number to search"
                className="border-slate-200 focus-visible:ring-slate-400/20"
              />
            </div>

            {customers.length > 0 && !selectedCustomer && (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.phone} {c.isWalkIn ? "(Walk-in)" : ""}</p>
                    </div>
                    <Badge variant="outline" className={
                      c.isWalkIn
                        ? "text-orange-700 bg-orange-50 border-orange-200"
                        : "text-emerald-700 bg-emerald-50 border-emerald-200"
                    }>
                      {c.isWalkIn ? "Walk-in" : "Registered"}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedCustomer && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900">{selectedCustomer.name}</p>
                  <p className="text-xs text-emerald-700">{selectedCustomer.phone}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedCustomer(null); setCustomerPhone(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!selectedCustomer && customerPhone.length >= 10 && (
              <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4">
                <p className="text-sm font-medium text-slate-700">Create Walk-in Customer</p>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="border-slate-200 focus-visible:ring-slate-400/20"
                  />
                </div>
                <Button onClick={handleCreateCustomer} disabled={createCustomerMut.isPending} className="bg-slate-900 hover:bg-slate-800 text-white">
                  {createCustomerMut.isPending ? "Creating..." : "Create Walk-in Customer"}
                </Button>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200">Cancel</Button>
              <Button onClick={() => { if (selectedCustomer) setStep(2); else toast.error("Select or create a customer"); }} className="bg-slate-900 hover:bg-slate-800 text-white">
                Next: Add Products
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedCustomer?.name}</p>
                <p className="text-xs text-slate-500">{selectedCustomer?.phone}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-slate-500">
                Change Customer
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name or SKU..."
                  className="pl-9 border-slate-200 focus-visible:ring-slate-400/20"
                />
              </div>
            </div>

            {products.length > 0 && productSearch && (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {products.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleAddProduct(p)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">SKU: {p.sku || "—"} | Stock: {p.stock ?? 0} {p.unit || "kg"}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">₹{p.sellingPrice || p.price}</p>
                  </button>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Order Items ({items.length})</Label>
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">₹{item.price} per {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                          className="w-16 h-8 text-center border-slate-200 text-sm"
                          min="1"
                        />
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdatePrice(item.productId, e.target.value)}
                          className="w-20 h-8 text-center border-slate-200 text-sm"
                          min="0"
                        />
                        <p className="text-sm font-medium text-slate-900 w-20 text-right">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleRemoveItem(item.productId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-lg font-bold text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Search and add products to the order</p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="border-slate-200">Back</Button>
              <Button onClick={() => { if (items.length === 0) { toast.error("Add at least one product"); } else setStep(3); }} className="bg-slate-900 hover:bg-slate-800 text-white">
                Next: Payment
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">Order Summary</p>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-slate-500">Edit Items</Button>
              </div>
              <p className="text-xs text-slate-500 mb-1">{selectedCustomer?.name} | {items.length} item(s)</p>
              <p className="text-xl font-bold text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Amount Paid</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`0 (unpaid) to ${totalAmount} (full)`}
                className="border-slate-200 focus-visible:ring-slate-400/20"
                min="0"
                max={totalAmount}
              />
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="border-slate-200 text-xs" onClick={() => setPaymentAmount("0")}>Unpaid</Button>
                <Button variant="outline" size="sm" className="border-slate-200 text-xs" onClick={() => setPaymentAmount(String(Math.round(totalAmount / 2)))}>Half</Button>
                <Button variant="outline" size="sm" className="border-slate-200 text-xs" onClick={() => setPaymentAmount(String(totalAmount))}>Full</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="border-slate-200 focus-visible:ring-slate-400/20"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="border-slate-200">Back</Button>
              <Button onClick={handleSubmit} disabled={createOrderMut.isPending} className="bg-slate-900 hover:bg-slate-800 text-white">
                {createOrderMut.isPending ? "Creating Order..." : "Create Order"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrderDetail({ order, onClose, onStatusUpdate, onRecordPayment, statusMutation }) {
  if (!order) return null;
  const items = order.items || [];
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
      <DialogHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-slate-900">Order {order.orderNo || order._id?.slice(-8)}</DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </DialogHeader>
      <div className="space-y-5 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="text-sm font-medium text-slate-900">{order.customerId?.name || "Walk-in Customer"}</p>
              {order.customerId?.phone && <p className="text-xs text-slate-500">{order.customerId.phone}</p>}
            </div>
            <div>
              <p className="text-xs text-slate-500">Order Date</p>
              <p className="text-sm text-slate-700">{format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Payment Method</p>
              <p className="text-sm text-slate-700 capitalize">{order.paymentMethod || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Order Type</p>
              <Badge variant="outline" className={order.orderType === "WALKIN" ? "text-orange-700 bg-orange-50 border-orange-200" : "text-blue-700 bg-blue-50 border-blue-200"}>
                {order.orderType === "WALKIN" ? "Walk-in" : "Online"}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge variant="outline" className={statusStyles[order.status] || "text-slate-700 bg-slate-50 border-slate-200"}>{order.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Payment Status</p>
              <Badge variant="outline" className={order.paymentStatus === "paid" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : order.paymentStatus === "partial" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200"}>{order.paymentStatus || "unpaid"}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Delivery Address</p>
              <p className="text-sm text-slate-700">{order.deliveryAddress?.street || "N/A"}, {order.deliveryAddress?.city || ""}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Items ({items.length})</p>
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.productId?.name || item.name || "Product"}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} x ₹{item.unitPrice || item.price}</p>
                </div>
                <p className="text-sm font-medium text-slate-900">₹{(item.quantity * (item.unitPrice || item.price || 0)).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <Select value={order.status} onValueChange={(v) => onStatusUpdate(order._id, v)} disabled={statusMutation.isPending}>
                <SelectTrigger className="w-[160px] border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem><SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
              <Button variant="outline" size="sm" onClick={() => onRecordPayment(order)} className="border-slate-200 text-slate-700">
                Record Payment
              </Button>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="text-lg font-bold text-slate-900">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

function RecordPaymentDialog({ order, onClose, onRecord }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [orderNotes, setOrderNotes] = useState("");
  const remaining = order ? order.totalAmount - (order.paidAmount || 0) : 0;

  useEffect(() => { setAmount(remaining.toString()); }, [remaining]);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }
    if (Number(amount) > remaining) { toast.error("Amount exceeds remaining balance"); return; }
    onRecord({ orderId: order._id, amount: Number(amount), method, notes: orderNotes });
  };

  return (
    <DialogContent className="max-w-md border-slate-200">
      <DialogHeader className="pb-4 border-b border-slate-100">
        <DialogTitle className="text-lg font-semibold text-slate-900">Record Payment</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <p className="text-xs text-slate-500">Remaining Balance</p>
          <p className="text-xl font-bold text-slate-900">₹{remaining.toLocaleString("en-IN")}</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Amount *</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} max={remaining} className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Notes</Label>
          <Textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Optional" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onClose} className="border-slate-200">Cancel</Button>
        <Button onClick={handleSubmit} className="bg-slate-900 hover:bg-slate-800 text-white">Record Payment</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Orders() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [showWalkInDialog, setShowWalkInDialog] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", currentPage, debouncedSearch, statusFilter],
    queryFn: () => orderService.getAll({ page: currentPage, limit: ORDERS_PER_PAGE, search: debouncedSearch || undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries(["admin-orders"]); toast.success("Order updated"); setSelectedOrder(null); },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => orderService.recordPayment(data),
    onSuccess: () => { queryClient.invalidateQueries(["admin-orders"]); toast.success("Payment recorded"); setPaymentOrder(null); },
    onError: (e) => toast.error(e.message || "Failed to record payment"),
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500 mt-1">{totalCount} total orders</p>
        </div>
        <Button onClick={() => setShowWalkInDialog(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Walk-in Order
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 border-slate-200 focus-visible:ring-slate-400/20" />
            </div>
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} className="mt-4">
            <TabsList className="bg-slate-100/80 p-1 h-auto">
              {statusFilters.map((s) => (
                <TabsTrigger key={s} value={s} className="capitalize text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 pl-5">Order ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Payment</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Amount</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-5" : j === 6 ? "pr-5" : ""}><Skeleton className="h-4 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No orders found</TableCell></TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900 pl-5 text-sm">{order.orderNo || order._id?.slice(-8)}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        {order.customerId?.isWalkIn && <UserCheck className="h-3 w-3 text-orange-500" />}
                        {order.customerId?.name || "Walk-in"}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(order.createdAt), "MMM dd, HH:mm")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusStyles[order.status] || "text-slate-700 bg-slate-50 border-slate-200"}`}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${order.paymentStatus === "paid" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : order.paymentStatus === "partial" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200"}`}>{order.paymentStatus || "unpaid"}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 text-sm">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right pr-5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className={`h-8 w-8 ${currentPage === page ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <WalkInOrderDialog open={showWalkInDialog} onOpenChange={setShowWalkInDialog} />

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdate={(id, status) => statusMutation.mutate({ id, status })} onRecordPayment={(order) => { setSelectedOrder(null); setPaymentOrder(order); }} statusMutation={statusMutation} />
      </Dialog>

      <Dialog open={!!paymentOrder} onOpenChange={() => setPaymentOrder(null)}>
        <RecordPaymentDialog order={paymentOrder} onClose={() => setPaymentOrder(null)} onRecord={(data) => paymentMutation.mutate(data)} />
      </Dialog>
    </div>
  );
}
