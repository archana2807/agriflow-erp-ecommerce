import { useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Star, Heart, X, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  useShopProducts,
  useShopCategories,
  useShopBrands,
  useAddToCart,
  useAddToWishlist,
} from "@/hooks/useQueries";

/* ── Product Card ────────────────────────────────── */
function ProductCard({ product, onAddToCart, onToggleWishlist }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="shop-product-card">
      <div className="shop-card-actions">
        <button className="shop-action-btn" onClick={(e) => { e.preventDefault(); onToggleWishlist(product._id); }}>
          <Heart className="h-4 w-4" />
        </button>
      </div>
      {discount > 0 && <span className="shop-discount-badge">-{discount}%</span>}
      <Link to={`/shop/${product.slug}`} className="shop-card-image">
        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
      </Link>
      <div className="shop-card-body">
        {product.brand && <p className="shop-card-brand">{product.brand?.name || product.brand}</p>}
        <Link to={`/shop/${product.slug}`} className="shop-card-name">{product.name}</Link>
        <div className="shop-card-rating">
          {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
          <span>({product.reviewCount || 0})</span>
        </div>
        <div className="shop-card-price">
          <span className="shop-current-price">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="shop-original-price">{formatCurrency(product.mrp)}</span>}
        </div>
        <button className="shop-add-btn" onClick={() => onAddToCart(product._id)}>
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="shop-product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="skeleton-body">
        <div className="sk-line short"></div>
        <div className="sk-line"></div>
        <div className="sk-line medium"></div>
        <div className="sk-line short"></div>
      </div>
    </div>
  );
}

/* ── Main Shop ───────────────────────────────────── */
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuth();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";

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
  const addToWishlist = useAddToWishlist();

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
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/customer/login");
      return;
    }
    addToCart.mutate({ productId: id, qty: 1 }, {
      onSuccess: () => toast.success("Added to cart"),
      onError: () => toast.error("Failed to add"),
    });
  };

  const handleToggleWishlist = (id) => {
    addToWishlist.mutate(id, {
      onSuccess: () => toast.success("Added to wishlist"),
      onError: () => toast.error("Failed"),
    });
  };

  const toggleCategory = (slug) => {
    const updated = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    updateParams({ category: updated });
  };

  const toggleBrand = (slug) => {
    const updated = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug];
    updateParams({ brand: updated });
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceMin || priceMax || searchQuery;

  return (
    <div className="shop-page">
      {/* Breadcrumb */}
      <div className="shop-breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Shop</span>
      </div>

      {/* Header */}
      <div className="shop-header">
        <div>
          <h1>Shop Agricultural Machinery</h1>
          <p>{loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} found`}</p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="shop-toolbar">
        <div className="shop-search">
          <Search className="h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => updateParams({ q: e.target.value })}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => updateParams({ q: "" })}>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <select className="shop-sort" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
          <option value="">Sort by</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="active-filters">
          {searchQuery && <span className="filter-tag">Search: {searchQuery} <button onClick={() => updateParams({ q: "" })}><X className="h-3 w-3" /></button></span>}
          {selectedCategories.map(c => {
            const cat = categories.find(x => x.slug === c || x._id === c);
            return <span key={c} className="filter-tag">{cat?.name || c} <button onClick={() => toggleCategory(c)}><X className="h-3 w-3" /></button></span>;
          })}
          {selectedBrands.map(b => {
            const brand = brands.find(x => x.slug === b || x._id === b);
            return <span key={b} className="filter-tag">{brand?.name || b} <button onClick={() => toggleBrand(b)}><X className="h-3 w-3" /></button></span>;
          })}
          {priceMin && <span className="filter-tag">Min: ₹{priceMin} <button onClick={() => updateParams({ priceMin: "" })}><X className="h-3 w-3" /></button></span>}
          {priceMax && <span className="filter-tag">Max: ₹{priceMax} <button onClick={() => updateParams({ priceMax: "" })}><X className="h-3 w-3" /></button></span>}
          <button className="clear-all" onClick={clearAll}>Clear All</button>
        </div>
      )}

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="sidebar-header">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </div>

          {loadingFilters ? (
            <div className="sidebar-skeleton">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="sk-group">
                  <div className="sk-line short"></div>
                  <div className="sk-line"></div>
                  <div className="sk-line"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="filter-group">
                <h4>Categories</h4>
                <div className="filter-list">
                  {categories.map((cat) => (
                    <label key={cat._id} className="filter-item">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug || cat._id)}
                        onChange={() => toggleCategory(cat.slug || cat._id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="filter-group">
                <h4>Brands</h4>
                <div className="filter-list">
                  {brands.map((brand) => (
                    <label key={brand._id} className="filter-item">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.slug || brand._id)}
                        onChange={() => toggleBrand(brand.slug || brand._id)}
                      />
                      <span>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => updateParams({ priceMin: e.target.value })}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => updateParams({ priceMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Help Box */}
              <div className="help-box">
                <i className="fa-solid fa-headset"></i>
                <h4>Need Help?</h4>
                <p>Contact us for bulk orders</p>
                <a href="tel:08989696971" className="help-btn">
                  <Phone className="h-3 w-3" /> 089896 96971
                </a>
              </div>
            </>
          )}
        </aside>

        {/* Products */}
        <main className="shop-main">
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-box-open"></i>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search.</p>
              {hasFilters && <button className="clear-all-btn" onClick={clearAll}>Clear All Filters</button>}
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="shop-pagination">
              <button disabled={currentPage === 1} onClick={() => updateParams({ page: currentPage - 1 })}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) {
                    return (
                      <button
                        key={page}
                        className={`page-num ${page === currentPage ? "active" : ""}`}
                        onClick={() => updateParams({ page })}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (Math.abs(page - currentPage) === 3) return <span key={page} className="page-dots">...</span>;
                  return null;
                })}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => updateParams({ page: currentPage + 1 })}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
