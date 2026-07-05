import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useInvoices } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadge = {
  PAID: "text-emerald-700 bg-emerald-50 border-emerald-200",
  UNPAID: "text-red-700 bg-red-50 border-red-200",
  PARTIAL: "text-amber-700 bg-amber-50 border-amber-200",
};

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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
        <p className="text-sm text-slate-500 mt-1">View all invoices</p>
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
                        <TableRow key={invoice._id} className="border-slate-50 hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900 text-sm pl-5">
                            {invoice.invoiceNumber || invoice._id?.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {invoice.order?.orderNo || invoice.order?._id?.slice(-6).toUpperCase() || "-"}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{invoice.customer?.name || invoice.order?.customer?.name || "-"}</TableCell>
                          <TableCell className="font-medium text-slate-900 text-sm">{formatCurrency(invoice.totalAmount || invoice.amount)}</TableCell>
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
    </div>
  );
}
