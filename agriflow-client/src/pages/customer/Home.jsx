import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Phone,
  Star,
  Shield,
  Truck,
  Headphones,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Wrench,
  Tractor,
  Settings,
  Hammer,
  Droplets,
  Box,
  Flame,
  Percent,
  Gift,
  Truck as TruckIcon,
  Users,
  Package,
  Calendar,
  Award,
  Factory,
  Tag,
  ShoppingCart,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useShopProducts, useShopCategories, useBestSellers, useNewArrivals, useAddToCart } from "@/hooks/useQueries";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import ProductImage from "@/components/common/ProductImage";

const categoryIcons = {
  "tractor-parts": Wrench,
  "thresher": Tractor,
  "trali-trolley": Truck,
  "shield-panja": Shield,
  "cultivator": Settings,
  "plough": Hammer,
  "sprayer": Droplets,
  "irrigation": Droplets,
};
const fallbackIcon = Box;

const heroSlides = [
  { bg: "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)", badge: "Monsoon Sale", title: "Up to 20% OFF", sub: "On all cultivators, ploughs & tillers", cta: "Shop Cultivators", link: "/shop?category=cultivator" },
];

/* ── Hero Banner ────────────────────────────────── */
function HeroBanner() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = heroSlides[cur];
  return (
    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-white min-h-[300px] flex flex-col justify-center flex-1 shadow-lg shadow-green-600/20" style={{ background: s.bg }}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full mb-4">
          <Sparkles className="h-3 w-3" /> {s.badge}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">{s.title}</h1>
        <p className="text-white/80 text-lg mb-6">{s.sub}</p>
        <div className="flex flex-wrap gap-3">
          <Link to={s.link} className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30">
            {s.cta} <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="tel:08989696971" className="inline-flex items-center gap-2 border border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} className={`w-2 h-2 rounded-full transition ${ i === cur ? "bg-white" : "bg-white/30 hover:bg-white/50" }`} />
        ))}
      </div>
    </div>
  );
}

