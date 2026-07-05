import { Link } from "react-router-dom";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer({ open, onClose, cartItems = [], total = 0, onRemove }) {
  if (!open) return null;

  return (
    <>
      <div className="em-overlay" onClick={onClose}></div>
      <div className="em-drawer open">
        <div className="em-drawer-header">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartItems.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{cartItems.length}</span>
            )}
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="em-drawer-body">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-green-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Your cart is empty</p>
              <p className="text-xs text-gray-500">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item._id || item.productId?._id} className="em-cart-item">
                  <img
                    src={item.productId?.images?.[0]?.url || item.productId?.images?.[0] || "/placeholder.png"}
                    alt={item.productId?.name}
                  />
                  <div className="min-w-0 flex-1">
                    <h4>{item.productId?.name}</h4>
                    <p>{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => onRemove?.(item.productId?._id)}
                    className="hover:text-red-500 hover:bg-red-50"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="em-drawer-footer">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <strong className="text-lg font-bold text-gray-900">{formatCurrency(total)}</strong>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center w-full py-2.5 rounded-lg border-2 border-green-600 text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors mb-2"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={onClose}
              className="flex items-center justify-center w-full py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
