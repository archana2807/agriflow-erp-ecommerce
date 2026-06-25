import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import shopService from "@/services/shop.service";

// ==================== ADMIN HOOKS ====================

// Dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => adminService.dashboard.getStats(),
  });
}

// Customers
export function useCustomers(params) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => adminService.customers.getAll(params),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.customers.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.customers.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.customers.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// Categories
export function useCategories(params) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => adminService.categories.getAll(params),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.categories.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.categories.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.categories.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// Brands
export function useBrands(params) {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => adminService.brands.getAll(params),
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.brands.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.brands.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.brands.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

// Products
export function useProducts(params) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminService.products.getAll(params),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.products.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.products.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.products.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });
}

// Orders
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.orders.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminService.orders.getAll(),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => adminService.orders.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.orders.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

// Invoices
export function useInvoices(params) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => adminService.invoices.getAll(params),
  });
}

export function useInvoiceByOrder(orderId) {
  return useQuery({
    queryKey: ["invoice-by-order", orderId],
    queryFn: () => adminService.invoices.getByOrder(orderId),
    enabled: !!orderId,
  });
}

// Payments
export function usePayments(params) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => adminService.payments.getAll(params),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.payments.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}

export function usePaymentsByInvoice(invoiceId) {
  return useQuery({
    queryKey: ["payments-by-invoice", invoiceId],
    queryFn: () => adminService.payments.getByInvoice(invoiceId),
    enabled: !!invoiceId,
  });
}

// Coupons
export function useCoupons(params) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: () => adminService.coupons.getAll(params),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.coupons.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.coupons.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.coupons.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

// Banners
export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => adminService.banners.getAll(),
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminService.banners.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.banners.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.banners.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

// ==================== SHOP HOOKS ====================

export function useShopProducts(params) {
  return useQuery({
    queryKey: ["shop-products", params],
    queryFn: () => shopService.getProducts(params),
  });
}

export function useShopProduct(slug) {
  return useQuery({
    queryKey: ["shop-product", slug],
    queryFn: () => shopService.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useShopCategories() {
  return useQuery({
    queryKey: ["shop-categories"],
    queryFn: () => shopService.getCategories(),
  });
}

export function useShopBrands() {
  return useQuery({
    queryKey: ["shop-brands"],
    queryFn: () => shopService.getBrands(),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: () => shopService.getFeatured(),
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => shopService.getNewArrivals(),
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => shopService.getBestSellers(),
  });
}

// Cart
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => shopService.getCart(),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, qty }) => shopService.addToCart(productId, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, qty }) => shopService.updateCart(productId, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => shopService.removeFromCart(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shopService.clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

// Wishlist
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => shopService.getWishlist(),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => shopService.addToWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => shopService.removeFromWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// Addresses
export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => shopService.getAddresses(),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => shopService.createAddress(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => shopService.updateAddress(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => shopService.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

// Checkout
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => shopService.checkout(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

// My Orders
export function useMyOrders(params) {
  return useQuery({
    queryKey: ["my-orders", params],
    queryFn: () => shopService.getMyOrders(params),
  });
}

export function useMyOrder(id) {
  return useQuery({
    queryKey: ["my-order", id],
    queryFn: () => shopService.getMyOrderById(id),
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => shopService.cancelOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-orders"] }),
  });
}
