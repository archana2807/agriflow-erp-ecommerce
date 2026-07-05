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

function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="product-card">
      <div className="card-actions">
        <button className={`wish-btn ${isWishlisted ? "active" : ""}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product._id); }}>
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
      <Link to={`/shop/${product.slug}`} className="product-image">
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
      </Link>
      <div className="product-info">
        {product.brandId?.name && <p className="product-brand">{product.brandId.name}</p>}
        <Link to={`/shop/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="product-rating">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          ))}
          <span>({product.reviewCount || 0})</span>
        </div>
        <div className="product-price">
          <span className="current-price">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="original-price">{formatCurrency(product.mrp)}</span>}
        </div>
        {discount > 0 && <p className="product-save">You save {formatCurrency(product.mrp - product.price)}</p>}
        <button className="add-to-cart-btn" onClick={() => onAddToCart(product._id)}>
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-info">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line medium"></div>
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
    <div className="shop-page">
      {/* Hero Banner */}
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <ShoppingBag className="h-6 w-6" />
            <div>
              <h1>Shop</h1>
              <p>{loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} available`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="shop-toolbar">
        <div className="shop-search">
          <Search className="h-4 w-4" />
          <input type="text" placeholder="Search products..." value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} />
          {searchInput && <button className="search-clear" onClick={() => handleSearchChange("")}><X className="h-3 w-3" /></button>}
        </div>
        <select className="shop-sort" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
          <option value="">Sort by</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Popular</option>
        </select>
        <button className="shop-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      {hasFilters && (
        <div className="active-filters">
          {searchQuery && <span className="filter-tag">"{searchQuery}" <button onClick={() => updateParams({ q: "" })}><X className="h-3 w-3" /></button></span>}
          {selectedCategories.map(c => { const cat = categories.find(x => x.slug === c || x._id === c); return <span key={c} className="filter-tag">{cat?.name || c} <button onClick={() => toggleCategory(c)}><X className="h-3 w-3" /></button></span>; })}
          {selectedBrands.map(b => { const brand = brands.find(x => x.slug === b || x._id === b); return <span key={b} className="filter-tag">{brand?.name || b} <button onClick={() => toggleBrand(b)}><X className="h-3 w-3" /></button></span>; })}
          {priceMin && <span className="filter-tag">Min: {formatCurrency(priceMin)} <button onClick={() => updateParams({ priceMin: "" })}><X className="h-3 w-3" /></button></span>}
          {priceMax && <span className="filter-tag">Max: {formatCurrency(priceMax)} <button onClick={() => updateParams({ priceMax: "" })}><X className="h-3 w-3" /></button></span>}
          <button className="clear-all" onClick={clearAll}><RotateCcw className="h-3 w-3" /> Clear All</button>
        </div>
      )}

      <div className="shop-layout">
        <aside className="shop-sidebar desktop-only">
          <FilterContent categories={categories} brands={brands} selectedCategories={selectedCategories} selectedBrands={selectedBrands} priceMin={priceMin} priceMax={priceMax} loadingFilters={loadingFilters} toggleCategory={toggleCategory} toggleBrand={toggleBrand} updateParams={updateParams} />
        </aside>

        {mobileFilterOpen && <div className="shop-filter-overlay" onClick={() => setMobileFilterOpen(false)} />}
        <div className={`shop-filter-drawer ${mobileFilterOpen ? "open" : ""}`}>
          <div className="filter-drawer-header"><span>Filters</span><button onClick={() => setMobileFilterOpen(false)}><X className="h-5 w-5" /></button></div>
          <div className="filter-drawer-body">
            <FilterContent categories={categories} brands={brands} selectedCategories={selectedCategories} selectedBrands={selectedBrands} priceMin={priceMin} priceMax={priceMax} loadingFilters={loadingFilters} toggleCategory={toggleCategory} toggleBrand={toggleBrand} updateParams={updateParams} />
          </div>
        </div>

        <main className="shop-main">
          {loading ? (
            <div className="products-grid">{Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}</div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <div className="shop-empty-icon"><Package className="h-12 w-12" /></div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search.</p>
              {hasFilters && <button className="shop-empty-btn" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear All</button>}
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={wishlistIds.has(p._id)} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="shop-pagination">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => updateParams({ page: currentPage - 1 })}><ChevronLeft className="h-4 w-4" /> Prev</button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) return <button key={page} className={`page-num ${page === currentPage ? "active" : ""}`} onClick={() => updateParams({ page })}>{page}</button>;
                  if (Math.abs(page - currentPage) === 3) return <span key={page} className="page-dots">...</span>;
                  return null;
                })}
              </div>
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => updateParams({ page: currentPage + 1 })}>Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterContent({ categories, brands, selectedCategories, selectedBrands, priceMin, priceMax, loadingFilters, toggleCategory, toggleBrand, updateParams }) {
  if (loadingFilters) return <div className="sidebar-skeleton">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="sk-group"><div className="sk-line short"></div><div className="sk-line"></div><div className="sk-line"></div></div>)}</div>;
  return (
    <>
      <div className="filter-group">
        <h4>Categories</h4>
        <div className="filter-list">
          {categories.map((cat) => (
            <label key={cat._id} className="filter-item">
              <input type="checkbox" checked={selectedCategories.includes(cat.slug || cat._id)} onChange={() => toggleCategory(cat.slug || cat._id)} />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <h4>Brands</h4>
        <div className="filter-list">
          {brands.map((brand) => (
            <label key={brand._id} className="filter-item">
              <input type="checkbox" checked={selectedBrands.includes(brand.slug || brand._id)} onChange={() => toggleBrand(brand.slug || brand._id)} />
              <span>{brand.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input type="number" placeholder="Min" value={priceMin} onChange={(e) => updateParams({ priceMin: e.target.value })} />
          <span className="price-dash">—</span>
          <input type="number" placeholder="Max" value={priceMax} onChange={(e) => updateParams({ priceMax: e.target.value })} />
        </div>
      </div>
      <div className="help-box">
        <div className="help-box-icon"><span className="text-white">?</span></div>
        <h4>Need Help?</h4>
        <p>Contact us for bulk orders</p>
        <a href="tel:08989696971" className="help-btn">Call 089896 96971</a>
      </div>
    </>
  );
}
