import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/services/dashboard.service";
import { Package, ShoppingCart, IndianRupee, Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const statCards = [
  { title: "Total Products", icon: Package, key: "totalProducts", color: "bg-blue-50 text-blue-600", trend: "+12%" },
  { title: "Total Orders", icon: ShoppingCart, key: "totalOrders", color: "bg-purple-50 text-purple-600", trend: "+8%" },
  { title: "Total Revenue", icon: IndianRupee, key: "totalRevenue", color: "bg-amber-50 text-amber-600", prefix: "₹", format: "currency", trend: "+23%" },
  { title: "Total Customers", icon: Users, key: "totalCustomers", color: "bg-rose-50 text-rose-600", trend: "+5%" },
  { title: "Pending Orders", icon: ShoppingCart, key: "pendingOrders", color: "bg-orange-50 text-orange-600", trend: "-2%" },
];

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const stats = data?.data?.data || {};
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, i) => (
          <Card key={stat.key} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                {isLoading ? <Skeleton className="h-7 w-20" /> : (
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.format === "currency"
                      ? `₹${Number(stats[stat.key] || 0).toLocaleString("en-IN")}`
                      : (stats[stat.key] || 0).toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
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
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No recent orders</TableCell></TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order._id} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900 pl-5">{order.orderNumber || order._id?.slice(-8)}</TableCell>
                    <TableCell className="text-slate-600">{order.customerId?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-500">{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        order.status === "delivered" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : order.status === "shipped" ? "text-blue-700 bg-blue-50 border-blue-200"
                        : order.status === "confirmed" ? "text-purple-700 bg-purple-50 border-purple-200"
                        : order.status === "pending" ? "text-amber-700 bg-amber-50 border-amber-200"
                        : order.status === "cancelled" ? "text-red-700 bg-red-50 border-red-200"
                        : "text-slate-700 bg-slate-50 border-slate-200"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 pr-5">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</TableCell>
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
