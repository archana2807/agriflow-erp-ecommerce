import { Link } from "react-router-dom";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ProductImage from "@/components/common/ProductImage";

export default function CartDrawer({ open, onClose, cartItems = [], total = 0, onRemove }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 max-w-[calc(100vw-2rem)] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-green-600 text-white shrink-0">
          <h2 className="flex items-center gap-2 text-base font-semibold m-0">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4 ring-4 ring-green-100">
                <ShoppingCart className="h-8 w-8 text-green-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Your cart is empty</p>
              <p className="text-xs text-gray-500">Add items to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item._id || item.productId?._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <ProductImage
                    src={item.productId?.images?.[0]?.url || item.productId?.images?.[0]}
                    alt={item.productId?.name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate m-0">{item.productId?.name}</h4>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => onRemove?.(item.productId?._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <strong className="text-lg font-bold text-gray-900">{formatCurrency(total)}</strong>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center w-full py-2.5 rounded-lg border-2 border-green-600 text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors mb-2 no-underline"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={onClose}
              className="flex items-center justify-center w-full py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 no-underline"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
      `}</style>
    </>
  );
}
