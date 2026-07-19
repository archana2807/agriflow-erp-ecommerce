import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/services/dashboard.service";
import { Package, ShoppingCart, IndianRupee, Users, TrendingUp, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const statCards = [
  { title: "Total Products", icon: Package, key: "totalProducts", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600", trend: "+12%", trendUp: true },
  { title: "Total Orders", icon: ShoppingCart, key: "totalOrders", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600", trend: "+8%", trendUp: true },
  { title: "Total Revenue", icon: IndianRupee, key: "totalRevenue", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600", prefix: "₹", format: "currency", trend: "+23%", trendUp: true },
  { title: "Total Customers", icon: Users, key: "totalCustomers", color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-600", trend: "+5%", trendUp: true },
  { title: "Pending Orders", icon: Clock, key: "pendingOrders", color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-600", trend: "-2%", trendUp: false },
];

const statusBadge = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const stats = data || {};
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.key} className="border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-2.5 ${stat.bg} shadow-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.text}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${stat.trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                  <TrendingUp className={`h-3 w-3 ${!stat.trendUp && "rotate-180"}`} />
                  {stat.trend}
                </div>
              </div>
              <div>
                {isLoading ? <Skeleton className="h-8 w-24 mb-1" /> : (
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {stat.format === "currency"
                      ? `₹${Number(stats[stat.key] || 0).toLocaleString("en-IN")}`
                      : (stats[stat.key] || 0).toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-0.5">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Recent Orders</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer orders</p>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 pl-5">Order ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right pr-5">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50">
                    {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-500">No recent orders</p>
                      <p className="text-xs text-slate-400 mt-0.5">Orders will appear here once customers start buying</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order._id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 pl-5">
                      <span className="font-mono text-sm">{order.orderNo || order._id?.slice(-8)}</span>
                    </TableCell>
                    <TableCell className="text-slate-600">{order.customerId?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-medium text-[11px] px-2 py-0.5 ${statusBadge[order.status] || "text-slate-700 bg-slate-50 border-slate-200"}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 pr-5 tabular-nums">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
