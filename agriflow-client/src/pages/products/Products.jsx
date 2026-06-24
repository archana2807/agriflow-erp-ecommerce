import { useState } from "react";
import { useProducts, useCreateProduct } from "../../hooks/useProducts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../validations";
import { Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", sku: "", price: "", gstPercent: "18", stock: "0" },
  });

  const { data, isLoading } = useProducts({ page, limit: 10, search });
  const createMut = useCreateProduct();

  const onSubmit = (formData) => {
    createMut.mutate(formData, {
      onSuccess: () => { setOpen(false); reset({ name: "", sku: "", price: "", gstPercent: "18", stock: "0" }); },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <Button onClick={() => { reset({ name: "", sku: "", price: "", gstPercent: "18", stock: "0" }); setOpen(true); }}>
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>GST %</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : data?.products?.length ? (
              data.products.map((p, i) => (
                <TableRow key={p._id}>
                  <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>{p.gstPercent}%</TableCell>
                  <TableCell>{p.stock}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No products found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data?.total > 10 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.total / 10)}</span>
          <Button variant="outline" size="sm" disabled={page * 10 >= data.total} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium">SKU</label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price</label>
                <Input id="price" type="number" {...register("price")} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="gstPercent" className="text-sm font-medium">GST %</label>
                <Input id="gstPercent" type="number" {...register("gstPercent")} />
                {errors.gstPercent && <p className="text-sm text-destructive">{errors.gstPercent.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">Stock</label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
