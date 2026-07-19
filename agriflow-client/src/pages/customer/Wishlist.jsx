import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useWishlist, useRemoveFromWishlist, useAddToCart } from "@/hooks/useQueries";
import ProductImage from "@/components/common/ProductImage";

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm animate-pulse">
          <div className="aspect-square w-full bg-gray-200"></div>
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Wishlist() {
  const { data: wishlistData, isLoading: loading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const items = wishlistData?.wishlist || [];

  const handleRemove = (productId) => {
    removeFromWishlist.mutate(productId, { onSuccess: () => toast.success("Removed from wishlist"), onError: () => toast.error("Failed") });
  };
  const handleAddToCart = (productId) => {
    addToCart.mutate({ productId, quantity: 1 }, { onSuccess: () => toast.success("Added to cart"), onError: () => toast.error("Failed") });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">My Wishlist</h1>
              <p className="text-green-100 text-sm">{loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}</p>
            </div>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="pt-6">
        {loading ? (
          <WishlistSkeleton />
        ) : items.length === 0 ? (
          <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-gray-100">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Your wishlist is empty</h3>
            <p className="text-gray-500 mt-1">Tap the heart icon on any product to save it here for later.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              <ShoppingBag className="h-4 w-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const product = item.productId || item;
              const productId = product._id;
              const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
              return (
                <div key={item._id || productId} className="relative group rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                  <div className="relative">
                    <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center z-10" onClick={() => handleRemove(productId)} disabled={removeFromWishlist.isPending}>
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                    <Link to={`/shop/${product.slug}`} className="block relative">
                      {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">-{discount}%</span>}
                      <ProductImage className="aspect-square w-full object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300" src={product.images?.[0]} alt={product.name} />
                    </Link>
                  </div>
                  <div className="p-3 space-y-1">
                    {product.brandId?.name && <p className="text-xs text-gray-500">{product.brandId.name}</p>}
                    <Link to={`/shop/${product.slug}`} className="block font-medium text-gray-800 hover:text-green-600 line-clamp-2 text-sm">{product.name}</Link>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                      {product.mrp > product.price && <span className="text-sm text-gray-400 line-through">{formatCurrency(product.mrp)}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2" onClick={() => handleAddToCart(productId)} disabled={addToCart.isPending}>
                        <ShoppingCart className="h-4 w-4" /> {addToCart.isPending ? "Adding..." : "Add to Cart"}
                      </button>
                      <button className="py-2 px-3 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition" onClick={() => handleRemove(productId)} disabled={removeFromWishlist.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
