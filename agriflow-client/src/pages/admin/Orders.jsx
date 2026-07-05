import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Eye, ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import { orderService } from "@/services/order.service";
import { format } from "date-fns";

const ORDERS_PER_PAGE = 10;
const statusFilters = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusStyles = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  confirmed: "text-blue-700 bg-blue-50 border-blue-200",
  processing: "text-purple-700 bg-purple-50 border-purple-200",
  shipped: "text-indigo-700 bg-indigo-50 border-indigo-200",
  delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

function OrderDetail({ order, onClose, onStatusUpdate, onRecordPayment, statusMutation }) {
  if (!order) return null;
  const items = order.items || [];
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
      <DialogHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-slate-900">Order {order.orderNumber || order._id?.slice(-8)}</DialogTitle>
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
                  <p className="text-sm font-medium text-slate-900">{item.productId?.name || "Product"}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                </div>
                <p className="text-sm font-medium text-slate-900">₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Select value={order.status} onValueChange={(v) => onStatusUpdate(order._id, v)} disabled={statusMutation.isPending}>
                <SelectTrigger className="w-[160px] border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem><SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            {order.paymentStatus !== "paid" && order.status !== "cancelled" && (
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
  const [notes, setNotes] = useState("");
  const remaining = order ? order.totalAmount - (order.paidAmount || 0) : 0;

  useEffect(() => { setAmount(remaining.toString()); }, [remaining]);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }
    if (Number(amount) > remaining) { toast.error("Amount exceeds remaining balance"); return; }
    onRecord({ orderId: order._id, amount: Number(amount), method, notes });
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
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="border-slate-200 focus-visible:ring-slate-400/20" />
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

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", currentPage, debouncedSearch, statusFilter],
    queryFn: () => orderService.getAll({ page: currentPage, limit: ORDERS_PER_PAGE, search: debouncedSearch || undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries(["admin-orders"]); toast.success("Order updated"); setSelectedOrder(null); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update"),
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => orderService.recordPayment(data),
    onSuccess: () => { queryClient.invalidateQueries(["admin-orders"]); toast.success("Payment recorded"); setPaymentOrder(null); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to record payment"),
  });

  const orders = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalCount = data?.data?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500 mt-1">{totalCount} total orders</p>
        </div>
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
                    <TableCell className="font-medium text-slate-900 pl-5 text-sm">{order.orderNumber || order._id?.slice(-8)}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{order.customerId?.name || "Walk-in"}</TableCell>
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

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdate={(id, status) => statusMutation.mutate({ id, status })} onRecordPayment={(order) => { setSelectedOrder(null); setPaymentOrder(order); }} statusMutation={statusMutation} />
      </Dialog>

      <Dialog open={!!paymentOrder} onOpenChange={() => setPaymentOrder(null)}>
        <RecordPaymentDialog order={paymentOrder} onClose={() => setPaymentOrder(null)} onRecord={(data) => paymentMutation.mutate(data)} />
      </Dialog>
    </div>
  );
}
