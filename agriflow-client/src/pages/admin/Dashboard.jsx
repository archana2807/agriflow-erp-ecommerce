import { Users, Package, ShoppingCart, IndianRupee, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useQueries";
import { toast } from "sonner";

const statCards = [
  { key: "totalCustomers", label: "Total Customers", icon: Users, color: "#3b82f6", bg: "#eff6ff", trend: "+12%" },
  { key: "totalProducts", label: "Total Products", icon: Package, color: "#16a34a", bg: "#f0fdf4", trend: "+5%" },
  { key: "totalOrders", label: "Total Orders", icon: ShoppingCart, color: "#8b5cf6", bg: "#f5f3ff", trend: "+18%" },
  { key: "revenue", label: "Revenue", icon: IndianRupee, color: "#f59e0b", bg: "#fffbeb", isCurrency: true, trend: "+24%" },
  { key: "pendingInvoices", label: "Pending Invoices", icon: FileText, color: "#ef4444", bg: "#fef2f2", trend: "-3%" },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (stats && !stats.success) {
    toast.error("Failed to fetch dashboard stats");
  }

  return (
    <div className="erp-page">
      <div className="erp-page-header anim-fade-up">
        <div>
          <h1 className="erp-page-title">Dashboard</h1>
          <p className="erp-page-subtitle">Overview of your store performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="stat-card skeleton-stat anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="skeleton-line" style={{ width: "60%", height: "14px" }}></div>
                <div className="skeleton-line" style={{ width: "40%", height: "28px", marginTop: "8px" }}></div>
              </div>
            ))
          : statCards.map((card, i) => {
              const value = stats?.[card.key] || 0;
              const Icon = card.icon;
              const isPositive = card.trend.startsWith("+");
              return (
                <div key={card.key} className="stat-card anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="stat-card-top">
                    <div className="stat-card-info">
                      <span className="stat-card-label">{card.label}</span>
                      <span className="stat-card-value">
                        {card.isCurrency ? formatCurrency(value) : value}
                      </span>
                    </div>
                    <div className="stat-card-icon" style={{ background: card.bg }}>
                      <Icon style={{ color: card.color }} className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="stat-card-trend">
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={isPositive ? "trend-up" : "trend-down"}>
                      {card.trend}
                    </span>
                    <span className="trend-label">vs last month</span>
                  </div>
                </div>
              );
            })}
      </div>

      {!isLoading && stats && (
        <div className="activity-section">
          <h2 className="section-title anim-fade-up">Recent Activity</h2>
          <div className="activity-grid">
            <div className="activity-card anim-fade-up anim-delay-1">
              <div className="activity-icon green">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="activity-label">Orders This Month</p>
                <p className="activity-value">{stats.ordersThisMonth || 0}</p>
              </div>
            </div>
            <div className="activity-card anim-fade-up anim-delay-2">
              <div className="activity-icon blue">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="activity-label">New Customers</p>
                <p className="activity-value">{stats.customersThisMonth || 0}</p>
              </div>
            </div>
            <div className="activity-card anim-fade-up anim-delay-3">
              <div className="activity-icon amber">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="activity-label">Revenue This Month</p>
                <p className="activity-value">{formatCurrency(stats.revenueThisMonth || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
