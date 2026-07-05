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
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/hooks/useQueries";
import { toast } from "sonner";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  description: z.string().optional().or(z.literal("")),
});

export default function Brands() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const params = { page, search, limit: 10 };
  const { data: res, isLoading } = useBrands(params);
  const brands = res?.brands || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openDialog = (brand = null) => {
    setSelectedBrand(brand);
    if (brand) {
      reset({ name: brand.name, description: brand.description || "" });
    } else {
      reset({ name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const openDeleteDialog = (brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data) => {
    if (selectedBrand) {
      updateMutation.mutate(
        { id: selectedBrand._id, data },
        {
          onSuccess: () => {
            toast.success("Brand updated successfully");
            setDialogOpen(false);
            reset();
          },
          onError: (error) => toast.error(error.message || "Operation failed"),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Brand created successfully");
          setDialogOpen(false);
          reset();
        },
        onError: (error) => toast.error(error.message || "Operation failed"),
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedBrand._id, {
      onSuccess: () => {
        toast.success("Brand deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to delete brand"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Brands</h2>
          <p className="text-sm text-slate-500 mt-1">Manage product brands</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search brands..."
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
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-slate-500">
                        No brands found
                      </TableCell>
                    </TableRow>
                  ) : (
                    brands.map((brand) => (
                      <TableRow key={brand._id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900 text-sm pl-5">{brand.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            brand.isActive !== false
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-slate-600 bg-slate-50 border-slate-200"
                          }>
                            {brand.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => openDialog(brand)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDeleteDialog(brand)}>
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
            <DialogTitle className="text-lg font-semibold text-slate-900">{selectedBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
            <DialogDescription>
              {selectedBrand ? "Update brand details" : "Add a new brand"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name")} placeholder="Enter brand name" className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={3}
                className="border-slate-200 focus-visible:ring-slate-400/20 min-h-[80px]"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating} className="bg-slate-900 hover:bg-slate-800 text-white">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedBrand ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Brand</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{selectedBrand?.name}</strong>? This action cannot be undone.</p>
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
