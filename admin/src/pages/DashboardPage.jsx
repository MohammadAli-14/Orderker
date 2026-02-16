import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { orderApi, statsApi } from "../lib/api";
import { BanknoteIcon, PackageIcon, ShoppingBagIcon, UsersIcon } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import StatusChart from "../components/dashboard/StatusChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import { formatCurrency, getOrderStatusBadge, capitalizeText, formatDate } from "../lib/utils";

function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats", timeRange],
    queryFn: () => statsApi.getDashboard({ timeRange }),
  });

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const stats = [
    {
      title: "Total Revenue",
      value: statsLoading ? "..." : formatCurrency(statsData?.totalRevenue || 0),
      icon: BanknoteIcon,
      color: "primary",
    },
    {
      title: "Total Orders",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: "secondary",
    },
    {
      title: "Total Customers",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: UsersIcon,
      color: "emerald",
    },
    {
      title: "Total Products",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: PackageIcon,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* 1. KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="min-w-0">
          <RevenueChart
            data={statsData?.charts?.revenueByDate}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6 min-w-0">
          <StatusChart data={statsData?.charts?.ordersByStatus} />
        </div>
      </div>

      {/* 3. ROW 3: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Top Products */}
        <div className="xl:col-span-1 min-w-0">
          <TopProductsChart data={statsData?.charts?.topProducts} />
        </div>

        {/* Recent Orders Table */}
        <div className="xl:col-span-2 card bg-white border border-base-200 shadow-sm">
          <div className="card-body p-0">
            <div className="p-6 border-b border-base-200 flex justify-between items-center">
              <h3 className="card-title text-lg font-bold text-gray-800">Recent Transactions</h3>
              <Link to="/orders" className="btn btn-sm btn-ghost text-primary">View All</Link>
            </div>

            {ordersLoading ? (
              <div className="p-8 text-center">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="bg-base-100 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="font-semibold py-4 pl-6">Order ID</th>
                      <th className="font-semibold py-4">Customer</th>
                      <th className="font-semibold py-4">Total</th>
                      <th className="font-semibold py-4">Status</th>
                      <th className="font-semibold py-4 pr-6">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-base-50 transition-colors border-b border-base-100 last:border-0">
                        <td className="font-medium text-gray-900 pl-6">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div className="font-medium text-gray-800">{order.shippingAddress.fullName}</div>
                          <div className="text-xs text-gray-500">{order.orderItems.length} items</div>
                        </td>
                        <td className="font-bold text-gray-700">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td>
                          <span className={`badge badge-sm border-0 font-semibold ${getOrderStatusBadge(order.status)}`}>
                            {capitalizeText(order.status)}
                          </span>
                        </td>
                        <td className="text-gray-500 text-sm pr-6">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <OnboardingModal />
    </div>
  );
}

export default DashboardPage;
