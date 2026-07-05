import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useWishlist, useRemoveFromWishlist, useAddToCart } from "@/hooks/useQueries";

function WishlistSkeleton() {
  return (
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
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <Heart className="h-6 w-6" />
            <div>
              <h1>My Wishlist</h1>
              <p>{loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}</p>
            </div>
          </div>
          <Link to="/shop" className="page-hero-btn">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="pt-6">
        {loading ? (
          <WishlistSkeleton />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Heart className="h-12 w-12" />
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon on any product to save it here for later.</p>
            <Link to="/shop" className="empty-state-btn">
              <ShoppingBag className="h-4 w-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((item) => {
              const product = item.productId || item;
              const productId = product._id;
              const discount = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
              return (
                <div key={item._id || productId} className="product-card">
                  <div className="card-actions">
                    <button className="wish-btn active" onClick={() => handleRemove(productId)} disabled={removeFromWishlist.isPending}>
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
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
                    <div className="wishlist-card-btns">
                      <button className="add-to-cart-btn" onClick={() => handleAddToCart(productId)} disabled={addToCart.isPending}>
                        <ShoppingCart className="h-4 w-4" /> {addToCart.isPending ? "Adding..." : "Add to Cart"}
                      </button>
                      <button className="wishlist-remove-btn" onClick={() => handleRemove(productId)} disabled={removeFromWishlist.isPending}>
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
