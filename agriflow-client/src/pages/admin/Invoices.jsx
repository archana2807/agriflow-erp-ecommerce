import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Eye, X, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/useQueries";
import adminService from "@/services/admin.service";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadge = {
  PAID: "text-emerald-700 bg-emerald-50 border-emerald-200",
  UNPAID: "text-red-700 bg-red-50 border-red-200",
  PARTIAL: "text-amber-700 bg-amber-50 border-amber-200",
};

const paymentStatusBadge = {
  FULL: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PARTIAL: "text-amber-700 bg-amber-50 border-amber-200",
};

function InvoiceDetail({ invoice, onClose }) {
  const queryClient = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  const { data: payRes, isLoading } = useQuery({
    queryKey: ["payments-by-invoice", invoice?._id],
    queryFn: () => adminService.payments.getByInvoice(invoice._id),
    enabled: !!invoice?._id,
  });

  if (!invoice) return null;

  const paymentMut = useMutation({
    mutationFn: (data) => adminService.payments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["payments-by-invoice", invoice._id]);
      queryClient.invalidateQueries(["invoices"]);
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Payment recorded");
      setShowPayForm(false);
      setAmount("");
      setNotes("");
    },
    onError: (e) => toast.error(e.message || "Failed to record payment"),
  });

  const payments = payRes?.payments || [];
  const totalPaid = payRes?.totalPaid ?? 0;
  const remaining = payRes?.remainingAmount ?? 0;
  const totalAmount = payRes?.invoice?.totalAmount ?? invoice?.totalAmount ?? 0;

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter valid amount"); return; }
    if (Number(amount) > remaining) { toast.error("Amount exceeds remaining balance"); return; }
    paymentMut.mutate({
      invoiceId: invoice._id,
      amountPaid: Number(amount),
      paymentMethod: method,
      notes: notes || undefined,
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
      <DialogHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-slate-900">Invoice {invoice.invoiceNo}</DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </DialogHeader>

      <div className="space-y-5 pt-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Amount</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Paid</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
          </div>
          <div className={`rounded-xl border p-4 ${remaining > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${remaining > 0 ? "text-red-600" : "text-emerald-600"}`}>Remaining</p>
            <p className={`text-xl font-bold ${remaining > 0 ? "text-red-700" : "text-emerald-700"}`}>{formatCurrency(remaining)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Payment History ({payments.length})</p>
          {invoice.status !== "PAID" && (
            <Button size="sm" onClick={() => setShowPayForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Record Payment
            </Button>
          )}
        </div>

        {showPayForm && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">New Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Amount</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} max={remaining} placeholder={`Max: ${remaining}`} className="border-slate-200 text-sm h-9" />
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="text-xs h-7 border-slate-200" onClick={() => setAmount(String(Math.round(remaining / 2)))}>Half</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 border-slate-200" onClick={() => setAmount(String(remaining))}>Full</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="border-slate-200 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="border-slate-200 text-sm" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-200 text-xs" onClick={() => setShowPayForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handlePay} disabled={paymentMut.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                {paymentMut.isPending ? "Saving..." : "Save Payment"}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No payments recorded yet</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${p.status === "FULL" ? "bg-emerald-100" : "bg-amber-100"}`}>
                    <CreditCard className={`h-3.5 w-3.5 ${p.status === "FULL" ? "text-emerald-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(p.amountPaid)}</p>
                    <p className="text-xs text-slate-500">{p.paymentMethod} {p.notes ? `• ${p.notes}` : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={paymentStatusBadge[p.status] || "text-slate-700 bg-slate-50 border-slate-200"}>{p.status}</Badge>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const params = { page, search, limit: 10 };
  const { data: res, isLoading } = useInvoices(params);
  const invoices = res?.invoices || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h2>
        <p className="text-sm text-slate-500 mt-1">View all invoices and payment history</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={handleSearch}
              className="pl-9 border-slate-200 focus-visible:ring-slate-400/20"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-600 pl-5">Invoice No</TableHead>
                      <TableHead className="font-semibold text-slate-600">Order</TableHead>
                      <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                      <TableHead className="font-semibold text-slate-600">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-600">Status</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right pr-5">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow
                          key={invoice._id}
                          className="border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <TableCell className="font-medium text-slate-900 text-sm pl-5">
                            {invoice.invoiceNo || invoice._id?.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {invoice.orderId?.orderNo || invoice.orderId?._id?.slice(-6).toUpperCase() || "-"}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{invoice.customerId?.name || "-"}</TableCell>
                          <TableCell className="font-medium text-slate-900 text-sm">{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadge[invoice.status] || statusBadge.UNPAID}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm text-right pr-5">{formatDate(invoice.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-5">
                  <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pg;
                      if (totalPages <= 5) pg = i + 1;
                      else if (page <= 3) pg = i + 1;
                      else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                      else pg = page - 2 + i;
                      return (
                        <Button key={pg} variant={page === pg ? "default" : "outline"} size="icon" className={`h-8 w-8 ${page === pg ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} onClick={() => setPage(pg)}>
                          {pg}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      </Dialog>
    </div>
  );
}
