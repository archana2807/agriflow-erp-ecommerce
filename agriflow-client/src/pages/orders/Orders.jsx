import { useState } from "react";
import { useOrders, useCreateOrder, useUpdateOrderStatus, useDeleteOrder } from "../../hooks/useOrders";
import { useCustomers } from "../../hooks/useCustomers";
import { useProducts } from "../../hooks/useProducts";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema } from "../../validations";
import { Plus, Trash2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_VARIANT = {
  PENDING: "secondary",
  CONFIRMED: "default",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default function Orders() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerId: "", items: [{ productId: "", quantity: "", price: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const { data, isLoading } = useOrders();
  const { data: customers } = useCustomers({ limit: 100 });
  const { data: products } = useProducts({ limit: 100 });
  const createMut = useCreateOrder();
  const updateMut = useUpdateOrderStatus();
  const deleteMut = useDeleteOrder();

  const onSubmit = (formData) => {
    createMut.mutate(formData, {
      onSuccess: () => { setOpen(false); },
    });
  };

  const handleStatus = (id, status) => updateMut.mutate({ id, data: { status } });
  const handleDelete = (id) => { if (confirm("Delete order?")) deleteMut.mutate(id); };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New Order
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : data?.orders?.length ? (
              data.orders.map((o, i) => (
                <TableRow key={o._id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{o.customer?.name}</TableCell>
                  <TableCell>{o.items?.length}</TableCell>
                  <TableCell>₹{o.items?.reduce((sum, it) => sum + it.price * it.quantity, 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(val) => handleStatus(o._id, val)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setDetail(o)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(o._id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <select
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register("customerId")}
              >
                <option value="">Select customer</option>
                {customers?.customers?.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Items</label>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <select
                      className="flex h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      {...register(`items.${i}.productId`)}
                    >
                      <option value="">Select product</option>
                      {products?.products?.map((p) => (
                        <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                    <Input type="number" placeholder="Qty" className="w-20" {...register(`items.${i}.quantity`)} min="1" />
                    <Input type="number" placeholder="Price" className="w-24" {...register(`items.${i}.price`)} />
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} className="text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: "", price: "" })}>
                <Plus className="size-4" /> Add Item
              </Button>
              {errors.items && <p className="text-sm text-destructive">{errors.items.message || errors.items?.root?.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm"><span className="font-medium">Customer:</span> {detail?.customer?.name}</p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={STATUS_VARIANT[detail?.status] || "secondary"}>{detail?.status}</Badge>
              </p>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail?.items?.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>{it.product?.name || it.product}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>₹{it.price}</TableCell>
                      <TableCell>₹{(it.price * it.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
