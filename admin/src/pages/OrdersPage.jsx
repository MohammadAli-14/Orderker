import { useState } from "react";
import {
  XIcon,
  MapPinIcon,
  UserIcon,
  PackageIcon,
  CreditCardIcon,
  CalendarIcon,
  ExternalLinkIcon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../lib/api";
import { formatDate, formatCurrency } from "../lib/utils";
import OrderDetailsModal from "../components/OrderDetailsModal";


function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);

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

      {/* ORDERS LIST (Adaptive: Cards on Mobile, Table on Desktop) */}
      <div className="card bg-base-100 shadow-xl overflow-hidden">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-base-content/60">
              <div className="flex justify-center mb-4 opacity-20">
                <PackageIcon size={64} />
              </div>
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-sm">Orders will appear here once customers make purchases</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th className="py-5 pl-8">Order ID</th>
                      <th className="py-5">Customer</th>
                      <th className="py-5">Items</th>
                      <th className="py-5">Total</th>
                      <th className="py-5 text-center">Status</th>
                      <th className="py-5">Payment</th>
                      <th className="py-5 pr-8">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-base-200">
                    {orders.map((order) => {
                      const totalQuantity = order.orderItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      );

                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-primary/5 transition-all cursor-pointer group"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="align-middle py-5 pl-8">
                            <span className="font-mono text-xs opacity-70 group-hover:text-primary transition-colors font-bold tracking-tighter">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                          </td>

                          <td className="align-middle py-5">
                            <div className="font-bold text-base-content group-hover:text-primary transition-colors">
                              {order.shippingAddress.fullName}
                            </div>
                            <div className="text-xs opacity-50 italic">
                              {order.shippingAddress.city}
                            </div>
                          </td>

                          <td className="align-middle py-5">
                            <div className="badge badge-outline badge-sm font-semibold opacity-70">
                              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                            </div>
                          </td>

                          <td className="align-middle py-5">
                            <span className="font-black text-sm text-primary">{formatCurrency(order.totalPrice)}</span>
                          </td>

                          <td className="align-middle py-5 text-center" onClick={(e) => e.stopPropagation()}>
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
                              <div className="font-black text-xs uppercase tracking-widest text-base-content/40">
                                {order.paymentMethod === "Stripe" ? "Card" : order.paymentMethod}
                              </div>
                              {order.paymentProof?.receiptUrl && (
                                <div className="mt-1 flex items-center gap-1 text-primary animate-pulse">
                                  <CreditCardIcon size={12} />
                                  <span className="text-[10px] font-bold">Proof Attached</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="align-middle py-5 pr-8">
                            <span className="text-xs opacity-60 font-medium">{formatDate(order.createdAt)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW (Visible on Mobile) */}
              <div className="md:hidden space-y-4 p-4 bg-base-200/50">
                {orders.map((order) => {
                  const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div
                      key={order._id}
                      className="card bg-base-100 shadow-sm border border-base-200 active:scale-[0.98] transition-transform"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="card-body p-4">
                        {/* Card Header: ID + Date */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="badge badge-ghost badge-sm font-mono tracking-tighter opacity-70">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-base-content/40">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Card Body: Customer + Total */}
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-bold text-base">{order.shippingAddress.fullName}</h3>
                            <div className="text-xs opacity-50 flex items-center gap-1">
                              <MapPinIcon size={10} />
                              {order.shippingAddress.city}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-lg text-primary">{formatCurrency(order.totalPrice)}</div>
                            <div className="text-xs opacity-50">{totalQuantity} items</div>
                          </div>
                        </div>

                        {/* Card Footer: Status + Actions */}
                        <div className="pt-3 border-t border-base-100 flex justify-between items-center">
                          <div onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`select select-xs select-bordered font-bold w-full max-w-[110px] ${order.status === "delivered" ? "text-success-content border-success bg-success/90" :
                                order.status === "shipped" ? "text-info-content border-info bg-info/90" :
                                  order.status === "cancelled" ? "text-error-content border-error bg-error/90" :
                                    "text-warning-content border-warning bg-warning/90"
                                }`}
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>

                          <button className="btn btn-sm btn-ghost text-primary gap-1 px-2">
                            Manage
                            <PackageIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export default OrdersPage;
