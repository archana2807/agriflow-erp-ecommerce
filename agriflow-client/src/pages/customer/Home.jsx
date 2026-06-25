import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Phone, Star, Shield, Truck, Headphones, RotateCcw } from "lucide-react";
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

function HeroBanner() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((p) => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);
  const slides = [
    { bg: "#16a34a", badge: "Monsoon Sale", title: "Up to 20% OFF", sub: "On all cultivators, ploughs & tillers", cta: "Shop Cultivators", link: "/shop?category=cultivator" },
    { bg: "#ea580c", badge: "Bulk Deal", title: "Special Pricing", sub: "Buy 5+ units and save more", cta: "View Deals", link: "/shop" },
    { bg: "#0284c7", badge: "Free Delivery", title: "FREE Shipping", sub: "On all orders above ₹5,000", cta: "Shop Now", link: "/shop" },
  ];
  const s = slides[cur];
  return (
    <div className="hero-banner anim-fade-in" style={{ background: s.bg }}>
      <div className="hero-content anim-slide-left">
        <span className="hero-badge">{s.badge}</span>
        <h1>{s.title}</h1>
        <p>{s.sub}</p>
        <div className="hero-actions">
          <Link to={s.link} className="hero-btn-primary">{s.cta}</Link>
          <a href="tel:08989696971" className="hero-btn-secondary"><Phone className="h-4 w-4" /> Call Now</a>
        </div>
      </div>
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} className={`hero-dot ${i === cur ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

function SidePromos() {
  return (
    <div className="side-promos">
      <div className="promo-card promo-red anim-slide-right anim-delay-1">
        <i className="fa-solid fa-fire promo-icon"></i>
        <h3>Today's Deal</h3>
        <p>Save up to 30% on thresher machines</p>
        <Link to="/shop?category=thresher">Grab Deal →</Link>
      </div>
      <div className="promo-card promo-purple anim-slide-right anim-delay-2">
        <i className="fa-solid fa-percent promo-icon"></i>
        <h3>Flat 15% OFF</h3>
        <p>On tractor parts & accessories</p>
        <Link to="/shop?category=tractor-parts">Shop Now →</Link>
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="trust-strip">
      {[
        { icon: <Truck className="h-5 w-5" />, title: "Free Delivery", desc: "Orders above ₹5,000" },
        { icon: <RotateCcw className="h-5 w-5" />, title: "30 Day Returns", desc: "Easy return policy" },
        { icon: <Shield className="h-5 w-5" />, title: "Secure Payment", desc: "100% secure" },
        { icon: <Headphones className="h-5 w-5" />, title: "24/7 Support", desc: "We're here to help" },
      ].map((item, i) => (
        <div key={i} className="trust-item anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="trust-icon">{item.icon}</div>
          <div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoriesSection() {
  const { data, isLoading } = useShopCategories();
  const categories = data?.categories || [];
  return (
    <div className="section">
      <div className="section-header anim-fade-up">
        <h2>Shop by Category</h2>
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
          {categories.map((cat, i) => (
            <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="category-card anim-scale" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="category-icon"><i className={categoryIcons[cat.slug] || fallbackIcon}></i></div>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OffersSection() {
  const { data } = useShopCategories();
  const cats = data?.categories || [];
  const getC = (slug) => cats.find(c => c.slug === slug);
  return (
    <div className="offers-grid">
      <div className="offer-card offer-green anim-fade-up anim-delay-1">
        <i className="fa-solid fa-percent"></i>
        <div>
          <h3>Monsoon Sale</h3>
          <p>Up to 20% off on cultivators & ploughs</p>
          <Link to={`/shop?category=${getC("cultivator")?.slug || "cultivator"}`}>Shop Cultivators →</Link>
        </div>
      </div>
      <div className="offer-card offer-orange anim-fade-up anim-delay-2">
        <i className="fa-solid fa-gift"></i>
        <div>
          <h3>Bulk Order Discount</h3>
          <p>Special pricing for 5+ units</p>
          <Link to="/shop">View Deals →</Link>
        </div>
      </div>
      <div className="offer-card offer-blue anim-fade-up anim-delay-3">
        <i className="fa-solid fa-truck-fast"></i>
        <div>
          <h3>Free Delivery</h3>
          <p>On orders above ₹5,000</p>
          <Link to="/shop">Shop Now →</Link>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="product-card">
      <Link to={`/shop/${product.slug}`} className="product-image">
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
      </Link>
      <div className="product-info">
        <p className="product-brand">{product.brand?.name || product.brand}</p>
        <Link to={`/shop/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="product-rating">
          {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
          <span>({product.reviewCount || 0})</span>
        </div>
        <div className="product-price">
          <span className="current-price">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="original-price">{formatCurrency(product.mrp)}</span>}
        </div>
        <button className="add-to-cart-btn" onClick={() => onAddToCart?.(product._id)}>Add to Cart</button>
      </div>
    </div>
  );
}

