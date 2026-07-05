import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, XCircle, Eye, Truck, CheckCircle, Clock, ShoppingBag, ChevronLeft, ChevronRight, Calendar, Hash, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMyOrders, useMyOrder, useCancelOrder } from "@/hooks/useQueries";

const statusConfig = {
  PENDING: { label: "Pending", color: "status-yellow", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "status-blue", icon: CheckCircle },
  SHIPPED: { label: "Shipped", color: "status-purple", icon: Truck },
  DELIVERED: { label: "Delivered", color: "status-green", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "status-red", icon: XCircle },
};

function OrderSkeleton() {
  return (
    <div className="order-card skeleton">
      <div className="order-card-top">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line" style={{ width: "80px" }}></div>
      </div>
      <div className="skeleton-line medium"></div>
      <div className="skeleton-line short"></div>
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
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <Package className="h-6 w-6" />
            <div>
              <h1>My Orders</h1>
              <p>{loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {loading ? (
          <div className="orders-list">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package className="h-12 w-12" />
            </div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <Link to="/shop" className="empty-state-btn">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING;
                const itemCount = order.items?.length || order.itemCount || 0;
                return (
                  <div key={order._id} className="order-card">
                    <div className="order-card-top">
                      <div className="order-card-id">
                        <Hash className="h-4 w-4" />
                        <span>{order.orderNo || order._id?.slice(-8).toUpperCase()}</span>
                      </div>
                      <span className={`order-status ${status.color}`}>
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="order-card-meta">
                      <span><Calendar className="h-3 w-3" /> {formatDate(order.createdAt)}</span>
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                      <span className="order-total">{formatCurrency(order.total || order.grandTotal || 0)}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="order-card-address">
                        <MapPin className="h-3 w-3" />
                        <span>{order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
                      </div>
                    )}
                    <div className="order-card-actions">
                      <button className="btn-outline btn-sm" onClick={() => setSelectedOrderId(order._id)}>
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      {order.status === "PENDING" && (
                        <button className="btn-danger btn-sm" onClick={() => handleCancelOrder(order._id)} disabled={cancelOrder.isPending}>
                          {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="shop-pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                      return <button key={p} className={`page-num ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                    }
                    if (Math.abs(p - page) === 3) return <span key={p} className="page-dots">...</span>;
                    return null;
                  })}
                </div>
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <div className="modal-overlay" onClick={() => setSelectedOrderId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setSelectedOrderId(null)}>
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="modal-body">
                <div className="skeleton-line"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line short"></div>
              </div>
            ) : selectedOrder ? (
              <div className="modal-body">
                <div className="modal-detail-row">
                  <span>Order ID</span>
                  <span>#{selectedOrder.orderNo || selectedOrder._id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="modal-detail-row">
                  <span>Date</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="modal-detail-row">
                  <span>Status</span>
                  <span className={`order-status ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="modal-detail-row">
                    <span>Delivery Address</span>
                    <span>{selectedOrder.deliveryAddress.name}, {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}</span>
                  </div>
                )}
                <div className="modal-divider"></div>
                <div className="modal-items">
                  {(selectedOrder.items || []).map((item) => {
                    const product = item.productId || item.product || {};
                    return (
                      <div key={product._id || item._id} className="modal-item">
                        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} />
                        <div className="modal-item-info">
                          <span className="modal-item-name">{product.name}</span>
                          <span className="modal-item-qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="modal-item-price">{formatCurrency((item.price || 0) * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-divider"></div>
                <div className="modal-total">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total || selectedOrder.grandTotal || 0)}</span>
                </div>
                {selectedOrder.status === "PENDING" && (
                  <div className="modal-footer">
                    <button className="btn-danger" onClick={() => handleCancelOrder(selectedOrder._id)} disabled={cancelOrder.isPending}>
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
