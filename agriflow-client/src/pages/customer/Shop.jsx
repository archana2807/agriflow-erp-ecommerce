import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, Star, Heart, X, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, ShoppingBag, Package } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  useShopProducts,
  useShopCategories,
  useShopBrands,
  useAddToCart,
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/useQueries";
import ProductImage from "@/components/common/ProductImage";

function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="relative group rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100/50">
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition ${isWishlisted ? "ring-1 ring-red-200" : ""}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product._id); }}>
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>
      <Link to={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {discount > 0 && <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">-{discount}%</span>}
        <ProductImage src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </Link>
      <div className="p-4">
        {product.brandId?.name && <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">{product.brandId.name}</p>}
        <Link to={`/shop/${product.slug}`} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-green-600 transition mb-1 block">{product.name}</Link>
        <div className="flex items-center gap-1 mb-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          ))}
          <span className="text-[11px] text-gray-500">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.mrp)}</span>}
        </div>
        {discount > 0 && <p className="text-[11px] text-green-600 mb-2">You save {formatCurrency(product.mrp - product.price)}</p>}
        <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2" onClick={() => onAddToCart(product._id)}>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm animate-pulse ring-1 ring-gray-100/50">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef(null);
  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ q: value }), 400);
  };

  const params = {};
  if (searchQuery) params.search = searchQuery;
  if (sort) params.sort = sort;
  if (selectedCategories.length) params.category = selectedCategories.join(",");
  if (selectedBrands.length) params.brand = selectedBrands.join(",");
  if (priceMin) params.priceMin = priceMin;
  if (priceMax) params.priceMax = priceMax;
  params.page = currentPage;
  params.limit = 12;

  const { data: productsData, isLoading: loading } = useShopProducts(params);
  const { data: categoriesData, isLoading: loadingFilters } = useShopCategories();
  const { data: brandsData } = useShopBrands();
  const addToCart = useAddToCart();
  const { data: wishlistData } = useWishlist(isAuthenticated);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const wishlistIds = new Set((wishlistData?.wishlist || []).map((w) => w.productId?._id || w.productId));

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || Math.ceil(total / 12) || 1;
  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) p.delete(k);
        else if (Array.isArray(v)) p.set(k, v.join(","));
        else p.set(k, String(v));
      });
      if (updates.page === undefined && !("page" in updates)) p.set("page", "1");
      return p;
    });
  }, [setSearchParams]);

  const handleAddToCart = (id) => {
    if (!isAuthenticated) { toast.error("Please login to add items to cart"); navigate("/customer/login"); return; }
    addToCart.mutate({ productId: id, quantity: 1 }, { onSuccess: () => toast.success("Added to cart"), onError: () => toast.error("Failed") });
  };

  const handleToggleWishlist = (id) => {
    if (!isAuthenticated) { toast.error("Please login to add items to wishlist"); navigate("/customer/login"); return; }
    if (wishlistIds.has(id)) {
      removeFromWishlist.mutate(id, { onSuccess: () => toast.success("Removed from wishlist"), onError: () => toast.error("Failed") });
    } else {
      addToWishlist.mutate(id, { onSuccess: () => toast.success("Added to wishlist"), onError: () => toast.error("Failed") });
    }
  };

  const toggleCategory = (slug) => {
    const updated = selectedCategories.includes(slug) ? selectedCategories.filter((c) => c !== slug) : [...selectedCategories, slug];
    updateParams({ category: updated });
  };
  const toggleBrand = (slug) => {
    const updated = selectedBrands.includes(slug) ? selectedBrands.filter((b) => b !== slug) : [...selectedBrands, slug];
    updateParams({ brand: updated });
  };
  const clearAll = () => setSearchParams({});
  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceMin || priceMax || searchQuery;
  const activeFilterCount = selectedCategories.length + selectedBrands.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Shop</h1>
            <p className="text-green-100 text-sm">{loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} available`}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 flex-1 bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-shadow">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input type="text" placeholder="Search products..." value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} className="outline-none text-sm w-full bg-transparent" />
          {searchInput && <button onClick={() => handleSearchChange("")} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="h-3 w-3" /></button>}
        </div>
        <div className="flex gap-3">
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex-1 sm:flex-none" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            <option value="">Sort by</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
          <button className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 hover:bg-gray-50 transition shrink-0" onClick={() => setMobileFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <span className="bg-green-600 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-green-200">"{searchQuery}" <button onClick={() => updateParams({ q: "" })} className="hover:text-green-900"><X className="h-3 w-3" /></button></span>}
          {selectedCategories.map(c => { const cat = categories.find(x => x.slug === c || x._id === c); return <span key={c} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-green-200">{cat?.name || c} <button onClick={() => toggleCategory(c)} className="hover:text-green-900"><X className="h-3 w-3" /></button></span>; })}
          {selectedBrands.map(b => { const brand = brands.find(x => x.slug === b || x._id === b); return <span key={b} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-green-200">{brand?.name || b} <button onClick={() => toggleBrand(b)} className="hover:text-green-900"><X className="h-3 w-3" /></button></span>; })}
          {priceMin && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-green-200">Min: {formatCurrency(priceMin)} <button onClick={() => updateParams({ priceMin: "" })} className="hover:text-green-900"><X className="h-3 w-3" /></button></span>}
          {priceMax && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-green-200">Max: {formatCurrency(priceMax)} <button onClick={() => updateParams({ priceMax: "" })} className="hover:text-green-900"><X className="h-3 w-3" /></button></span>}
          <button className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium px-2.5 py-1 hover:text-gray-700 transition" onClick={clearAll}><RotateCcw className="h-3 w-3" /> Clear All</button>
        </div>
      )}

      <div className="flex gap-6">
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24 shadow-sm">
            <FilterContent categories={categories} brands={brands} selectedCategories={selectedCategories} selectedBrands={selectedBrands} priceMin={priceMin} priceMax={priceMax} loadingFilters={loadingFilters} toggleCategory={toggleCategory} toggleBrand={toggleBrand} updateParams={updateParams} />
          </div>
        </aside>

        {mobileFilterOpen && <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMobileFilterOpen(false)} />}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 lg:hidden ${mobileFilterOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100"><span className="font-semibold text-gray-900">Filters</span><button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
          <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
            <FilterContent categories={categories} brands={brands} selectedCategories={selectedCategories} selectedBrands={selectedBrands} priceMin={priceMin} priceMax={priceMax} loadingFilters={loadingFilters} toggleCategory={toggleCategory} toggleBrand={toggleBrand} updateParams={updateParams} />
          </div>
        </div>

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-bounce"><Package className="h-12 w-12 text-gray-400" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search.</p>
              {hasFilters && <button className="inline-flex items-center gap-2 text-green-600 text-sm font-medium hover:text-green-700 transition" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear All</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={wishlistIds.has(p._id)} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage === 1} onClick={() => updateParams({ page: currentPage - 1 })}><ChevronLeft className="h-4 w-4" /> Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) return <button key={page} className={`w-9 h-9 text-sm font-medium rounded-lg transition ${page === currentPage ? "bg-green-600 text-white shadow-sm" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"}`} onClick={() => updateParams({ page })}>{page}</button>;
                  if (Math.abs(page - currentPage) === 3) return <span key={page} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>;
                  return null;
                })}
              </div>
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage === totalPages} onClick={() => updateParams({ page: currentPage + 1 })}>Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterContent({ categories, brands, selectedCategories, selectedBrands, priceMin, priceMax, loadingFilters, toggleCategory, toggleBrand, updateParams }) {
  if (loadingFilters) return <div className="space-y-4 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-full" /><div className="h-3 bg-gray-200 rounded w-full" /></div>)}</div>;
  return (
    <>
      <div className="divide-y divide-gray-100">
        <div className="py-4 first:pt-0">
          <h4 className="text-sm font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedCategories.includes(cat.slug || cat._id)} onChange={() => toggleCategory(cat.slug || cat._id)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="py-4">
          <h4 className="text-sm font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Brands</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand._id} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedBrands.includes(brand.slug || brand._id)} onChange={() => toggleBrand(brand.slug || brand._id)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="py-4 last:pb-0">
          <h4 className="text-sm font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Price Range</h4>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={priceMin} onChange={(e) => updateParams({ priceMin: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <span className="text-gray-400">—</span>
            <input type="number" placeholder="Max" value={priceMax} onChange={(e) => updateParams({ priceMax: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4 mt-4">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2"><span className="text-white text-sm font-bold">?</span></div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h4>
        <p className="text-xs text-gray-500 mb-2">Contact us for bulk orders</p>
        <a href="tel:08989696971" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition">Call 089896 96971</a>
      </div>
    </>
  );
}
