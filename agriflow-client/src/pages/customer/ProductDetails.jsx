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
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Phone,
  BadgeIndianRupee,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  useShopProduct,
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/useQueries";

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
      { productId: product._id, qty: quantity },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: () => toast.error("Failed to add to cart"),
      }
    );
  };

  const handleToggleWishlist = () => {
    if (!product) return;
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

  if (loading) return <ProductDetailsSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button asChild className="mt-4">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const discount =
    product.mrp && product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-green-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-green-700">Shop</Link>
        {product.categoryId && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              to={`/shop?category=${product.categoryId?.slug || product.categoryId}`}
              className="hover:text-green-700"
            >
              {product.categoryId?.name || product.categoryId}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-contain p-4"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                    selectedImage === i ? "border-green-600 ring-2 ring-green-200" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-5">
          <div>
            {product.brandId && (
              <p className="text-sm text-green-700 font-semibold uppercase tracking-wide mb-1">
                {product.brandId?.name || product.brandId}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.avgRating || product.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-700">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                  <Badge className="bg-red-500 hover:bg-red-600">{discount}% OFF</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes (GST included)</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">In Stock</span>
                {product.stock <= 10 && (
                  <span className="text-sm text-orange-600 font-medium">
                    (Only {product.stock} left!)
                  </span>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border-2 border-green-200 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-green-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-green-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 bg-green-700 hover:bg-green-800 font-semibold"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-200 hover:bg-green-50"
            onClick={handleToggleWishlist}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          >
            <Heart
              className={`h-5 w-5 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
            {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>

          {/* Contact for Bulk */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-4">
              <Phone className="h-8 w-8 text-green-700 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Need Bulk Order?</p>
                <p className="text-xs text-gray-600">Call us for special pricing on bulk orders</p>
              </div>
              <a href="tel:08989696971">
                <Button size="sm" className="bg-green-700 hover:bg-green-800">
                  Call Now
                </Button>
              </a>
            </CardContent>
          </Card>

          <Separator />

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-green-700" />
              </div>
              <span className="text-xs font-semibold text-gray-900">Free Delivery</span>
              <span className="text-[10px] text-muted-foreground">On orders above ₹5,000</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-700" />
              </div>
              <span className="text-xs font-semibold text-gray-900">Quality Assured</span>
              <span className="text-[10px] text-muted-foreground">Manufacturer warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <BadgeIndianRupee className="h-5 w-5 text-green-700" />
              </div>
              <span className="text-xs font-semibold text-gray-900">Best Price</span>
              <span className="text-[10px] text-muted-foreground">Factory direct rates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="bg-green-50">
            <TabsTrigger value="description" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
              Description
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
              Reviews ({product.reviews?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {product.description || "No description available."}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            {product.reviews?.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="border border-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">
                        {review.user?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
