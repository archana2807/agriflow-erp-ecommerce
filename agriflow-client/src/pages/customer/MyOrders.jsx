import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, XCircle, Eye, Truck, CheckCircle, Clock, ShoppingBag, ChevronLeft, ChevronRight, Calendar, Hash, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMyOrders, useMyOrder, useCancelOrder } from "@/hooks/useQueries";
import ProductImage from "@/components/common/ProductImage";

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="bg-gray-200 rounded animate-pulse h-4 w-24" />
        <div className="bg-gray-200 rounded animate-pulse h-5 w-20" />
      </div>
      <div className="bg-gray-200 rounded animate-pulse h-4 w-48 mb-2" />
      <div className="bg-gray-200 rounded animate-pulse h-4 w-24" />
    </div>
  );
}

export default function MyOrders() {
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: ordersData, isLoading: loading } = useMyOrders({ page, limit: 10 });
  const { data: orderDetailData, isLoading: detailLoading } = useMyOrder(selectedOrderId);
  const cancelOrder = useCancelOrder();

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.totalPages || 1;
  const selectedOrder = orderDetailData?.order || orderDetailData;

  const handleCancelOrder = (orderId) => {
    cancelOrder.mutate(orderId, {
      onSuccess: () => { toast.success("Order cancelled successfully"); setSelectedOrderId(null); },
      onError: () => toast.error("Failed to cancel order"),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">My Orders</h1>
            <p className="text-green-100 text-sm">{loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500 mb-4">Start shopping to see your orders here.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.status || "PENDING";
                const StatusIcon = statusIcons[status] || Clock;
                const itemCount = order.items?.length || order.itemCount || 0;
                return (
                  <div key={order._id} className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Hash className="h-4 w-4" />
                        <span>{order.orderNo || order._id?.slice(-8).toUpperCase()}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(order.createdAt)}</span>
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.total || order.grandTotal || 0)}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>{order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition" onClick={() => setSelectedOrderId(order._id)}>
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      {order.status === "PENDING" && (
                        <button className="inline-flex items-center gap-1.5 bg-red-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-600 shadow-sm hover:shadow-md transition disabled:opacity-50" onClick={() => handleCancelOrder(order._id)} disabled={cancelOrder.isPending}>
                          {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                      return (
                        <button key={p} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${p === page ? "bg-green-600 text-white" : "hover:bg-gray-100"}`} onClick={() => setPage(p)}>
                          {p}
                        </button>
                      );
                    }
                    if (Math.abs(p - page) === 3) return <span key={p} className="px-1 text-gray-400">...</span>;
                    return null;
                  })}
                </div>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrderId(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-t-4 border-green-600" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setSelectedOrderId(null)}>
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-4 space-y-3">
                <div className="bg-gray-200 rounded animate-pulse h-4 w-full" />
                <div className="bg-gray-200 rounded animate-pulse h-4 w-48" />
                <div className="bg-gray-200 rounded animate-pulse h-4 w-32" />
              </div>
            ) : selectedOrder ? (
              <div className="p-4">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">#{selectedOrder.orderNo || selectedOrder._id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">Date</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[selectedOrder.status]}`}>
                    {(() => { const Ic = statusIcons[selectedOrder.status]; return Ic ? <Ic className="h-3 w-3" /> : null; })()}
                    {selectedOrder.status?.charAt(0) + selectedOrder.status?.slice(1).toLowerCase()}
                  </span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-500">Delivery Address</span>
                    <span className="text-right max-w-[60%]">{selectedOrder.deliveryAddress.name}, {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}</span>
                  </div>
                )}
                <div className="border-t my-4" />
                <div className="divide-y">
                  {(selectedOrder.items || []).map((item) => {
                    const product = item.productId || item.product || {};
                    return (
                      <div key={product._id || item._id} className="flex items-center gap-3 py-3">
                        <ProductImage src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium text-sm truncate">{product.name}</span>
                          <span className="block text-xs text-gray-500">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-medium text-sm">{formatCurrency((item.price || 0) * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total || selectedOrder.grandTotal || 0)}</span>
                </div>
                {selectedOrder.status === "PENDING" && (
                  <div className="mt-4 pt-4 border-t">
                    <button className="w-full bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 transition disabled:opacity-50" onClick={() => handleCancelOrder(selectedOrder._id)} disabled={cancelOrder.isPending}>
                      {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
