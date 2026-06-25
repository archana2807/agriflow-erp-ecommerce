import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, XCircle, Eye, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMyOrders, useMyOrder, useCancelOrder } from "@/hooks/useQueries";

function OrderCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function MyOrders() {
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: ordersData, isLoading: loading } = useMyOrders({ page, limit: 10 });
  const { data: orderDetailData, isLoading: detailLoading } = useMyOrder(selectedOrderId);
  const cancelOrder = useCancelOrder();

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.totalPages || 1;
  const selectedOrder = orderDetailData?.order || orderDetailData;

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleCancelOrder = (orderId) => {
    cancelOrder.mutate(orderId, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
      },
      onError: () => {
        toast.error("Failed to cancel order");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const itemCount = order.items?.length || order.itemCount || 0;
              return (
                <Card key={order._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                          </span>
                          <Badge className={status.color}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm">
                          {itemCount} item{itemCount !== 1 ? "s" : ""} &middot;{" "}
                          <span className="font-medium">
                            {formatCurrency(order.total || order.grandTotal || 0)}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {order.status === "PENDING" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancelOrder.isPending}
                          >
                            {cancelOrder.isPending ? "Cancelling..." : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : selectedOrder ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={statusConfig[selectedOrder.status]?.color}>
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Delivery Address:</span>
                    <p className="mt-1">
                      {selectedOrder.deliveryAddress.name},{" "}
                      {selectedOrder.deliveryAddress.address},{" "}
                      {selectedOrder.deliveryAddress.city},{" "}
                      {selectedOrder.deliveryAddress.state} -{" "}
                      {selectedOrder.deliveryAddress.pincode}
                    </p>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item) => {
                    const product = item.product || item;
                    return (
                      <div key={item._id || product._id} className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency((product.price || 0) * item.qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total || selectedOrder.grandTotal || 0)}</span>
                </div>
              </div>
              <DialogFooter>
                {selectedOrder.status === "PENDING" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    disabled={cancelOrder.isPending}
                  >
                    {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
