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
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useQueries";
import { categorySchema } from "@/utils/validators";
import { toast } from "sonner";

export default function Categories() {
  const [q, setQ] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [editing, setEditing] = useState(null);

  const { data: res, isLoading } = useCategories({ page: curPage, search: q, limit: 10 });
  const categories = res?.categories || [];
  const totalPages = res?.totalPages || Math.ceil((res?.total || 0) / 10) || 1;

  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const openDialog = (cat = null) => {
    setEditing(cat);
    reset(cat ? { name: cat.name, slug: cat.slug, description: cat.description || "" } : { name: "", slug: "", description: "" });
    setOpen(true);
  };

  const onSubmit = (data) => {
    if (editing) {
      updateMut.mutate(
        { id: editing._id, data },
        {
          onSuccess: () => {
            toast.success("Category updated");
            setOpen(false);
            reset();
          },
          onError: (err) => toast.error(err.message || "Update failed"),
        }
      );
    } else {
      createMut.mutate(data, {
        onSuccess: () => {
          toast.success("Category created");
          setOpen(false);
          reset();
        },
        onError: (err) => toast.error(err.message || "Create failed"),
      });
    }
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    deleteMut.mutate(delTarget._id, {
      onSuccess: () => {
        toast.success("Category deleted");
        setDelTarget(null);
      },
      onError: (err) => toast.error(err.message || "Delete failed"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500 mt-1">Manage product categories</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search categories..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setCurPage(1); }}
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
                    <TableHead className="font-semibold text-slate-600">Slug</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat) => (
                      <TableRow key={cat._id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900 text-sm pl-5">{cat.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{cat.slug}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            cat.isActive !== false
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-slate-600 bg-slate-50 border-slate-200"
                          }>
                            {cat.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => openDialog(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDelTarget(cat)}>
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
                  <p className="text-sm text-slate-500">Page {curPage} of {totalPages}</p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurPage((p) => Math.max(1, p - 1))} disabled={curPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pg;
                      if (totalPages <= 5) pg = i + 1;
                      else if (curPage <= 3) pg = i + 1;
                      else if (curPage >= totalPages - 2) pg = totalPages - 4 + i;
                      else pg = curPage - 2 + i;
                      return (
                        <Button key={pg} variant={curPage === pg ? "default" : "outline"} size="icon" className={`h-8 w-8 ${curPage === pg ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} onClick={() => setCurPage(pg)}>
                          {pg}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurPage((p) => Math.min(totalPages, p + 1))} disabled={curPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">{editing ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update category details" : "Add a new category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name")} placeholder="Enter category name" className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Slug <span className="text-destructive">*</span></Label>
              <Input id="slug" {...register("slug")} placeholder="Enter slug" className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="bg-slate-900 hover:bg-slate-800 text-white">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!delTarget} onOpenChange={() => setDelTarget(null)}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{delTarget?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDelTarget(null)} className="border-slate-200">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
