import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  useWishlist,
  useRemoveFromWishlist,
  useAddToCart,
} from "@/hooks/useQueries";

function WishlistCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Wishlist() {
  const { data: wishlistData, isLoading: loading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const items = wishlistData?.wishlist || [];

  const handleRemove = (productId) => {
    removeFromWishlist.mutate(productId, {
      onSuccess: () => toast.success("Removed from wishlist"),
      onError: () => toast.error("Failed to remove from wishlist"),
    });
  };

  const handleAddToCart = (productId) => {
    addToCart.mutate(
      { productId, qty: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: () => toast.error("Failed to add to cart"),
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <WishlistCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Save items you love to your wishlist.
          </p>
          <Button asChild>
            <Link to="/shop">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product || item;
            const productId = product._id || product.productId;
            const discount =
              product.mrp && product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

            return (
              <Card key={item._id || productId} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/shop/${product.slug}`} className="block">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(productId);
                      }}
                      disabled={removeFromWishlist.isPending}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.mrp)}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full mt-3"
                    size="sm"
                    onClick={() => handleAddToCart(productId)}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
