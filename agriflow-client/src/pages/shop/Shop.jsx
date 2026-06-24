import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getPublicProducts } from "../../api/products";
import { addToCart, selectCartItems } from "../../store/cartSlice";
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import {
  Search,
  ShoppingCart,
  Plus,
  Star,
  Package,
  Minus,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PER_PAGE = 12;

const CATEGORIES = [
  { label: "All", icon: null },
  { label: "Cultivator", icon: "🚜" },
  { label: "Thresher", icon: "⚙️" },
  { label: "Plough", icon: "🛡️" },
  { label: "Trolley", icon: "🚛" },
  { label: "Seed Drill", icon: "🌱" },
  { label: "Sprayer", icon: "💧" },
  { label: "Rotavator", icon: "🔧" },
  { label: "Harvester", icon: "🌾" },
];

function guessCategory(name) {
  const lower = name.toLowerCase();
  if (/cultivator|tyne|tiller/.test(lower)) return "Cultivator";
  if (/thresher/.test(lower)) return "Thresher";
  if (/plough|plow|disc|shield|furrow/.test(lower)) return "Plough";
  if (/trolley|trailer|tipper/.test(lower)) return "Trolley";
  if (/seed.?drill|seeder|planter/.test(lower)) return "Seed Drill";
  if (/sprayer|sprinkler|boom/.test(lower)) return "Sprayer";
  if (/rotavator|rotary|rotavet/.test(lower)) return "Rotavator";
  if (/harvester|combine|reaper/.test(lower)) return "Harvester";
  return "Other";
}

function getCategoryGradient(name) {
  const lower = name.toLowerCase();
  if (/cultivator|tyne|tiller/.test(lower))
    return "linear-gradient(135deg, #065f46, #047857)";
  if (/thresher/.test(lower))
    return "linear-gradient(135deg, #1e3a5f, #2563eb)";
  if (/plough|plow|disc|shield|furrow/.test(lower))
    return "linear-gradient(135deg, #7c2d12, #ea580c)";
  if (/trolley|trailer|tipper/.test(lower))
    return "linear-gradient(135deg, #3b0764, #9333ea)";
  if (/seed.?drill|seeder|planter/.test(lower))
    return "linear-gradient(135deg, #14532d, #16a34a)";
  if (/sprayer|sprinkler|boom/.test(lower))
    return "linear-gradient(135deg, #0c4a6e, #0ea5e9)";
  if (/rotavator|rotary|rotavet/.test(lower))
    return "linear-gradient(135deg, #713f12, #ca8a04)";
  if (/harvester|combine|reaper/.test(lower))
    return "linear-gradient(135deg, #4a1d96, #7c3aed)";
  return "linear-gradient(135deg, #065f46, #047857)";
}

function getCategoryEmoji(name) {
  const lower = name.toLowerCase();
  if (/cultivator|tyne|tiller/.test(lower)) return "🚜";
  if (/thresher/.test(lower)) return "⚙️";
  if (/plough|plow|disc|shield|furrow/.test(lower)) return "🛡️";
  if (/trolley|trailer|tipper/.test(lower)) return "🚛";
  if (/seed.?drill|seeder|planter/.test(lower)) return "🌱";
  if (/sprayer|sprinkler|boom/.test(lower)) return "💧";
  if (/rotavator|rotary|rotavet/.test(lower)) return "🔧";
  if (/harvester|combine|reaper/.test(lower)) return "🌾";
  return "📦";
}

function getStockStatus(stock) {
  if (stock === 0)
    return {
      label: "Out of Stock",
      className: "bg-destructive/10 text-destructive",
    };
  if (stock <= 5)
    return {
      label: `Only ${stock} left`,
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  return {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
}

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const { data, isLoading } = useQuery({
    queryKey: [
      "public-products",
      { page, limit: PER_PAGE, search: debouncedSearch, sort: sortBy },
    ],
    queryFn: () =>
      getPublicProducts({
        page,
        limit: PER_PAGE,
        search: debouncedSearch,
        sort: sortBy,
      }),
  });

  const products = useMemo(() => {
    let list = data?.products || [];
    if (category !== "All") {
      list = list.filter((p) => guessCategory(p.name) === category);
    }
    return list;
  }, [data, category]);

  const totalPages = Math.ceil((data?.total || 0) / PER_PAGE);

  const getQtyInCart = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />

      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <Badge variant="secondary" className="text-xs">
            {data?.total || 0} items
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={handleSearch}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="featured">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.label)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  category === cat.label
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.icon && <span className="text-base">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Package className="size-12 text-muted-foreground/40" strokeWidth={1.2} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                No products found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const stock = getStockStatus(product.stock);
                const cat = guessCategory(product.name);
                const qtyInCart = getQtyInCart(product._id);
                const gstAmount =
                  (product.price * product.gstPercent) / 100;
                const finalPrice = product.price + gstAmount;

                return (
                  <div
                    key={product._id}
                    className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Card Top */}
                    <div
                      className="relative flex h-40 items-center justify-center"
                      style={{
                        background: getCategoryGradient(product.name),
                      }}
                    >
                      <span className="text-5xl select-none">
                        {getCategoryEmoji(product.name)}
                      </span>

                      <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 bg-white/90 text-foreground backdrop-blur-sm dark:bg-black/50 dark:text-foreground"
                      >
                        {cat}
                      </Badge>

                      {stock.className.includes("destructive") && (
                        <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                          Sold Out
                        </Badge>
                      )}
                      {stock.className.includes("amber") && (
                        <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                          {product.stock} left
                        </Badge>
                      )}

                      <button
                        onClick={() => setQuickView(product)}
                        className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 dark:bg-black/50 dark:hover:bg-black/70"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col gap-2 p-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {product.sku}
                      </span>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1">
                        <Star
                          className="size-3.5 fill-amber-400 text-amber-400"
                        />
                        <span className="text-xs font-medium text-foreground">
                          4.{product.name.length % 5}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ₹{finalPrice.toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          incl. {product.gstPercent}% GST
                        </span>
                      </div>

                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          stock.className
                        )}
                      >
                        {stock.label}
                      </span>

                      {qtyInCart > 0 ? (
                        <div className="mt-1 flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                if (qtyInCart === 1) {
                                  dispatch({
                                    type: "cart/removeFromCart",
                                    payload: product._id,
                                  });
                                } else {
                                  dispatch({
                                    type: "cart/updateQuantity",
                                    payload: {
                                      productId: product._id,
                                      quantity: qtyInCart - 1,
                                    },
                                  });
                                }
                              }}
                              className="flex size-8 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-[2ch] text-center text-sm font-semibold">
                              {qtyInCart}
                            </span>
                            <button
                              disabled={qtyInCart >= product.stock}
                              onClick={() =>
                                dispatch({
                                  type: "cart/updateQuantity",
                                  payload: {
                                    productId: product._id,
                                    quantity: qtyInCart + 1,
                                  },
                                })
                              }
                              className="flex size-8 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5"
                            onClick={() => navigate("/cart")}
                          >
                            <ShoppingCart className="size-3.5" />
                            View Cart
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="mt-1 w-full gap-1.5"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="size-3.5" />
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
                  )
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="px-1 text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "size-9",
                          page === p &&
                            "bg-emerald-600 text-white hover:bg-emerald-700"
                        )}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      <Dialog
        open={!!quickView}
        onOpenChange={(open) => {
          if (!open) setQuickView(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {quickView && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-16 shrink-0 items-center justify-center rounded-xl text-3xl"
                    style={{
                      background: getCategoryGradient(quickView.name),
                    }}
                  >
                    {getCategoryEmoji(quickView.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {guessCategory(quickView.name)}
                    </Badge>
                    <DialogTitle className="text-lg leading-tight">
                      {quickView.name}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 font-mono text-xs">
                      SKU: {quickView.sku}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    ₹
                    {(
                      quickView.price +
                      (quickView.price * quickView.gstPercent) / 100
                    ).toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    + {quickView.gstPercent}% GST
                  </span>
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-medium">₹{quickView.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      GST ({quickView.gstPercent}%)
                    </span>
                    <span className="font-medium">
                      ₹
                      {(
                        (quickView.price * quickView.gstPercent) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">
                      Availability
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        quickView.stock === 0
                          ? "text-destructive"
                          : quickView.stock <= 5
                            ? "text-amber-600"
                            : "text-emerald-600"
                      )}
                    >
                      {quickView.stock} units
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full gap-2"
                  disabled={quickView.stock === 0}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error("Please login to add items to cart");
                      navigate("/login");
                      return;
                    }
                    dispatch(addToCart(quickView));
                    toast.success(`${quickView.name} added to cart!`);
                    setQuickView(null);
                  }}
                >
                  <ShoppingCart className="size-4" />
                  {quickView.stock === 0
                    ? "Out of Stock"
                    : !isAuthenticated
                      ? "Login to Buy"
                      : "Add to Cart"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
