import { useQuery } from "@tanstack/react-query";
import { orderApi, statsApi } from "../lib/api";
import { BanknoteIcon, PackageIcon, ShoppingBagIcon, UsersIcon } from "lucide-react";
import { capitalizeText, formatDate, formatCurrency, getOrderStatusBadge } from "../lib/utils";

function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  // it would be better to send the last 5 items from the api, instead of slicing it here
  // but we're just keeping it simple here...
  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const statsCards = [
    {
      name: "Total Revenue",
      value: statsLoading ? "..." : formatCurrency(statsData?.totalRevenue || 0),
      icon: <BanknoteIcon className="size-8" />,
    },
    {
      name: "Total Orders",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" />,
    },
    {
      name: "Total Customers",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-8" />,
    },
    {
      name: "Total Products",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <PackageIcon className="size-8" />,
    },
  ];

  return (
    <div className="relative space-y-8">
      {/* Background Glows (Very Subtle) */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-[128px] pointer-events-none" />

      {/* STATS */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={stat.name}
            className="group relative card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            {/* Gradient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="card-body relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-base-content/60 mb-2">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-base-content">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="relative z-10 card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Orders</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                      </td>

                      <td>
                        <div>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm">
                          {order.orderItems[0]?.name}
                          {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                        </div>
                      </td>

                      <td>
                        <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
                      </td>

                      <td>
                        <div className="font-medium text-xs">
                          {order.paymentMethod === "Stripe" ? "Card" : order.paymentMethod}
                        </div>
                      </td>

                      <td>
                        <div className={`badge badge-sm ${getOrderStatusBadge(order.status)}`}>
                          {capitalizeText(order.status)}
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
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
  );
}

export default DashboardPage;
