import { orderApi } from "../lib/api";
import { formatDate, formatCurrency } from "../lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-base-content/70">Manage customer orders</p>
      </div>

      {/* ORDERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-sm">Orders will appear here once customers make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead className="sticky top-0 bg-base-100 z-20 shadow-sm">
                  <tr>
                    <th className="py-5">Order ID</th>
                    <th className="py-5">Customer</th>
                    <th className="py-5">Items</th>
                    <th className="py-5">Total</th>
                    <th className="py-5 text-center">Status</th>
                    <th className="py-5">Payment</th>
                    <th className="py-5">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-base-200">
                  {orders.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr key={order._id} className="hover:bg-base-200/50 transition-colors">
                        <td className="align-middle py-5">
                          <span className="font-mono text-sm opacity-70">#{order._id.slice(-8).toUpperCase()}</span>
                        </td>

                        <td className="align-middle py-5">
                          <div className="font-semibold">{order.shippingAddress.fullName}</div>
                          <div className="text-xs opacity-50">
                            {order.shippingAddress.city}
                          </div>
                        </td>

                        <td className="align-middle py-5">
                          <div className="text-sm font-medium">
                            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                          </div>
                        </td>

                        <td className="align-middle py-5">
                          <span className="font-bold text-sm">{formatCurrency(order.totalPrice)}</span>
                        </td>

                        <td className="align-middle py-5 text-center">
                          <div className="inline-block min-w-[140px]">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`select select-sm select-bordered w-full h-10 font-bold transition-all border-2 focus:ring-2 focus:ring-offset-1 ${order.status === "delivered" ? "text-success-content border-success bg-success/90 hover:bg-success" :
                                order.status === "shipped" ? "text-info-content border-info bg-info/90 hover:bg-info" :
                                  order.status === "cancelled" ? "text-error-content border-error bg-error/90 hover:bg-error" :
                                    "text-warning-content border-warning bg-warning/90 hover:bg-warning"
                                }`}
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="pending" className="bg-base-100 text-base-content">Pending</option>
                              <option value="shipped" className="bg-base-100 text-base-content">Shipped</option>
                              <option value="delivered" className="bg-base-100 text-base-content">Delivered</option>
                              <option value="cancelled" className="bg-base-100 text-base-content">Cancelled</option>
                            </select>
                          </div>
                        </td>

                        <td className="align-middle py-5">
                          <div className="flex flex-col">
                            <div className="font-medium text-sm">
                              {order.paymentMethod === "Stripe" ? "Card" : order.paymentMethod}
                            </div>
                            {order.paymentProof?.receiptUrl && (
                              <a
                                href={order.paymentProof.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-xs link link-hover font-semibold mt-1"
                              >
                                View Receipt
                              </a>
                            )}
                            {order.paymentProof?.transactionId && (
                              <div className="text-[10px] opacity-60 mt-1">
                                ID: {order.paymentProof.transactionId}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="align-middle py-5">
                          <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default OrdersPage;
