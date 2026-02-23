import { useState } from "react";
import {
    Zap,
    Plus,
    Trash2,
    Calendar,
    Tag,
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    X,
    Pencil
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashSaleApi, productApi } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import toast from "react-hot-toast";

function SalesManagementPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        startTime: "",
        endTime: "",
        discountType: "INDIVIDUAL",
        globalDiscountPercent: 0,
        products: [],
        status: "DRAFT",
        bannerImage: ""
    });

    const queryClient = useQueryClient();

    // Fetch Sales
    const { data: sales = [], isLoading: salesLoading } = useQuery({
        queryKey: ["flash-sales"],
        queryFn: flashSaleApi.getAll,
    });

    // Fetch Products for Picker
    const { data: allProducts = [] } = useQuery({
        queryKey: ["products"],
        queryFn: productApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: flashSaleApi.create,
        onSuccess: () => {
            toast.success("Campaign created successfully");
            queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
            closeModal();
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || "Failed to create campaign";
            toast.error(msg);
        }
    });

    const updateMutation = useMutation({
        mutationFn: flashSaleApi.update,
        onSuccess: () => {
            toast.success("Campaign updated successfully");
            queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
            closeModal();
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || "Failed to update campaign";
            toast.error(msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: flashSaleApi.delete,
        onSuccess: () => {
            toast.success("Campaign deleted");
            queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
        }
    });

    const openModal = (sale = null) => {
        if (sale) {
            setEditingSale(sale);
            setFormData({
                title: sale.title,
                startTime: new Date(sale.startTime).toISOString().slice(0, 16),
                endTime: new Date(sale.endTime).toISOString().slice(0, 16),
                discountType: sale.discountType,
                globalDiscountPercent: sale.globalDiscountPercent,
                products: sale.products || [],
                status: sale.status,
                bannerImage: sale.bannerImage || ""
            });
        } else {
            setEditingSale(null);
            setFormData({
                title: "",
                startTime: "",
                endTime: "",
                discountType: "INDIVIDUAL",
                globalDiscountPercent: 0,
                products: [],
                status: "DRAFT",
                bannerImage: ""
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSale(null);
    };

    const toggleProduct = (productId) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.includes(productId)
                ? prev.products.filter(id => id !== productId)
                : [...prev.products, productId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.products.length === 0) {
            return toast.error("Please select at least one product");
        }

        if (editingSale) {
            updateMutation.mutate({ id: editingSale._id, payload: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "ACTIVE": return <div className="badge badge-success gap-1"><CheckCircle2 className="w-3 h-3" /> Active</div>;
            case "SCHEDULED": return <div className="badge badge-info gap-1"><Clock className="w-3 h-3" /> Scheduled</div>;
            case "FINISHED": return <div className="badge badge-ghost gap-1">Finished</div>;
            default: return <div className="badge badge-warning gap-1">Draft</div>;
        }
    };

    // Check for overlaps
    const getConflictingProducts = () => {
        if (!formData.startTime || !formData.endTime) return new Set();

        const start = new Date(formData.startTime).getTime();
        const end = new Date(formData.endTime).getTime();

        const overlappingSales = sales.filter(s => {
            if (editingSale && s._id === editingSale._id) return false; // Ignore self
            if (s.status === "FINISHED" || s.status === "DRAFT") return false; // Ignore inactive
            const sStart = new Date(s.startTime).getTime();
            const sEnd = new Date(s.endTime).getTime();
            return start < sEnd && end > sStart;
        });

        const conflictingIds = new Set();
        overlappingSales.forEach(s => {
            s.products.forEach(pId => conflictingIds.add(pId));
        });
        return conflictingIds;
    };

    const conflictingProductIds = getConflictingProducts();

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                        Flash Sale Campaigns
                    </h1>
                    <p className="text-base-content/70 mt-1">Manage scheduled promotions and discounts</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary gap-2">
                    <Plus className="w-5 h-5" />
                    New Campaign
                </button>
            </div>

            {salesLoading ? (
                <div className="flex justify-center p-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sales.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-2xl">
                            <div className="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-base-content/20" />
                            </div>
                            <h3 className="text-xl font-bold">No Campaigns Found</h3>
                            <p className="text-base-content/60">Create your first flash sale event to boost sales.</p>
                        </div>
                    ) : (
                        sales.map((sale) => (
                            <div key={sale._id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all border border-base-200">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h3 className="text-xl font-bold">{sale.title}</h3>
                                            {getStatusBadge(sale.status)}
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-base-content/60">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(sale.startTime).toLocaleString()} - {new Date(sale.endTime).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                {sale.products?.length || 0} Products
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Tag className="w-4 h-4" />
                                                {sale.discountType === "GLOBAL" ? `${sale.globalDiscountPercent}% Global` : "Individual Discounts"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(sale)} className="btn btn-ghost btn-square">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(sale._id)}
                                            className="btn btn-ghost btn-square text-error"
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Campaign Modal */}
            <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />
            <div className="modal">
                <div className="modal-box max-w-4xl p-0 overflow-hidden rounded-3xl bg-base-100 shadow-2xl">
                    <div className="bg-primary-gradient p-8 text-white relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle text-white/70">
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-2xl font-bold">{editingSale ? "Edit Campaign" : "Create New Campaign"}</h3>
                        <p className="text-white/70 text-sm mt-1">Configure timing and product selection</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label text-xs font-bold uppercase tracking-wider opacity-60">Campaign Title</label>
                                <input
                                    type="text"
                                    className="input input-bordered focus:input-primary"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Summer Flash Sale"
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label text-xs font-bold uppercase tracking-wider opacity-60">Status</label>
                                <select
                                    className="select select-bordered"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="FINISHED">Finished</option>
                                </select>
                                {formData.status === "ACTIVE" && sales.some(s => s.status === "ACTIVE" && (!editingSale || s._id !== editingSale._id)) && (
                                    <div className="mt-2 p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                        <p className="text-xs text-warning">
                                            Another campaign is already active. Only one sale can run at a time — the backend will block this activation.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label text-xs font-bold uppercase tracking-wider opacity-60">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="input input-bordered"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label text-xs font-bold uppercase tracking-wider opacity-60">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="input input-bordered"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="divider">Discount Configuration</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-base-200 rounded-2xl">
                            <div className="form-control">
                                <label className="label text-xs font-bold uppercase tracking-wider opacity-60">Discount Strategy</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            className="radio radio-primary radio-sm"
                                            checked={formData.discountType === "INDIVIDUAL"}
                                            onChange={() => setFormData({ ...formData, discountType: "INDIVIDUAL" })}
                                        />
                                        <span className="text-sm">Individual</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            className="radio radio-primary radio-sm"
                                            checked={formData.discountType === "GLOBAL"}
                                            onChange={() => setFormData({ ...formData, discountType: "GLOBAL" })}
                                        />
                                        <span className="text-sm">Global (%)</span>
                                    </label>
                                </div>
                            </div>
                            {formData.discountType === "GLOBAL" && (
                                <div className="form-control animate-fadeIn">
                                    <label className="label text-xs font-bold uppercase tracking-wider opacity-60">Global Discount %</label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        value={formData.globalDiscountPercent}
                                        onChange={e => setFormData({ ...formData, globalDiscountPercent: parseInt(e.target.value) || 0 })}
                                        min="0" max="100"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Select Products ({formData.products.length})</label>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                    <input
                                        type="text"
                                        className="input input-sm input-bordered pl-10 w-full"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-2xl bg-base-200/30">
                                {filteredProducts.map(product => {
                                    const isConflicting = conflictingProductIds.has(product._id);
                                    const isSelected = formData.products.includes(product._id);

                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => !isConflicting && toggleProduct(product._id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isConflicting
                                                ? "opacity-40 cursor-not-allowed bg-base-200 border-transparent"
                                                : "cursor-pointer"
                                                } ${isSelected
                                                    ? "bg-primary/10 border-primary shadow-sm"
                                                    : !isConflicting && "bg-base-100 border-transparent hover:border-base-300"
                                                }`}
                                        >
                                            <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{product.name}</p>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs opacity-60">{formatCurrency(product.price)}</p>
                                                    {isConflicting && <span className="text-[10px] text-error font-bold px-1.5 py-0.5 bg-error/10 rounded">BUSY</span>}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <button type="button" onClick={closeModal} className="btn px-8">Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary px-12"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {(createMutation.isPending || updateMutation.isPending) && <span className="loading loading-spinner"></span>}
                                {editingSale ? "Save Changes" : "Launch Campaign"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SalesManagementPage;