/* ── Side Promos ────────────────────────────────── */
function SidePromos() {
  return (
    <div className="hidden lg:flex flex-col gap-4 w-72">
      <div className="relative rounded-xl p-6 text-white overflow-hidden bg-gradient-to-br from-red-500 to-red-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <Flame className="w-8 h-8 mb-3" />
        <h3 className="font-bold text-lg">Today's Deal</h3>
        <p className="text-sm text-white/80 mt-1">Save up to 30% on thresher machines</p>
        <Link to="/shop?category=thresher" className="inline-flex items-center gap-1 text-sm font-semibold mt-3 hover:underline">Grab Deal <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="relative rounded-xl p-6 text-white overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <Percent className="w-8 h-8 mb-3" />
        <h3 className="font-bold text-lg">Flat 15% OFF</h3>
        <p className="text-sm text-white/80 mt-1">On tractor parts & accessories</p>
        <Link to="/shop?category=tractor-parts" className="inline-flex items-center gap-1 text-sm font-semibold mt-3 hover:underline">Shop Now <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

/* ── Trust Strip ────────────────────────────────── */
function TrustStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {[
        { icon: <Truck className="h-5 w-5" />, title: "Free Delivery", desc: "Orders above ₹5,000", color: "#16a34a" },
        { icon: <RotateCcw className="h-5 w-5" />, title: "30 Day Returns", desc: "Easy return policy", color: "#ea580c" },
        { icon: <Shield className="h-5 w-5" />, title: "Secure Payment", desc: "100% secure checkout", color: "#0284c7" },
        { icon: <Headphones className="h-5 w-5" />, title: "24/7 Support", desc: "We're here to help", color: "#7c3aed" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-2" style={{ borderLeftColor: item.color }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
            {item.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.desc}</p>
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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Find the right equipment for your farm</p>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition border-b border-transparent hover:border-green-600 transition-colors">View All <ChevronRight className="h-3 w-3" /></Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-2 sm:p-3 animate-pulse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || fallbackIcon;
            return (
              <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center ring-1 ring-gray-100">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-700 text-center font-medium leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Offers ─────────────────────────────────────── */
function OffersSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Link to="/shop?category=cultivator" className="flex items-center gap-4 p-6 rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 transition hover:scale-[1.02] shadow-md hover:shadow-lg ring-1 ring-white/20">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">Monsoon Sale</h3>
          <p className="text-sm text-white/80 mt-1">Up to 20% off on cultivators & ploughs</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold mt-2">Shop Cultivators <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
      <Link to="/shop" className="flex items-center gap-4 p-6 rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 transition hover:scale-[1.02] shadow-md hover:shadow-lg ring-1 ring-white/20">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">Bulk Order Discount</h3>
          <p className="text-sm text-white/80 mt-1">Special pricing for 5+ units</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold mt-2">View Deals <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
      <Link to="/shop" className="flex items-center gap-4 p-6 rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 transition hover:scale-[1.02] shadow-md hover:shadow-lg ring-1 ring-white/20">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <TruckIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">Free Delivery</h3>
          <p className="text-sm text-white/80 mt-1">On orders above ₹5,000</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold mt-2">Shop Now <ArrowRight className="h-3 w-3" /></span>
        </div>
      </Link>
    </div>
  );
}

/* ── Product Card ───────────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="group relative rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100/50">
      <Link to={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {discount > 0 && <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">-{discount}%</span>}
        <ProductImage src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </Link>
      <div className="p-4">
        {product.brandId?.name && <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brandId.name}</p>}
        <Link to={`/shop/${product.slug}`} className="text-sm font-medium text-gray-900 hover:text-green-600 transition line-clamp-2">{product.name}</Link>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`h-3 w-3 ${ i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300" }`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {product.mrp > product.price && <span className="text-sm text-gray-400 line-through">{formatCurrency(product.mrp)}</span>}
        </div>
        <button className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2" onClick={(e) => { e.preventDefault(); onAddToCart?.(product._id); }}>
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ── Product Slider ─────────────────────────────── */
function ProductSlider({ title, subtitle, linkTo, linkLabel, products, isLoading, onAddToCart }) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisible = () => setVisibleCount(window.innerWidth < 768 ? 2 : 4);
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link to={linkTo} className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition border-b border-transparent hover:border-green-600 transition-colors">{linkLabel} <ChevronRight className="h-3 w-3" /></Link>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="overflow-hidden">
          <div className="flex gap-3 transition-transform duration-300" style={{ transform: `translateX(-${index * (100 / visibleCount)}%)` }}>
            {products.map((p) => (
              <div key={p._id} className="flex-shrink-0" style={{ width: `calc(${100 / visibleCount}% - 12px)` }}>
                <ProductCard product={p} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <PackageOpen className="w-12 h-12 mb-3" />
          <p>No products yet.</p>
        </div>
      )}
    </div>
  );
}

/* ── Why Choose Us ──────────────────────────────── */
function WhyChooseUs() {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Why Choose Ambika Krishi Yantra?</h2>
        <p className="text-sm text-gray-500 mt-1">Trusted by farmers across Madhya Pradesh</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <Factory className="w-6 h-6" />, title: "Direct Manufacturer", desc: "No middlemen — buy directly from factory", color: "#16a34a" },
          { icon: <Award className="w-6 h-6" />, title: "Quality Assured", desc: "Every product tested for durability", color: "#0284c7" },
          { icon: <Tag className="w-6 h-6" />, title: "Wholesale Prices", desc: "Best rates guaranteed", color: "#ea580c" },
          { icon: <TruckIcon className="w-6 h-6" />, title: "Fast Delivery", desc: "Free on orders above ₹5,000", color: "#7c3aed" },
        ].map((f, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-sm text-center hover:shadow-md transition-all hover:-translate-y-1 border-t-2" style={{ borderTopColor: f.color }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${f.color}15`, color: f.color }}>
              {f.icon}
            </div>
            <h4 className="font-semibold text-gray-900">{f.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Bar ──────────────────────────────────── */
function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-green-600 text-white rounded-2xl p-6 mt-8 shadow-xl shadow-green-600/30">
      {[
        { num: "500+", label: "Happy Farmers", icon: <Users className="w-6 h-6" /> },
        { num: "50+", label: "Products", icon: <Package className="w-6 h-6" /> },
        { num: "15+", label: "Years Experience", icon: <Calendar className="w-6 h-6" /> },
        { num: "5.0", label: "Google Rating", icon: <Star className="w-6 h-6" /> },
      ].map((s, i) => (
        <div key={i} className={`text-center ${i < 3 ? 'border-r border-white/20' : ''}`}>
          <div className="flex justify-center mb-2">{s.icon}</div>
          <h4 className="text-2xl font-bold">{s.num}</h4>
          <p className="text-sm text-white/80">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main Home ──────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useCustomerAuth();
  const { data: bestSellersData, isLoading: loadingBest } = useBestSellers();
  const { data: newArrivalsData, isLoading: loadingNew } = useNewArrivals();
  const { data: allProductsData, isLoading: loadingAll } = useShopProducts({ limit: 20 });
  const addToCart = useAddToCart();

  const bestSellers = bestSellersData?.products || [];
  const newArrivals = newArrivalsData?.products || [];
  const allProducts = allProductsData?.products || [];

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    addToCart.mutate(
      { productId, quantity: 1 },
      { onSuccess: () => toast.success("Added to cart"), onError: () => toast.error("Failed to add to cart") }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-4 mb-8">
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
        onAddToCart={handleAddToCart}
      />
      <ProductSlider
        title="All Products"
        subtitle="Browse our complete range"
        linkTo="/shop"
        linkLabel="View All"
        products={allProducts}
        isLoading={loadingAll}
        onAddToCart={handleAddToCart}
      />
      <ProductSlider
        title="New Arrivals"
        subtitle="Latest additions to our collection"
        linkTo="/shop?sort=newest"
        linkLabel="View All"
        products={newArrivals}
        isLoading={loadingNew}
        onAddToCart={handleAddToCart}
      />
      <WhyChooseUs />
      <StatsBar />
    </div>
  );
}
