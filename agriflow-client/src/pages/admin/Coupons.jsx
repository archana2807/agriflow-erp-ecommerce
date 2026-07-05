import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema } from "@/utils/validators";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function Coupons() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const params = { page, search, limit: 10 };
  const { data: res, isLoading } = useCoupons(params);
  const coupons = res?.coupons || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openDialog = (coupon = null) => {
    setSelectedCoupon(coupon);
    if (coupon) {
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrder: coupon.minimumOrder || 0,
        maximumDiscount: coupon.maximumDiscount || 0,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
        usageLimit: coupon.usageLimit || "",
      });
    } else {
      reset({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minimumOrder: 0,
        maximumDiscount: 0,
        expiryDate: "",
        usageLimit: "",
      });
    }
    setDialogOpen(true);
  };

  const openDeleteDialog = (coupon) => {
    setSelectedCoupon(coupon);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data) => {
    if (selectedCoupon) {
      updateMutation.mutate(
        { id: selectedCoupon._id, data },
        {
          onSuccess: () => {
            toast.success("Coupon updated successfully");
            setDialogOpen(false);
            reset();
          },
          onError: (error) => toast.error(error.message || "Operation failed"),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Coupon created successfully");
          setDialogOpen(false);
          reset();
        },
        onError: (error) => toast.error(error.message || "Operation failed"),
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedCoupon._id, {
      onSuccess: () => {
        toast.success("Coupon deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to delete coupon"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Manage discount coupons</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search coupons..."
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
                      <TableHead className="font-semibold text-slate-600 pl-5">Code</TableHead>
                      <TableHead className="font-semibold text-slate-600">Type</TableHead>
                      <TableHead className="font-semibold text-slate-600">Value</TableHead>
                      <TableHead className="font-semibold text-slate-600">Min Order</TableHead>
                      <TableHead className="font-semibold text-slate-600">Expiry</TableHead>
                      <TableHead className="font-semibold text-slate-600">Status</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                          No coupons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      coupons.map((coupon) => {
                        const isExpired = new Date(coupon.expiryDate) < new Date();
                        return (
                          <TableRow key={coupon._id} className="border-slate-50 hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900 text-sm pl-5">{coupon.code}</TableCell>
                            <TableCell className="text-slate-600 text-sm capitalize">{coupon.discountType}</TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {coupon.discountType === "PERCENTAGE"
                                ? `${coupon.discountValue}%`
                                : formatCurrency(coupon.discountValue)}
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">{formatCurrency(coupon.minimumOrder || 0)}</TableCell>
                            <TableCell className="text-slate-500 text-sm">{formatDate(coupon.expiryDate)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                isExpired
                                  ? "text-red-700 bg-red-50 border-red-200"
                                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
                              }>
                                {isExpired ? "Expired" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-5">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => openDialog(coupon)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDeleteDialog(coupon)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">{selectedCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            <DialogDescription>
              {selectedCoupon ? "Update coupon details" : "Create a new discount coupon"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Code <span className="text-destructive">*</span></Label>
                <Input id="code" {...register("code")} placeholder="e.g., SAVE10" className="border-slate-200 focus-visible:ring-slate-400/20" />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Discount Type <span className="text-destructive">*</span></Label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-slate-200 focus:ring-slate-400/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FLAT">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && (
                  <p className="text-sm text-red-500">{errors.discountType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Discount Value <span className="text-destructive">*</span></Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  {...register("discountValue")}
                  placeholder="Value"
                  className="border-slate-200 focus-visible:ring-slate-400/20"
                />
                {errors.discountValue && (
                  <p className="text-sm text-red-500">{errors.discountValue.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Minimum Order</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  step="0.01"
                  {...register("minimumOrder")}
                  placeholder="Min order amount"
                  className="border-slate-200 focus-visible:ring-slate-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Maximum Discount</Label>
                <Input
                  id="maximumDiscount"
                  type="number"
                  step="0.01"
                  {...register("maximumDiscount")}
                  placeholder="Max discount"
                  className="border-slate-200 focus-visible:ring-slate-400/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  {...register("usageLimit")}
                  placeholder="Leave empty for unlimited"
                  className="border-slate-200 focus-visible:ring-slate-400/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Expiry Date <span className="text-destructive">*</span></Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating} className="bg-slate-900 hover:bg-slate-800 text-white">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedCoupon ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Coupon</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete coupon <strong className="text-slate-900">{selectedCoupon?.code}</strong>? This action cannot be undone.</p>
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
