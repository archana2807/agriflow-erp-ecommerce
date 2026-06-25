import { useState, useMemo } from "react";
import { Search, Eye, Plus, Trash2, Loader2, ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminService.orders.getAll(),
  });
  const orders = res?.orders || [];
  const qc = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.orders.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNo?.toLowerCase().includes(s) ||
          o.customerId?.name?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [orders, statusFilter, search]);

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => toast.success("Order status updated"),
        onError: (error) => toast.error(error.message || "Failed to update status"),
      }
    );
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  return (
    <div className="erp-page">
      <div className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Orders</h1>
          <p className="erp-page-subtitle">Manage walk-in and online orders</p>
        </div>
        <Button onClick={() => setNewOrderOpen(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          New Walk-In Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={statusFilter}>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order No</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Update Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell className="font-medium">
                              {order.orderNo || order._id?.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell>{order.customerId?.name || "-"}</TableCell>
                            <TableCell>
                              {order.orderType === "WALKIN" ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  Walk-In
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                  Online
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                              {order.paymentStatus === "PAID" ? (
                                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                              ) : order.paymentStatus === "PARTIAL" ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                              >
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(val) => handleStatusUpdate(order._id, val)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-[130px] h-8" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusTabs.slice(1).map((tab) => (
                                    <SelectItem key={tab.value} value={tab.value}>
                                      {tab.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => openDetail(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-medium">
                    {selectedOrder.orderNo || selectedOrder._id?.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customerId?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedOrder.orderType === "WALKIN" ? "Walk-In" : "Online"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{selectedOrder.paymentMethod || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Items</p>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>
                      {item.name || "Product"} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Amount</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <span>
                    {selectedOrder.paymentStatus === "PAID" ? (
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    ) : selectedOrder.paymentStatus === "PARTIAL" ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                    )}
                  </span>
                </div>
              </div>

              {selectedOrder.paymentStatus !== "PAID" && selectedOrder.orderType === "WALKIN" && (
                <>
                  <Separator />
                  <Button
                    onClick={() => {
                      setDetailDialogOpen(false);
                      setOrderForPayment(selectedOrder);
                      setPaymentDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        order={orderForPayment}
      />

      {/* New Walk-In Order Dialog */}
      <NewWalkInOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
      />
    </div>
  );
}

function NewWalkInOrderDialog({ open, onOpenChange }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const qc = useQueryClient();

  const { data: customerRes, isLoading: loadingCustomers } = useQuery({
    queryKey: ["pos-customers", searchCustomer],
    queryFn: () => adminService.customers.getAll({ search: searchCustomer, limit: 20 }),
    enabled: open,
  });
  const customers = customerRes?.customers || [];

  const { data: productRes, isLoading: loadingProducts } = useQuery({
    queryKey: ["pos-products", searchProduct],
    queryFn: () => adminService.products.getAll({ search: searchProduct, limit: 50 }),
    enabled: open,
  });
  const products = productRes?.products || [];

  const createOrderMutation = useMutation({
    mutationFn: (data) => adminService.orders.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["pos-products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const filteredProducts = useMemo(() => {
    if (!searchProduct) return products;
    const s = searchProduct.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s)
    );
  }, [products, searchProduct]);

  const handleProductClick = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    const existing = items.find((i) => i.productId === product._id);
    setSelectedProduct(product);
    setQty(existing ? 1 : 1);
    setQty(1);
  };

  const confirmAddItem = () => {
    if (!selectedProduct) return;
    const existing = items.find((i) => i.productId === selectedProduct._id);
    const totalQty = existing ? existing.quantity + qty : qty;

    if (totalQty > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available${existing ? ` (${existing.quantity} already in order)` : ""}`);
      return;
    }

    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === selectedProduct._id ? { ...i, quantity: i.quantity + qty } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: qty,
          maxStock: selectedProduct.stock,
        },
      ]);
    }

    toast.success(`${selectedProduct.name} x${qty} added`);
    setSelectedProduct(null);
    setQty(1);
    setSearchProduct("");
  };

  const cancelAddItem = () => {
    setSelectedProduct(null);
    setQty(1);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i)));
    }
  };

  const removeItem = (productId) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSubmit = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
      orderType: "WALKIN",
      paymentMethod,
      paymentAmount: paymentAmount ? parseFloat(paymentAmount) : totalAmount,
    };

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Walk-in order created successfully");
        onOpenChange(false);
        setSelectedCustomerId("");
        setItems([]);
        setPaymentMethod("CASH");
        setPaymentAmount("");
        setSearchCustomer("");
        setSearchProduct("");
        setSelectedProduct(null);
        setQty(1);
      },
      onError: (error) => toast.error(error.message || "Failed to create order"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setSelectedCustomerId("");
        setItems([]);
        setPaymentMethod("CASH");
        setPaymentAmount("");
        setSearchCustomer("");
        setSearchProduct("");
        setSelectedProduct(null);
        setQty(1);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Walk-In Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Customer</Label>
            {selectedCustomer ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <span className="font-medium">{selectedCustomer.name}</span>
                <span className="text-sm text-muted-foreground">({selectedCustomer.phone})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCustomerId("")}
                  className="ml-auto"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customer by name or phone..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {loadingCustomers && <p className="text-xs text-muted-foreground">Loading customers...</p>}
                {!loadingCustomers && customers.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => {
                          setSelectedCustomerId(c._id);
                          setSearchCustomer("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!loadingCustomers && searchCustomer && customers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No customers found. Create a walk-in customer from the Customers page first.</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Add Products</Label>

            {/* Quantity selector - shows when a product is selected */}
            {selectedProduct && (
              <div className="border-2 border-green-200 rounded-md p-3 bg-green-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(selectedProduct.price)} per unit
                      {selectedProduct.sku && ` | SKU: ${selectedProduct.sku}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(selectedProduct.price * qty)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-sm whitespace-nowrap">Quantity:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(selectedProduct.stock, parseInt(e.target.value) || 1)))}
                      className="h-8 w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty(Math.min(selectedProduct.stock, qty + 1))}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (Max: {selectedProduct.stock})
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={cancelAddItem}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={confirmAddItem}>
                    Add to Order
                  </Button>
                </div>
              </div>
            )}

            {/* Product search & list */}
            {!selectedProduct && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {loadingProducts ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="border rounded-md max-h-56 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleProductClick(p)}
                        disabled={p.stock <= 0}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between text-sm disabled:opacity-50 disabled:cursor-not-allowed border-b last:border-b-0"
                      >
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {p.sku && <span className="ml-2 text-xs text-muted-foreground">({p.sku})</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(p.price)}</span>
                          <span className={`ml-2 text-xs ${p.stock <= 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {p.stock <= 0 ? 'Out of stock' : `Stock: ${p.stock}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {searchProduct ? "No products match your search." : "No products available."}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Order Items */}
          {items.length > 0 && (
            <div className="space-y-2">
              <Label>Order Items ({items.length})</Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-24">Price</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-24">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max={item.maxStock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="h-8 w-16"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Separator />

          {/* Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={totalAmount.toFixed(2)}
              />
              <p className="text-xs text-muted-foreground">
                Total: <span className="font-semibold">{formatCurrency(totalAmount)}</span>
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCustomerId || items.length === 0 || createOrderMutation.isPending}
            >
              {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order ({formatCurrency(totalAmount)})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ open, onOpenChange, order }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const qc = useQueryClient();

  const { data: invoiceData, isLoading: loadingInvoice } = useQuery({
    queryKey: ["invoice-by-order", order?._id],
    queryFn: () => adminService.invoices.getByOrder(order._id),
    enabled: open && !!order?._id,
  });

  const invoice = invoiceData?.invoice;

  const { data: paymentData, isLoading: loadingPayments } = useQuery({
    queryKey: ["payments-by-invoice", invoice?._id],
    queryFn: () => adminService.payments.getByInvoice(invoice._id),
    enabled: !!invoice?._id,
  });

  const remainingAmount = paymentData?.remainingAmount ?? order?.totalAmount ?? 0;
  const totalPaid = paymentData?.totalPaid ?? 0;

  const createPaymentMutation = useMutation({
    mutationFn: (data) => adminService.payments.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["payments-by-invoice"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(res.message || "Payment recorded");
      onOpenChange(false);
      setPaymentAmount("");
      setPaymentMethod("CASH");
    },
    onError: (error) => toast.error(error.message || "Failed to record payment"),
  });

  const handleSubmit = () => {
    if (!invoice) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > remainingAmount) {
      toast.error(`Amount exceeds remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }

    createPaymentMutation.mutate({
      invoiceId: invoice._id,
      amountPaid: amount,
      paymentMethod,
    });
  };

  const setFullAmount = () => {
    setPaymentAmount(remainingAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setPaymentAmount("");
        setPaymentMethod("CASH");
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {loadingInvoice || loadingPayments ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : invoice ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-md p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-medium">{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Remaining</span>
                <span className="font-semibold text-red-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Amount</Label>
                <Button variant="link" size="sm" onClick={setFullAmount} className="h-auto p-0 text-xs">
                  Pay Full ({formatCurrency(remainingAmount)})
                </Button>
              </div>
              <Input
                type="number"
                min="0.01"
                max={remainingAmount}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Max: ${remainingAmount.toFixed(2)}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!paymentAmount || createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No invoice found for this order.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
