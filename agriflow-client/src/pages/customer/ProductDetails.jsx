import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  ChevronRight,
  Phone,
  BadgeIndianRupee,
  Package,
  Share2,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import {
  useShopProduct,
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/useQueries";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import ProductImage from "@/components/common/ProductImage";

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageZoomed, setImageZoomed] = useState(false);

  const { data: productData, isLoading: loading } = useShopProduct(slug);
  const { user } = useCustomerAuth();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const product = productData?.product || null;
  const isWishlisted = product?.isWishlisted || false;

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/customer/login");
      return;
    }
    addToCart.mutate(
      { productId: product._id, quantity },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: () => toast.error("Failed to add to cart"),
      }
    );
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to use wishlist");
      navigate("/customer/login");
      return;
    }
    if (isWishlisted) {
      removeFromWishlist.mutate(product._id, {
        onSuccess: () => toast.success("Removed from wishlist"),
        onError: () => toast.error("Failed to update wishlist"),
      });
    } else {
      addToWishlist.mutate(product._id, {
        onSuccess: () => toast.success("Added to wishlist"),
        onError: () => toast.error("Failed to update wishlist"),
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading) return <ProductDetailsSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const discount =
    product.mrp && product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const images = product.images?.length > 0
    ? product.images.map((img) => getImageUrl(img?.url || img))
    : ["https://placehold.co/400x400?text=No+Image&font=roboto"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <Link to="/shop" className="hover:text-green-600 transition-colors">Shop</Link>
        {product.categoryId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <Link
              to={`/shop?category=${product.categoryId?.slug || product.categoryId}`}
              className="hover:text-green-600 transition-colors"
            >
              {product.categoryId?.name || product.categoryId}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Images Section */}
        <div className="space-y-4">
          <div
            className="relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 group cursor-zoom-in"
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            <ProductImage
              src={images[selectedImage]}
              alt={product.name}
              className={`w-full aspect-square object-contain p-6 transition-transform duration-300 ${
                imageZoomed ? "scale-150" : "group-hover:scale-105"
              }`}
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm font-semibold shadow-sm">
                {discount}% OFF
              </Badge>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setImageZoomed(!imageZoomed); }}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImage(i); setImageZoomed(false); }}
                  className={`shrink-0 w-20 h-20 border-2 rounded-xl overflow-hidden transition-all ${
                    selectedImage === i
                      ? "border-green-600 ring-2 ring-green-100 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ProductImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          {/* Brand & Actions */}
          <div className="flex items-start justify-between">
            <div>
              {product.brandId && (
                <p className="text-sm text-green-700 font-semibold uppercase tracking-wider mb-1.5">
                  {product.brandId?.name || product.brandId}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.avgRating || product.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.avgRating || product.rating || 0}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {product.reviewCount || product.reviews?.length || 0} reviews
            </span>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-green-700">
                {formatCurrency(product.sellingPrice || product.price)}
              </span>
              {(product.mrp > product.price || product.mrp > (product.sellingPrice || product.price)) && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Inclusive of all taxes (GST included)</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2.5">
            {product.stock > 0 ? (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-700 font-semibold text-sm">In Stock</span>
                {product.stock <= 10 && (
                  <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    Only {product.stock} left - order soon!
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">{product.stock} {product.unit || "units"} available</span>
              </>
            ) : (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
              </>
            )}
          </div>

          <Separator className="bg-gray-100" />

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-11 w-12 flex items-center justify-center font-semibold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  = {formatCurrency((product.sellingPrice || product.price) * quantity)}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full h-14 bg-green-600 hover:bg-green-700 font-semibold text-base rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          {/* Contact for Bulk */}
          <Card className="border-green-100 bg-gradient-to-r from-green-50/50 to-transparent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">Need Bulk Order?</p>
                <p className="text-xs text-gray-500">Call us for special pricing on bulk orders</p>
              </div>
              <a href="tel:08989696971" className="shrink-0">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-lg">
                  Call Now
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders above ₹5,000" },
              { icon: Shield, label: "Quality Assured", sub: "Manufacturer warranty" },
              { icon: BadgeIndianRupee, label: "Best Price", sub: "Factory direct rates" },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="h-5 w-5 text-green-700" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="bg-gray-100/80 p-1 h-auto rounded-xl">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              Reviews ({product.reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="prose prose-green max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "SKU", value: product.sku },
                    { label: "Category", value: product.categoryId?.name },
                    { label: "Brand", value: product.brandId?.name },
                    { label: "Unit", value: product.unit },
                    { label: "Stock", value: product.stock > 0 ? `${product.stock} units` : "Out of stock" },
                    { label: "GST", value: product.gstPercent ? `${product.gstPercent}%` : null },
                  ].filter((s) => s.value).map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500">{spec.label}</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                            {(review.user?.name || "A")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.user?.name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric", month: "short", day: "numeric"
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-7 w-7 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
