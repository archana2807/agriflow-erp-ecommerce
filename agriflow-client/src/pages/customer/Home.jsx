import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Phone, Star, Shield, Truck, Headphones, RotateCcw, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useShopProducts, useShopCategories, useBestSellers, useNewArrivals, useAddToCart } from "@/hooks/useQueries";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { toast } from "sonner";

const categoryIcons = {
  "tractor-parts": "fa-solid fa-wrench",
  "thresher": "fa-solid fa-tractor",
  "trali-trolley": "fa-solid fa-truck",
  "shield-panja": "fa-solid fa-shield-halved",
  "cultivator": "fa-solid fa-gear",
  "plough": "fa-solid fa-hammer",
  "sprayer": "fa-solid fa-spray-can",
  "irrigation": "fa-solid fa-droplet",
};
const fallbackIcon = "fa-solid fa-box";

/* ── Hero Banner ────────────────────────────────── */
function HeroBanner() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((p) => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);
  const slides = [
    { bg: "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)", badge: "Monsoon Sale", title: "Up to 20% OFF", sub: "On all cultivators, ploughs & tillers", cta: "Shop Cultivators", link: "/shop?category=cultivator", emoji: "tractor" },
  ]
  const s = slides[cur];
  return (
    <div className="hero-banner" style={{ background: s.bg }}>
      <div className="hero-bg-pattern"></div>
      <div className="hero-floating-circle hero-circle-1"></div>
      <div className="hero-floating-circle hero-circle-2"></div>
      <div className="hero-content">
        <span className="hero-badge">
          <Sparkles className="h-3 w-3" /> {s.badge}
        </span>
        <h1>{s.title}</h1>
        <p>{s.sub}</p>
        <div className="hero-actions">
          <Link to={s.link} className="hero-btn-primary">
            {s.cta} <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="tel:08989696971" className="hero-btn-secondary">
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>
      </div>
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} className={`hero-dot ${ i === cur ? "active" : "" }`} />
        ))}
      </div>
    </div>
  );
}