function ProductSlider({ onAddToCart }) {
  const [index, setIndex] = useState(0);
  const { data, isLoading } = useBestSellers();
  const products = data?.products || [];
  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4;
  const maxIndex = Math.max(0, products.length - visibleCount);

  return (
    <div className="section">
      <div className="section-header anim-fade-up">
        <div>
          <h2>Popular Products</h2>
          <p className="section-subtitle">Most loved by our farmers</p>
        </div>
        <div className="slider-controls">
          <Link to="/shop?sort=popular" className="view-all">View All <ChevronRight className="h-3 w-3" /></Link>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="slider-btn"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} className="slider-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {isLoading ? (
        <div className="products-grid">
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
          <div className="slider-track" style={{ transform: `translateX(-${index * (100 / visibleCount)}%)` }}>
            {products.map((p) => (
              <div key={p._id} className="slider-item" style={{ width: `calc(${100 / visibleCount}% - 12px)` }}>
                <ProductCard product={p} onAddToCart={onAddToCart} />
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

function AllProductsSlider({ onAddToCart }) {
  const [index, setIndex] = useState(0);
  const { data, isLoading } = useShopProducts({ limit: 20 });
  const products = data?.products || [];
  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4;
  const maxIndex = Math.max(0, products.length - visibleCount);

  return (
    <div className="section">
      <div className="section-header anim-fade-up">
        <div>
          <h2>All Products</h2>
          <p className="section-subtitle">Browse our complete range</p>
        </div>
        <div className="slider-controls">
          <Link to="/shop" className="view-all">View All <ChevronRight className="h-3 w-3" /></Link>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="slider-btn"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} className="slider-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {isLoading ? (
        <div className="products-grid">
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
          <div className="slider-track" style={{ transform: `translateX(-${index * (100 / visibleCount)}%)` }}>
            {products.map((p) => (
              <div key={p._id} className="slider-item" style={{ width: `calc(${100 / visibleCount}% - 12px)` }}>
                <ProductCard product={p} onAddToCart={onAddToCart} />
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

function NewArrivalsSlider({ onAddToCart }) {
  const [index, setIndex] = useState(0);
  const { data, isLoading } = useNewArrivals();
  const products = data?.products || [];
  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4;
  const maxIndex = Math.max(0, products.length - visibleCount);

  return (
    <div className="section">
      <div className="section-header anim-fade-up">
        <div>
          <h2>New Arrivals</h2>
          <p className="section-subtitle">Latest additions to our collection</p>
        </div>
        <div className="slider-controls">
          <Link to="/shop?sort=newest" className="view-all">View All <ChevronRight className="h-3 w-3" /></Link>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="slider-btn"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} className="slider-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {isLoading ? (
        <div className="products-grid">
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
          <div className="slider-track" style={{ transform: `translateX(-${index * (100 / visibleCount)}%)` }}>
            {products.map((p) => (
              <div key={p._id} className="slider-item" style={{ width: `calc(${100 / visibleCount}% - 12px)` }}>
                <ProductCard product={p} onAddToCart={onAddToCart} />
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

function WhyChooseUs() {
  return (
    <div className="section">
      <div className="section-center anim-fade-up">
        <h2>Why Choose Ambika Krishi Yantra?</h2>
        <p>Trusted by farmers across Madhya Pradesh</p>
      </div>
      <div className="features-grid">
        {[
          { icon: "fa-solid fa-industry", title: "Direct Manufacturer", desc: "No middlemen — buy directly from factory" },
          { icon: "fa-solid fa-certificate", title: "Quality Assured", desc: "Every product tested for durability" },
          { icon: "fa-solid fa-tags", title: "Wholesale Prices", desc: "Best rates guaranteed" },
          { icon: "fa-solid fa-truck-fast", title: "Fast Delivery", desc: "Free on orders above ₹5,000" },
        ].map((f, i) => (
          <div key={i} className="feature-card anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="feature-icon"><i className={f.icon}></i></div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="stats-bar">
      {[
        { num: "500+", label: "Happy Farmers", icon: "fa-solid fa-users" },
        { num: "50+", label: "Products", icon: "fa-solid fa-boxes-stacked" },
        { num: "15+", label: "Years Experience", icon: "fa-solid fa-calendar-check" },
        { num: "5.0", label: "Google Rating", icon: "fa-solid fa-star" },
      ].map((s, i) => (
        <div key={i} className="stat-item anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <i className={s.icon}></i>
          <h4>{s.num}</h4>
          <p>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuth();
  const addToCart = useAddToCart();

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
      <ProductSlider onAddToCart={handleAddToCart} />
      <AllProductsSlider onAddToCart={handleAddToCart} />
      <NewArrivalsSlider onAddToCart={handleAddToCart} />
      <WhyChooseUs />
      <StatsBar />
    </div>
  );
}
