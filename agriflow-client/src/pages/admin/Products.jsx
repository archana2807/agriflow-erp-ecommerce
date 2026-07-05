import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Upload, X, Package } from "lucide-react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { brandService } from "@/services/brand.service";
import { uploadService } from "@/services/upload.service";

const PRODUCTS_PER_PAGE = 12;

function ProductForm({ product, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", sellingPrice: "", gstPercent: "",
    category: "", brand: "", sku: "", stock: "", unit: "kg",
    featured: false, bestSeller: false, newArrival: false,
  });
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });
  const { data: brandsData } = useQuery({ queryKey: ["brands"], queryFn: brandService.getAll });
  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "", slug: product.slug || "", description: product.description || "",
        price: product.price || "", sellingPrice: product.sellingPrice || "", gstPercent: product.gstPercent ?? "",
        category: product.categoryId?._id || product.categoryId || product.category || "",
        brand: product.brandId?._id || product.brandId || product.brand || "",
        sku: product.sku || "", stock: product.stock ?? "", unit: product.unit || "kg",
        featured: product.featured || false, bestSeller: product.bestSeller || false, newArrival: product.newArrival || false,
      });
      setImages(product.images || []);
    } else {
      setForm({ name: "", slug: "", description: "", price: "", sellingPrice: "", gstPercent: "", category: "", brand: "", sku: "", stock: "", unit: "kg", featured: false, bestSeller: false, newArrival: false });
      setImages([]);
    }
  }, [product]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await uploadService.uploadImage(formData);
        return response.data.data || response.data;
      });
      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages].slice(0, 6));
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.sku || form.gstPercent === "") { toast.error("Name, price, SKU, and GST % are required"); return; }
    const payload = {
      name: form.name, slug: form.slug, description: form.description,
      price: Number(form.price), sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
      gstPercent: Number(form.gstPercent), stock: form.stock ? Number(form.stock) : 0,
      category: form.category || undefined, brand: form.brand || undefined,
      sku: form.sku, unit: form.unit, images,
      featured: form.featured, bestSeller: form.bestSeller, newArrival: form.newArrival,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Slug</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" className="border-slate-200 focus-visible:ring-slate-400/20 min-h-[80px]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Price *</Label>
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">GST % *</Label>
          <Input type="number" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} placeholder="0" min="0" max="28" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Selling Price</Label>
          <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0.00" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">SKU *</Label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Stock</Label>
          <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="border-slate-200 focus-visible:ring-slate-400/20" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="border-slate-200 focus:ring-slate-400/20"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Brand</Label>
          <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
            <SelectTrigger className="border-slate-200 focus:ring-slate-400/20"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{brands.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Unit</Label>
          <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
            <SelectTrigger className="border-slate-200 focus:ring-slate-400/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilogram</SelectItem><SelectItem value="g">Gram</SelectItem>
              <SelectItem value="ltr">Litre</SelectItem><SelectItem value="ml">Millilitre</SelectItem>
              <SelectItem value="piece">Piece</SelectItem><SelectItem value="dozen">Dozen</SelectItem>
              <SelectItem value="quintal">Quintal</SelectItem><SelectItem value="tonne">Tonne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-slate-300" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.bestSeller} onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })} className="rounded border-slate-300" />
          Best Seller
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} className="rounded border-slate-300" />
          New Arrival
        </label>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Images (up to 6)</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group h-20 w-20 rounded-lg overflow-hidden border border-slate-200">
              <img src={img.url || img} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              {uploadingImages ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /> : <Upload className="h-5 w-5 text-slate-400" />}
            </label>
          )}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", currentPage, debouncedSearch, categoryFilter, brandFilter, statusFilter],
    queryFn: () => productService.getAll({ page: currentPage, limit: PRODUCTS_PER_PAGE, search: debouncedSearch || undefined, category: categoryFilter !== "all" ? categoryFilter : undefined, brand: brandFilter !== "all" ? brandFilter : undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });
  const { data: brandsData } = useQuery({ queryKey: ["brands"], queryFn: brandService.getAll });
  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  const createMutation = useMutation({ mutationFn: (data) => productService.create(data), onSuccess: () => { queryClient.invalidateQueries(["admin-products"]); toast.success("Product created"); setShowCreateDialog(false); }, onError: (e) => toast.error(e.message || "Failed") });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => productService.update(id, data), onSuccess: () => { queryClient.invalidateQueries(["admin-products"]); toast.success("Product updated"); setEditingProduct(null); }, onError: (e) => toast.error(e.message || "Failed") });
  const deleteMutation = useMutation({ mutationFn: (id) => productService.delete(id), onSuccess: () => { queryClient.invalidateQueries(["admin-products"]); toast.success("Product deleted"); setDeletingProduct(null); }, onError: (e) => toast.error(e.message || "Failed") });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products</h2>
          <p className="text-sm text-slate-500 mt-1">{totalCount} total products</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 border-slate-200 focus-visible:ring-slate-400/20" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              <Filter className="h-4 w-4 mr-2" /> Filters {(categoryFilter !== "all" || brandFilter !== "all" || statusFilter !== "all") && <span className="ml-1 h-5 w-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">!</span>}
            </Button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-[160px] border-slate-200"><SelectValue placeholder="Brand" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Brands</SelectItem>{brands.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              {(categoryFilter !== "all" || brandFilter !== "all" || statusFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter("all"); setBrandFilter("all"); setStatusFilter("all"); setCurrentPage(1); }} className="text-slate-500 hover:text-slate-700">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 pl-5">Product</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="font-semibold text-slate-600">Brand</TableHead>
                <TableHead className="font-semibold text-slate-600">Price</TableHead>
                <TableHead className="font-semibold text-slate-600">Stock</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50">
                    <TableCell className="pl-5 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><Skeleton className="h-4 w-32" /></div></TableCell>
                    {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>)}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No products found</TableCell></TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="pl-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                          {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.sku || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{product.categoryId?.name || "—"}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{product.brandId?.name || "—"}</TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium text-slate-900">₹{product.price}</span>
                      {product.sellingPrice && <span className="text-slate-400 line-through text-xs ml-1.5">₹{product.sellingPrice}</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={product.stock > 10 ? "text-slate-700" : product.stock > 0 ? "text-amber-600" : "text-red-600"}>
                        {product.stock ?? 0} {product.unit || "kg"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        product.isActive ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-slate-600 bg-slate-50 border-slate-200"
                      }>{product.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => setEditingProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingProduct(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className={`h-8 w-8 ${currentPage === page ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <ProductForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-900">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            {editingProduct && <ProductForm product={editingProduct} onSubmit={(data) => updateMutation.mutate({ id: editingProduct._id, data })} isLoading={updateMutation.isPending} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent className="max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{deletingProduct?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeletingProduct(null)} className="border-slate-200">Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deletingProduct._id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
