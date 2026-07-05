import { useState } from "react";
import { Calendar, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 4000, orders: 24 },
  { month: "Feb", sales: 3000, orders: 18 },
  { month: "Mar", sales: 5000, orders: 32 },
  { month: "Apr", sales: 4500, orders: 28 },
  { month: "May", sales: 6000, orders: 38 },
  { month: "Jun", sales: 5500, orders: 35 },
  { month: "Jul", sales: 7000, orders: 45 },
  { month: "Aug", sales: 6500, orders: 42 },
  { month: "Sep", sales: 8000, orders: 52 },
  { month: "Oct", sales: 7500, orders: 48 },
  { month: "Nov", sales: 9000, orders: 58 },
  { month: "Dec", sales: 8500, orders: 55 },
];

const revenueData = [
  { week: "Week 1", revenue: 12000, expenses: 8000 },
  { week: "Week 2", revenue: 15000, expenses: 9500 },
  { week: "Week 3", revenue: 13500, expenses: 8800 },
  { week: "Week 4", revenue: 18000, expenses: 11000 },
  { week: "Week 5", revenue: 16500, expenses: 10200 },
  { week: "Week 6", revenue: 20000, expenses: 12500 },
];

const topProducts = [
  { name: "Organic Fertilizer", sold: 150, revenue: 45000 },
  { name: "Seed Variety Pack", sold: 120, revenue: 36000 },
  { name: "Irrigation Kit", sold: 85, revenue: 85000 },
  { name: "Soil Test Kit", sold: 70, revenue: 21000 },
  { name: "Garden Tools Set", sold: 65, revenue: 19500 },
];

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500 mt-1">Analytics and insights</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">From</Label>
              <Input
                id="from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-slate-200 focus-visible:ring-slate-400/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">To</Label>
              <Input
                id="to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-slate-200 focus-visible:ring-slate-400/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(75000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">475</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-50 p-2.5">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Products Sold</p>
                <p className="text-2xl font-bold text-slate-900">1,250</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="p-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="p-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{product.name}</span>
                  <span className="text-sm text-slate-500">
                    {product.sold} units - {formatCurrency(product.revenue)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(product.sold / topProducts[0].sold) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