/* ── Side Promos ────────────────────────────────── */
function SidePromos() {
  return (
    <div className="side-promos">
      <div className="promo-card promo-red">
        <div className="promo-glow"></div>
        <i className="fa-solid fa-fire promo-icon"></i>
        <h3>Today's Deal</h3>
        <p>Save up to 30% on thresher machines</p>
        <Link to="/shop?category=thresher">Grab Deal <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="promo-card promo-purple">
        <div className="promo-glow"></div>
        <i className="fa-solid fa-percent promo-icon"></i>
        <h3>Flat 15% OFF</h3>
        <p>On tractor parts & accessories</p>
        <Link to="/shop?category=tractor-parts">Shop Now <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

/* ── Trust Strip ────────────────────────────────── */
function TrustStrip() {
  return (
    <div className="trust-strip">
      {[
        { icon: <Truck className="h-5 w-5" />, title: "Free Delivery", desc: "Orders above ₹5,000", color: "#16a34a" },
        { icon: <RotateCcw className="h-5 w-5" />, title: "30 Day Returns", desc: "Easy return policy", color: "#ea580c" },
        { icon: <Shield className="h-5 w-5" />, title: "Secure Payment", desc: "100% secure checkout", color: "#0284c7" },
        { icon: <Headphones className="h-5 w-5" />, title: "24/7 Support", desc: "We're here to help", color: "#7c3aed" },
      ].map((item, i) => (
        <div key={i} className="trust-item">
          <div className="trust-icon" style={{ background: `${ item.color }15`, color: item.color }}>
            {item.icon}
          </div>
          <div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Categories ─────────────────────────────────── */
function CategoriesSection() {
  const { data, isLoading } = useShopCategories();
  const categories = data?.categories || [];
  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Shop by Category</h2>
          <p className="section-subtitle">Find the right equipment for your farm</p>
        </div>
        <Link to="/shop" className="view-all">View All <ChevronRight className="h-3 w-3" /></Link>
      </div>
      {isLoading ? (
        <div className="categories-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="category-card skeleton">
              <div className="skeleton-circle"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/shop?category=${ cat.slug }`} className="category-card">
              <div className="category-icon-wrap">
                <div className="category-icon"><i className={categoryIcons[cat.slug] || fallbackIcon}></i></div>
              </div>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Offers ─────────────────────────────────────── */
function OffersSection() {
  return (
    <div className="offers-grid">
      <Link to="/shop?category=cultivator" className="offer-card offer-green">
        <div className="offer-icon-wrap"><i className="fa-solid fa-percent"></i></div>
        <div>
          <h3>Monsoon Sale</h3>
          <p>Up to 20% off on cultivators & ploughs</p>
          <span className="offer-link">Shop Cultivators <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
      <Link to="/shop" className="offer-card offer-orange">
        <div className="offer-icon-wrap"><i className="fa-solid fa-gift"></i></div>
        <div>
          <h3>Bulk Order Discount</h3>
          <p>Special pricing for 5+ units</p>
          <span className="offer-link">View Deals <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
      <Link to="/shop" className="offer-card offer-blue">
        <div className="offer-icon-wrap"><i className="fa-solid fa-truck-fast"></i></div>
        <div>
          <h3>Free Delivery</h3>
          <p>On orders above ₹5,000</p>
          <span className="offer-link">Shop Now <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
    </div>
  );
}

/* ── Product Card ───────────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="product-card">
      <Link to={`/shop/${ product.slug }`} className="product-image">
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
      </Link>
      <div className="product-info">
        {product.brandId?.name && <p className="product-brand">{product.brandId.name}</p>}
        <Link to={`/shop/${ product.slug }`} className="product-name">{product.name}</Link>
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`h-3 w-3 ${ i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300" }`} />
          ))}
          <span>({product.reviewCount || 0})</span>
        </div>
        <div className="product-price">
          <span className="current-price">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="original-price">{formatCurrency(product.mrp)}</span>}
        </div>
        <button className="add-to-cart-btn" onClick={() => onAddToCart?.(product._id)}>
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ── Product Slider ─────────────────────────────── */
function ProductSlider({ title, subtitle, linkTo, linkLabel, products, isLoading }) {
  const [index, setIndex] = useState(0);
  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4;
  const maxIndex = Math.max(0, products.length - visibleCount);

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div className="slider-controls">
          <Link to={linkTo} className="view-all">{linkLabel} <ChevronRight className="h-3 w-3" /></Link>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="slider-btn"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} className="slider-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {isLoading ? (
        <div className="em-products-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="product-card skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-info">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="slider-container">
          <div className="slider-track" style={{ transform: `translateX(-${ index * (100 / visibleCount) }%)` }}>
            {products.map((p) => (
              <div key={p._id} className="slider-item" style={{ width: `calc(${ 100 / visibleCount }% - 12px)` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-box-open"></i>
          <p>No products yet.</p>
        </div>
      )}
    </div>
  );
}

/* ── Why Choose Us ──────────────────────────────── */
function WhyChooseUs() {
  return (
    <div className="section">
      <div className="section-center">
        <h2>Why Choose Ambika Krishi Yantra?</h2>
        <p>Trusted by farmers across Madhya Pradesh</p>
      </div>
      <div className="features-grid">
        {[
          { icon: "fa-solid fa-industry", title: "Direct Manufacturer", desc: "No middlemen — buy directly from factory", color: "#16a34a" },
          { icon: "fa-solid fa-certificate", title: "Quality Assured", desc: "Every product tested for durability", color: "#0284c7" },
          { icon: "fa-solid fa-tags", title: "Wholesale Prices", desc: "Best rates guaranteed", color: "#ea580c" },
          { icon: "fa-solid fa-truck-fast", title: "Fast Delivery", desc: "Free on orders above ₹5,000", color: "#7c3aed" },
        ].map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon" style={{ background: `${ f.color }15`, color: f.color }}>
              <i className={f.icon}></i>
            </div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Bar ──────────────────────────────────── */
function StatsBar() {
  return (
    <div className="stats-bar">
      {[
        { num: "500+", label: "Happy Farmers", icon: "fa-solid fa-users" },
        { num: "50+", label: "Products", icon: "fa-solid fa-boxes-stacked" },
        { num: "15+", label: "Years Experience", icon: "fa-solid fa-calendar-check" },
        { num: "5.0", label: "Google Rating", icon: "fa-solid fa-star" },
      ].map((s, i) => (
        <div key={i} className="stat-item">
          <div className="stat-icon"><i className={s.icon}></i></div>
          <h4>{s.num}</h4>
          <p>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main Home ──────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuth();
  const addToCart = useAddToCart();
  const { data: bestSellersData, isLoading: loadingBest } = useBestSellers();
  const { data: newArrivalsData, isLoading: loadingNew } = useNewArrivals();
  const { data: allProductsData, isLoading: loadingAll } = useShopProducts({ limit: 20 });

  const bestSellers = bestSellersData?.products || [];
  const newArrivals = newArrivalsData?.products || [];
  const allProducts = allProductsData?.products || [];

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/customer/login");
      return;
    }
    addToCart.mutate({ productId, qty: 1 }, {
      onSuccess: () => toast.success("Added to cart"),
      onError: (err) => toast.error(err.message || "Failed to add to cart"),
    });
  };

  return (
    <div className="home-page">
      <div className="hero-row">
        <HeroBanner />
        <div className="hidden lg:block"><SidePromos /></div>
      </div>
      <TrustStrip />
      <CategoriesSection />
      <OffersSection />
      <ProductSlider
        title="Popular Products"
        subtitle="Most loved by our farmers"
        linkTo="/shop?sort=popular"
        linkLabel="View All"
        products={bestSellers}
        isLoading={loadingBest}
      />
      <ProductSlider
        title="All Products"
        subtitle="Browse our complete range"
        linkTo="/shop"
        linkLabel="View All"
        products={allProducts}
        isLoading={loadingAll}
      />
      <ProductSlider
        title="New Arrivals"
        subtitle="Latest additions to our collection"
        linkTo="/shop?sort=newest"
        linkLabel="View All"
        products={newArrivals}
        isLoading={loadingNew}
      />
      <WhyChooseUs />
      <StatsBar />
    </div>
  );
}
