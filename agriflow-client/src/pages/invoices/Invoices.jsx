import { useOrders } from "../../hooks/useOrders";
import { useCreateInvoice } from "../../hooks/useInvoices";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Invoices() {
  const { data: ordersData, isLoading } = useOrders();
  const createInv = useCreateInvoice();

  const handleCreateInvoice = (orderId) => {
    createInv.mutate({ orderId });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
        <p className="text-sm text-muted-foreground">Create invoices from orders</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : ordersData?.orders?.length ? (
              ordersData.orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs">{o._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{o.customer?.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.items?.length} items</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleCreateInvoice(o._id)}>
                      <FileText className="size-4" /> Generate Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
