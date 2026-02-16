import {
    XIcon,
    MapPinIcon,
    UserIcon,
    PackageIcon,
    CreditCardIcon,
    CalendarIcon,
    ExternalLinkIcon
} from "lucide-react";
import { formatDate, formatCurrency } from "../lib/utils";

function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl p-0 bg-base-100 overflow-hidden rounded-3xl border border-base-300 shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* MODAL HEADER */}
                <div className="bg-primary p-6 text-primary-content flex justify-between items-center bg-gradient-to-r from-primary to-secondary">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <PackageIcon className="size-5" />
                            <h3 className="font-bold text-xl uppercase tracking-tighter">Order Details</h3>
                        </div>
                        <p className="opacity-80 text-xs font-mono">ID: {order._id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm text-primary-content hover:bg-white/20">
                        <XIcon className="size-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* CUSTOMER & SHIPPING */}
                        <div className="space-y-6">
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <UserIcon className="size-5" />
                                    <h4 className="font-bold text-lg uppercase tracking-tight">Customer Info</h4>
                                </div>
                                <div className="bg-base-200 p-5 rounded-2xl space-y-2">
                                    <p className="font-bold text-lg">{order.shippingAddress?.fullName || "No Name"}</p>
                                    <p className="text-sm opacity-70">{order.user?.email || "No Email"}</p>
                                    <p className="text-sm font-semibold text-primary">{order.shippingAddress?.phoneNumber || "No Phone"}</p>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <MapPinIcon className="size-5" />
                                    <h4 className="font-bold text-lg uppercase tracking-tight">Shipping Address</h4>
                                </div>
                                <div className="bg-base-200 p-5 rounded-2xl space-y-1">
                                    <p className="font-medium">{order.shippingAddress?.streetAddress || "No Street"}</p>
                                    <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                    <p className="text-sm">{order.shippingAddress?.zipCode}</p>
                                </div>
                            </section>
                        </div>

                        {/* ORDER STATUS & PAYMENT */}
                        <div className="space-y-6">
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <CalendarIcon className="size-5" />
                                    <h4 className="font-bold text-lg uppercase tracking-tight">Order Timeline</h4>
                                </div>
                                <div className="bg-base-200 p-5 rounded-2xl divide-y divide-base-300">
                                    <div className="pb-3 flex justify-between items-center">
                                        <span className="text-sm opacity-60">Created</span>
                                        <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="py-3 flex justify-between items-center">
                                        <span className="text-sm opacity-60">Status</span>
                                        <span className={`badge badge-sm font-bold uppercase ${order.status === "delivered" ? "badge-success" :
                                            order.status === "shipped" ? "badge-info" :
                                                order.status === "cancelled" ? "badge-error" : "badge-warning"
                                            }`}>{order.status}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <CreditCardIcon className="size-5" />
                                    <h4 className="font-bold text-lg uppercase tracking-tight">Payment Info</h4>
                                </div>
                                <div className="bg-base-200 p-5 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm opacity-60">Method</span>
                                        <span className="font-bold">{order.paymentMethod}</span>
                                    </div>

                                    {order.paymentProof?.receiptUrl && (
                                        <div className="pt-2 border-t border-base-300">
                                            <p className="text-[10px] uppercase font-bold text-primary mb-2">Transaction Proof</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono opacity-60 truncate max-w-[150px]">ID: {order.paymentProof.transactionId}</span>
                                                <a
                                                    href={order.paymentProof.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-xs btn-outline btn-primary gap-1"
                                                >
                                                    <ExternalLinkIcon className="size-3" />
                                                    View Receipt
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <PackageIcon className="size-5" />
                            <h4 className="font-bold text-lg uppercase tracking-tight">Order Items ({totalQuantity})</h4>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-base-200">
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-base-200">
                                        <tr>
                                            <th>Product</th>
                                            <th className="text-center">Quantity</th>
                                            <th className="text-right">Price</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.orderItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-base-200/50">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                <img src={item.image} alt={item.name} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{item.name}</div>
                                                            <div className="text-xs opacity-50 capitalize">{item.product?.category || "Product"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center font-bold">x{item.quantity}</td>
                                                <td className="text-right font-medium">{formatCurrency(item.price)}</td>
                                                <td className="text-right font-bold text-primary">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* SUMMARY */}
                    <div className="flex justify-end pt-4">
                        <div className="bg-primary text-primary-content p-6 rounded-3xl min-w-[300px] shadow-xl">
                            <div className="flex justify-between items-center">
                                <span className="text-sm uppercase font-bold opacity-70">Final Total</span>
                                <span className="text-3xl font-black">{formatCurrency(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        </div>
    );
}

export default OrderDetailsModal;
