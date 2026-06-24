import { Package, Users, ShoppingCart, IndianRupee, Plus, Eye, FileText } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  const stats = [
    { label: "Total Products", value: data?.totalProducts ?? "--", icon: Package, color: "bg-amber-500" },
    { label: "Total Customers", value: data?.totalCustomers ?? "--", icon: Users, color: "bg-blue-600" },
    { label: "Total Orders", value: data?.totalOrders ?? "--", icon: ShoppingCart, color: "bg-green-600" },
    { label: "Revenue", value: `₹${data?.totalRevenue?.toLocaleString() || "0"}`, icon: IndianRupee, color: "bg-emerald-600" },
  ];

  const recentActivity = [
    { text: "New order received #ORD-1024", time: "2 minutes ago" },
    { text: "Payment received from John Doe", time: "15 minutes ago" },
    { text: "Product 'Organic Fertilizer' updated", time: "1 hour ago" },
    { text: "New customer registration: Priya Farms", time: "2 hours ago" },
    { text: "Invoice #INV-2048 marked as paid", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-md p-2 text-white ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
              <Plus className="h-4 w-4" /> New Order
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Customer
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600">
              <Plus className="h-4 w-4" /> Add Product
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <FileText className="h-4 w-4" /> Create Invoice
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Eye className="h-4 w-4" /> View Reports
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-start justify-between text-sm">
                  <span>{item.text}</span>
                  <span className="ml-4 whitespace-nowrap text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
