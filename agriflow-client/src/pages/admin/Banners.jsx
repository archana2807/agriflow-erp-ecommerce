import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/hooks/useQueries";
import { toast } from "sonner";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().or(z.literal("")),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  buttonText: z.string().optional().or(z.literal("")),
  buttonLink: z.string().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export default function Banners() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const { data: res, isLoading } = useBanners();
  const banners = res?.banners || [];

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bannerSchema),
  });

  const openDialog = (banner = null) => {
    setSelectedBanner(banner);
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle || "",
        image: banner.image || "",
        buttonText: banner.buttonText || "",
        buttonLink: banner.buttonLink || "",
        displayOrder: banner.displayOrder || 0,
      });
    } else {
      reset({
        title: "",
        subtitle: "",
        image: "",
        buttonText: "",
        buttonLink: "",
        displayOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const openDeleteDialog = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data) => {
    if (selectedBanner) {
      updateMutation.mutate(
        { id: selectedBanner._id, data },
        {
          onSuccess: () => {
            toast.success("Banner updated successfully");
            setDialogOpen(false);
            reset();
          },
          onError: (error) => toast.error(error.message || "Operation failed"),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Banner created successfully");
          setDialogOpen(false);
          reset();
        },
        onError: (error) => toast.error(error.message || "Operation failed"),
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedBanner._id, {
      onSuccess: () => {
        toast.success("Banner deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error) => toast.error(error.message || "Failed to delete banner"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Banners</h2>
          <p className="text-sm text-slate-500 mt-1">Manage homepage banners</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-600 pl-5">Title</TableHead>
                    <TableHead className="font-semibold text-slate-600">Display Order</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                        No banners found
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner._id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900 text-sm pl-5">{banner.title}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{banner.displayOrder || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            banner.isActive !== false
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-slate-600 bg-slate-50 border-slate-200"
                          }>
                            {banner.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => openDialog(banner)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDeleteDialog(banner)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">{selectedBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
            <DialogDescription>
              {selectedBanner ? "Update banner details" : "Create a new banner"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Title <span className="text-destructive">*</span></Label>
                <Input id="title" {...register("title")} placeholder="Banner title" className="border-slate-200 focus-visible:ring-slate-400/20" />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  {...register("displayOrder")}
                  placeholder="0"
                  className="border-slate-200 focus-visible:ring-slate-400/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Subtitle</Label>
              <Input id="subtitle" {...register("subtitle")} placeholder="Banner subtitle" className="border-slate-200 focus-visible:ring-slate-400/20" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Image URL <span className="text-destructive">*</span></Label>
              <Input id="image" {...register("image")} placeholder="https://..." className="border-slate-200 focus-visible:ring-slate-400/20" />
              {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Button Text</Label>
                <Input id="buttonText" {...register("buttonText")} placeholder="Shop Now" className="border-slate-200 focus-visible:ring-slate-400/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Button Link</Label>
                <Input id="buttonLink" {...register("buttonLink")} placeholder="/products" className="border-slate-200 focus-visible:ring-slate-400/20" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating} className="bg-slate-900 hover:bg-slate-800 text-white">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedBanner ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{selectedBanner?.title}</strong>? This action cannot be undone.</p>
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
