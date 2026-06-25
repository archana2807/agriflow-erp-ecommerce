import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer({ open, onClose, cartItems = [], total = 0, onRemove }) {
  if (!open) return null;

  return (
    <>
      <div className="em-overlay" onClick={onClose}></div>
      <div className="em-drawer open">
        <div className="em-drawer-header">
          <h2>
            <i className="fa-solid fa-shopping-cart" style={{ color: "var(--em-green)" }}></i> Cart
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="em-drawer-body">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-shopping-cart text-4xl" style={{ color: "#d1fae5" }}></i>
              <p className="mt-3 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="em-cart-item">
                  <img
                    src={item.product?.images?.[0] || "/placeholder.png"}
                    alt={item.product?.name}
                  />
                  <div>
                    <h4>{item.product?.name}</h4>
                    <p>{formatCurrency(item.product?.price)} × {item.qty}</p>
                  </div>
                  <button onClick={() => onRemove?.(item.product?._id)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="em-drawer-footer">
            <div className="flex justify-between items-center mb-3">
              <span>Subtotal</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <Link to="/cart" className="em-btn em-btn-green w-full block text-center">
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
