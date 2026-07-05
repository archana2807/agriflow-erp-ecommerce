import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useQueries";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  isWalkIn: z.boolean().optional(),
});

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const params = { page, search, limit: 10 };
  const { data: res, isLoading } = useCustomers(params);
  const customers = res?.customers || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", isWalkIn: false },
  });

  const isWalkIn = watch("isWalkIn");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openDialog = (customer = null) => {
    setSelectedCustomer(customer);
    if (customer) {
      reset({ name: customer.name, phone: customer.phone || "", isWalkIn: customer.isWalkIn || false });
    } else {
      reset({ name: "", phone: "", isWalkIn: false });
    }
    setDialogOpen(true);
  };

  const openDeleteDialog = (customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      phone: data.phone,
      isWalkIn: data.isWalkIn || false,
    };

    if (selectedCustomer) {
      updateMutation.mutate(
        { id: selectedCustomer._id, data: payload },
        {
          onSuccess: () => {
            toast.success("Customer updated successfully");
            setDialogOpen(false);
            reset();
          },
          onError: (error) => toast.error(error.message || "Operation failed"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(data.isWalkIn ? "Walk-in customer created" : "Customer created successfully");
          setDialogOpen(false);
          reset();
        },
        onError: (error) => toast.error(error.message || "Operation failed"),
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedCustomer._id, {
      onSuccess: () => {
        toast.success("Customer deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to delete customer"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500 mt-1">Manage walk-in and registered customers</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search customers..."
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
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-600 pl-5">Name</TableHead>
                    <TableHead className="font-semibold text-slate-600">Phone</TableHead>
                    <TableHead className="font-semibold text-slate-600">Type</TableHead>
                    <TableHead className="font-semibold text-slate-600">Created</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer._id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900 text-sm pl-5">{customer.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{customer.phone || "-"}</TableCell>
                        <TableCell>
                          {customer.isWalkIn ? (
                            <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Walk-In
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                              Registered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{formatDate(customer.createdAt)}</TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => openDialog(customer)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDeleteDialog(customer)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">{selectedCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? "Update customer details" : "Register a new customer or walk-in"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name")} placeholder="Enter name" className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="Enter phone number" className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isWalkIn"
                checked={isWalkIn}
                onChange={(e) => setValue("isWalkIn", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="isWalkIn" className="cursor-pointer text-sm text-slate-700">
                Walk-in Customer (no account needed)
              </Label>
            </div>
            {isWalkIn && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                A placeholder account will be created. The customer can still place orders through the counter.
              </p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating} className="bg-slate-900 hover:bg-slate-800 text-white">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedCustomer ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{selectedCustomer?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
