import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
import {
    Users, RefreshCw, Banknote, Star, TrendingUp, Package,
    ShoppingBag, BarChart3, ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";

// Hardcoded theme colors — SVG fills don't support oklch(var())
const THEME = {
    primary: "#7c3aed",
    primaryLight: "rgba(124, 58, 237, 0.15)",
    textMuted: "#9ca3af",
    textLight: "#6b7280",
    gridLine: "#e5e7eb",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e7eb",
    oneTimeBuyer: "#d1d5db",
};
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

const SEGMENT_COLORS = {
    Champions: "#10b981",
    Loyal: "#6366f1",
    "At Risk": "#f59e0b",
    New: "#94a3b8",
};

const STAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

function AnalyticsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: analyticsApi.getAll,
        staleTime: 120000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-base-content/50">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-2">
                    <p className="text-error font-medium">Failed to load analytics</p>
                    <p className="text-sm text-base-content/50">{error.message}</p>
                </div>
            </div>
        );
    }

    const { kpis, productFlow, topProducts, customerSegments, repeatPurchase, ratingDistribution, monthlyRevenue } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-base-content">Analytics</h1>
                <p className="text-base-content/50 text-sm">Deep dive into product performance, customer behavior, and RFM insights.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Users} label="Total Customers" value={kpis.totalCustomers} color="primary" />
                <KPICard icon={RefreshCw} label="Repeat Rate" value={`${kpis.repeatRate}%`} color="emerald-500" trend={kpis.repeatRate > 30 ? "up" : "down"} />
                <KPICard icon={Banknote} label="Avg Order Value" value={`Rs. ${kpis.avgOrderValue.toLocaleString()}`} color="indigo-500" />
                <KPICard icon={Star} label="Avg Rating" value={kpis.avgRating} suffix={`/ 5 (${kpis.totalReviewCount})`} color="amber-500" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products Bar Chart */}
                <ChartCard title="Top Products by Sales" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: THEME.textMuted }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 11, fill: THEME.textLight }}
                                tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: `1px solid ${THEME.tooltipBorder}`, background: THEME.tooltipBg }}
                                formatter={(val) => [`${val} units`, "Sold"]}
                            />
                            <Bar dataKey="totalSold" fill={THEME.primary} radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Customer Segments Pie Chart */}
                <ChartCard title="Customer RFM Segments" icon={Users}>
                    <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={customerSegments}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {customerSegments.map((entry) => (
                                        <Cell key={entry.name} fill={SEGMENT_COLORS[entry.name] || "#cbd5e1"} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: `1px solid ${THEME.tooltipBorder}`, background: THEME.tooltipBg }}
                                    formatter={(val, name) => [`${val} customers`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 -mt-2">
                            {customerSegments.map((s) => (
                                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEGMENT_COLORS[s.name] }} />
                                    <span className="text-base-content/70 font-medium">{s.name}</span>
                                    <span className="text-base-content/40">({s.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>

                {/* Rating Distribution */}
                <ChartCard title="Rating Distribution" icon={Star}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingDistribution} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
                            <XAxis
                                dataKey="_id"
                                tick={{ fontSize: 12, fill: THEME.textLight }}
                                tickFormatter={(v) => `${v}★`}
                            />
                            <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: `1px solid ${THEME.tooltipBorder}`, background: THEME.tooltipBg }}
                                formatter={(val, _, props) => [`${val} reviews`, `${props.payload._id}★`]}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {ratingDistribution.map((entry, i) => (
                                    <Cell key={entry._id} fill={STAR_COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Monthly Revenue Area Chart */}
                <ChartCard title="Monthly Revenue Trend" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyRevenue} margin={{ left: 0, right: 10 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: THEME.textMuted }} />
                            <YAxis
                                tick={{ fontSize: 11, fill: THEME.textMuted }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: `1px solid ${THEME.tooltipBorder}`, background: THEME.tooltipBg }}
                                formatter={(val) => [`Rs. ${val.toLocaleString()}`, "Revenue"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke={THEME.primary}
                                strokeWidth={2.5}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Repeat Purchase Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Repeat Purchase Analysis" icon={RefreshCw} className="lg:col-span-1">
                    <div className="flex flex-col items-center gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Repeat Buyers", value: repeatPurchase.repeatBuyers },
                                        { name: "One-Time", value: repeatPurchase.oneTimeBuyers },
                                    ]}
                                    dataKey="value"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill={THEME.oneTimeBuyer} />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: `1px solid ${THEME.tooltipBorder}`, background: THEME.tooltipBg }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center -mt-4">
                            <p className="text-3xl font-black text-emerald-500">{repeatPurchase.repeatRate}%</p>
                            <p className="text-xs text-base-content/50 mt-1">of customers come back to buy again</p>
                        </div>
                        <div className="flex gap-6 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-base-content/60">Repeat ({repeatPurchase.repeatBuyers})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-base-content/15" />
                                <span className="text-base-content/60">One-time ({repeatPurchase.oneTimeBuyers})</span>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                {/* Product Flow Table */}
                <ChartCard title="Product Flow" icon={Package} className="lg:col-span-2">
                    <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                        <table className="table table-sm w-full">
                            <thead className="sticky top-0 bg-base-100 z-10">
                                <tr className="text-xs text-base-content/50 uppercase tracking-wider border-b border-base-content/10">
                                    <th>Product</th>
                                    <th className="text-right">Sold</th>
                                    <th className="text-right">Stock</th>
                                    <th className="text-right">Revenue</th>
                                    <th className="text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productFlow
                                    .sort((a, b) => b.totalSold - a.totalSold)
                                    .map((p) => (
                                        <tr key={p._id || p.name} className={`border-b border-base-content/5 hover:bg-base-content/[0.02] transition-colors group ${p.isGhost ? "opacity-60" : ""}`}>
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative">
                                                        {p.image ? (
                                                            <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-base-content/10" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg border border-dashed border-base-content/20 flex items-center justify-center bg-base-200">
                                                                <Package className="w-4 h-4 text-base-content/20" />
                                                            </div>
                                                        )}
                                                        {p.isGhost && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-base-300 rounded-full border border-base-100 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-base-content/40 rounded-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold text-sm truncate max-w-[140px] ${p.isGhost ? "text-base-content/40 italic" : "text-base-content"}`}>
                                                            {p.name.replace(" (Deleted)", "")}
                                                        </span>
                                                        {p.isGhost ? (
                                                            <span className="text-[10px] text-base-content/30 lowercase italic">Historical record</span>
                                                        ) : (
                                                            <span className="text-[10px] text-primary/60 font-medium">In Inventory</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <span className={`inline-flex items-center gap-1 text-sm font-bold ${p.totalSold > 0 ? "text-primary" : "text-base-content/20"}`}>
                                                    <ShoppingBag className="w-3 h-3 opacity-50" />
                                                    {p.totalSold}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <span className={`text-sm font-bold ${p.isGhost ? "text-base-content/10" : p.stock <= 5 ? "text-error" : p.stock <= 20 ? "text-warning" : "text-base-content/50"}`}>
                                                    {p.isGhost ? "—" : p.stock}
                                                </span>
                                            </td>
                                            <td className="text-right text-sm font-bold text-base-content/70">
                                                <span className={p.revenue === 0 ? "text-base-content/20" : ""}>
                                                    Rs. {p.revenue.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Star className={`w-3 h-3 ${p.averageRating > 0 ? "text-amber-500 fill-amber-500" : "text-base-content/10"}`} />
                                                    <span className={`text-sm font-bold ${p.averageRating > 0 ? "text-base-content/70" : "text-base-content/20"}`}>
                                                        {p.averageRating > 0 ? p.averageRating.toFixed(1) : "—"}
                                                    </span>
                                                    {p.totalReviews > 0 && (
                                                        <span className="text-[10px] text-base-content/30">({p.totalReviews})</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}

function KPICard({ icon: Icon, label, value, color, trend, suffix }) {
    const colorMap = {
        primary: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary" },
        "emerald-500": { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: "text-emerald-500" },
        "indigo-500": { bg: "bg-indigo-500/10", text: "text-indigo-600", icon: "text-indigo-500" },
        "amber-500": { bg: "bg-amber-500/10", text: "text-amber-600", icon: "text-amber-500" },
    };
    const c = colorMap[color] || colorMap.primary;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
            <div className={`absolute -top-4 -right-4 w-20 h-20 ${c.bg} rounded-full opacity-50 blur-xl group-hover:opacity-80 transition-opacity`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${c.bg}`}>
                        <Icon className={`size-4 ${c.icon}`} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-error"}`}>
                            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        </div>
                    )}
                </div>
                <p className="text-2xl font-black tracking-tight text-base-content">{value}</p>
                <p className="text-xs text-base-content/50 mt-1 font-medium">
                    {label}
                    {suffix && <span className="text-base-content/30 ml-1">{suffix}</span>}
                </p>
            </div>
        </div>
    );
}

function ChartCard({ title, icon: Icon, children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-base-content/10 bg-base-100 p-5 ${className}`}>
            <div className="flex items-center gap-2 mb-5">
                {Icon && (
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                    </div>
                )}
                <h3 className="font-semibold text-base-content text-sm">{title}</h3>
            </div>
            {children}
        </div>
    );
}

export default AnalyticsPage;
