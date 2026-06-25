import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayments } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadge = {
  completed: { className: "bg-green-100 text-green-800" },
  pending: { className: "bg-yellow-100 text-yellow-800" },
  failed: { className: "bg-red-100 text-red-800" },
  refunded: { className: "bg-blue-100 text-blue-800" },
};

export default function Payments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = { page, search, limit: 10 };
  const { data: res, isLoading } = usePayments(params);
  const payments = res?.payments || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="erp-page">
      <div className="erp-page-header">
          <h1 className="erp-page-title">Payments</h1>
          <p className="erp-page-subtitle">View all payment records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => {
                        const badge = statusBadge[payment.status] || statusBadge.pending;
                        return (
                          <TableRow key={payment._id}>
                            <TableCell className="font-medium">
                              {payment.invoice?.invoiceNumber || payment.invoice?._id?.slice(-6).toUpperCase() || "-"}
                            </TableCell>
                            <TableCell>
                              {payment.customer?.name || payment.invoice?.customer?.name || "-"}
                            </TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell className="capitalize">{payment.method || payment.paymentMethod || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={badge.className}>
                                {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={p === page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
