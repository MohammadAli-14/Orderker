import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi, orderApi } from "../lib/api";
import { formatDate, formatCurrency, getOrderStatusBadge, capitalizeText } from "../lib/utils";
import {
    ChevronDown, ChevronRight, Loader2, Users, Package, Link2,
    Clock, MapPin, CreditCard, ShoppingBag, Phone, Mail, Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import OrderDetailsModal from "../components/OrderDetailsModal";


const STATUS_OPTIONS = ["pending", "shipped", "delivered", "cancelled"];

function OrderChainsPage() {
    const queryClient = useQueryClient();
    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["customer-chains"],
        queryFn: customerApi.getChains,
        staleTime: 60000,
    });

    const { mutate: updateStatus, isLoading: isUpdating } = useMutation({
        mutationFn: orderApi.updateStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(["customer-chains"]);
            toast.success("Order status updated");
        },
        onError: () => toast.error("Failed to update status"),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-base-content/50">Loading order chains...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-error font-medium">Failed to load data: {error.message}</p>
            </div>
        );
    }

    const { customers, summary } = data;

    const toggleCustomer = (id) => {
        setExpandedCustomer(expandedCustomer === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-base-content">Order Chains</h1>
                <p className="text-base-content/50 text-sm mt-1">
                    Complete order history grouped by customer — manage and oversee all orders at a glance.
                </p>
            </div>

            {/* Summary KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard icon={Users} label="Customers with Orders" value={summary.totalCustomersWithOrders} />
                <SummaryCard icon={Package} label="Total Items Ordered" value={summary.totalItems} />
                <SummaryCard icon={Clock} label="Customers with Pending" value={summary.pendingChains} accent />
            </div>

            {/* Customer Chain Cards */}
            <div className="space-y-3">
                {customers.length === 0 ? (
                    <div className="text-center py-16 text-base-content/50">
                        <Package className="mx-auto size-12 mb-3 opacity-30" />
                        <p className="font-semibold text-lg">No orders yet</p>
                        <p className="text-sm">Customer order chains will appear here once orders are placed.</p>
                    </div>
                ) : (
                    customers.map((chain) => (
                        <CustomerChainCard
                            key={chain._id}
                            chain={chain}
                            isExpanded={expandedCustomer === chain._id}
                            onToggle={() => toggleCustomer(chain._id)}
                            onUpdateStatus={updateStatus}
                            onViewOrder={setSelectedOrder}
                            isUpdating={isUpdating}
                        />
                    ))
                )}
            </div>

            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, accent }) {
    return (
        <div className={`rounded-2xl border p-4 ${accent ? "border-warning/30 bg-warning/5" : "border-base-content/10 bg-base-100"}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${accent ? "bg-warning/15" : "bg-primary/10"}`}>
                    <Icon className={`size-4 ${accent ? "text-warning" : "text-primary"}`} />
                </div>
                <div>
                    <p className="text-2xl font-black text-base-content">{value}</p>
                    <p className="text-xs text-base-content/50 font-medium">{label}</p>
                </div>
            </div>
        </div>
    );
}

function CustomerChainCard({ chain, isExpanded, onToggle, onUpdateStatus, onViewOrder, isUpdating }) {
    const { user, orders, totalOrders, totalSpent, lastOrderDate } = chain;
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const totalItems = orders.reduce((sum, o) => sum + (o.orderItems?.reduce((s, i) => s + (i.quantity || 1), 0) || 0), 0);

    return (
        <div className="rounded-2xl border border-base-content/10 bg-base-100 overflow-hidden transition-shadow hover:shadow-md">
            {/* Customer Header — clickable */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-base-content/[0.02] transition-colors cursor-pointer"
            >
                {/* Avatar */}
                <div className="avatar">
                    <div className="w-11 h-11 rounded-full border-2 border-primary/20">
                        <img
                            src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`}
                            alt={user.name}
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-base-content truncate">{user.name}</h3>
                        {user.isPhoneVerified && (
                            <span className="badge badge-success badge-xs text-white font-bold">Verified</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-base-content/50 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                        {user.phoneNumber && (
                            <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phoneNumber}</span>
                        )}
                    </div>
                </div>

                {/* Stats Pills */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <Link2 className="w-3 h-3" />
                        {totalOrders} {totalOrders === 1 ? "order" : "orders"}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-content/5 text-base-content/60 text-xs font-semibold">
                        <ShoppingBag className="w-3 h-3" />
                        {totalItems} items
                    </div>
                    <div className="text-sm font-bold text-base-content whitespace-nowrap">
                        {formatCurrency(totalSpent)}
                    </div>
                    {pendingCount > 0 && (
                        <span className="badge badge-warning badge-sm font-bold">{pendingCount} pending</span>
                    )}
                </div>

                {/* Expand Arrow */}
                <div className="text-base-content/30">
                    {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                </div>
            </button>

            {/* Mobile Stats (visible only on small screens when collapsed) */}
            {!isExpanded && (
                <div className="flex md:hidden items-center gap-2 px-4 pb-3 flex-wrap">
                    <span className="badge badge-primary badge-sm font-bold">{totalOrders} orders</span>
                    <span className="badge badge-ghost badge-sm">{totalItems} items</span>
                    <span className="text-xs font-bold text-base-content">{formatCurrency(totalSpent)}</span>
                    {pendingCount > 0 && <span className="badge badge-warning badge-xs">{pendingCount} pending</span>}
                </div>
            )}

            {/* Expanded — Order List */}
            {isExpanded && (
                <div className="border-t border-base-content/5 bg-base-content/[0.01]">
                    <div className="p-4 md:p-5 space-y-3">
                        <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                            Order Chain — {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
                        </p>
                        {orders.map((order) => (
                            <OrderRow
                                key={order._id}
                                order={order}
                                onUpdateStatus={onUpdateStatus}
                                onViewDetails={() => onViewOrder({ ...order, user })}
                                isUpdating={isUpdating}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function OrderRow({ order, onUpdateStatus, onViewDetails, isUpdating }) {
    const itemCount = order.orderItems?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
    const itemNames = order.orderItems?.map((i) => i.name).join(", ") || "";

    return (
        <div
            className="rounded-xl border border-base-content/8 bg-base-100 p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 transition-all hover:border-primary/40 hover:bg-primary/[0.02] cursor-pointer group"
            onClick={onViewDetails}
        >
            {/* Order ID + Date */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-base-content/40 group-hover:text-primary transition-colors">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`badge badge-sm font-bold ${getOrderStatusBadge(order.status)}`}>
                        {capitalizeText(order.status)}
                    </span>
                </div>
                <p className="text-sm font-medium text-base-content truncate max-w-xs" title={itemNames}>
                    {itemNames || "No items"}
                </p>
                <div className="flex items-center gap-3 text-xs text-base-content/40 mt-1">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {order.paymentMethod}
                    </span>
                    {order.shippingAddress && (
                        <span className="hidden sm:flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {order.shippingAddress.city}
                        </span>
                    )}
                </div>
            </div>

            {/* Items + Price */}
            <div className="flex items-center gap-4 md:gap-6">
                <div className="text-right">
                    <p className="text-sm font-bold text-base-content">{formatCurrency(order.totalPrice)}</p>
                    <p className="text-xs text-base-content/40">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
                </div>

                {/* Status Changer */}
                <select
                    className="select select-bordered select-sm text-xs w-28 bg-base-100"
                    value={order.status}
                    disabled={isUpdating || order.status === "delivered"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateStatus({ orderId: order._id, status: e.target.value })}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{capitalizeText(s)}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default OrderChainsPage;
