import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "../../lib/utils";
import { useState, useEffect } from "react";

function RevenueChart({ data, timeRange, setTimeRange }) {
    const ranges = [
        { label: "Today", value: "1d" },
        { label: "7 Days", value: "7d" },
        { label: "30 Days", value: "30d" },
        { label: "12 Months", value: "12m" },
    ];

    // Handle empty data by providing a zero-baseline
    const processedData = !data || data.length === 0 ? (() => {
        if (timeRange === "1d") {
            return [
                { _id: "00:00", amount: 0 },
                { _id: "06:00", amount: 0 },
                { _id: "12:00", amount: 0 },
                { _id: "18:00", amount: 0 },
                { _id: "23:00", amount: 0 },
            ];
        }
        if (timeRange === "12m") {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonth = new Date().getMonth();
            return Array.from({ length: 6 }).map((_, i) => {
                const mIndex = (currentMonth - 5 + i + 12) % 12;
                return { _id: months[mIndex], amount: 0 };
            });
        }
        // Default for 7d and 30d
        return Array.from({ length: 5 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (4 - i));
            return { _id: d.toISOString().split("T")[0], amount: 0 };
        });
    })() : data;

    const isEmpty = !data || data.length === 0;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="card h-full bg-white border border-base-200 shadow-sm min-h-[300px]" />;

    return (
        <div className="card h-full bg-white border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <h3 className="card-title text-lg font-bold text-gray-800">Revenue Trend</h3>
                        {isEmpty && <span className="text-xs text-secondary font-medium">No sales recorded for this period</span>}
                    </div>

                    <div className="join">
                        {ranges.map((range) => (
                            <button
                                key={range.value}
                                className={`join-item btn btn-xs ${timeRange === range.value ? "btn-primary" : "btn-ghost bg-base-100"}`}
                                onClick={() => setTimeRange(range.value)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full min-h-[300px] min-w-0 relative">
                    {isEmpty && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] z-10 pointer-events-none">
                            <div className="bg-white/80 px-4 py-2 rounded-lg border border-base-200 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">Showing zero-baseline trend</p>
                            </div>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                        <AreaChart data={processedData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5E2D87" stopOpacity={isEmpty ? 0.05 : 0.3} />
                                    <stop offset="95%" stopColor="#5E2D87" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="_id"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 10 }}
                                dy={10}
                                interval={timeRange === "1d" ? 0 : "preserveEnd"}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                tickFormatter={(value) => `Rs. ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                itemStyle={{ color: "#5E2D87", fontWeight: "bold" }}
                                formatter={(value) => [formatCurrency(value), "Revenue"]}
                                labelStyle={{ color: "#6B7280", marginBottom: "4px" }}
                                active={!isEmpty}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#5E2D87"
                                strokeWidth={isEmpty ? 1 : 3}
                                strokeDasharray={isEmpty ? "5 5" : "0"}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default RevenueChart;
