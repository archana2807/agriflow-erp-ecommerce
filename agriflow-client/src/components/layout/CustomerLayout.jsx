import { useState } from "react";
import { Outlet } from "react-router-dom";
import CustomerNavbar from "@/components/layout/CustomerNavbar";
import CustomerFooter from "@/components/layout/CustomerFooter";
import CartDrawer from "@/components/common/CartDrawer";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import { useCart, useRemoveFromCart } from "@/hooks/useQueries";

export default function CustomerLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { data } = useCart();
  const removeMutation = useRemoveFromCart();

  const cartItems = data?.cart?.items || [];
  const total = data?.cart?.grandTotal || 0;

  const handleRemove = (productId) => {
    removeMutation.mutate(productId);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNavbar onCartClick={() => setCartOpen(true)} />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <CustomerFooter />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        total={total}
        onRemove={handleRemove}
      />
      <MobileBottomNav />
    </div>
  );
}
