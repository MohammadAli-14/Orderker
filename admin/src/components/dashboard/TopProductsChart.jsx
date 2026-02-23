import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";

function TopProductsChart({ data }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="card h-full bg-white border border-base-200 shadow-sm min-h-[300px]" />;

    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
                No product data available
            </div>
        );
    }

    return (
        <div className="card h-full bg-white border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
                <h3 className="card-title text-lg font-bold text-gray-800 mb-4">Top Selling Products</h3>
                <div style={{ width: '100%', height: 350, minWidth: 0, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            barGap={8}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="var(--color-primary)" />
                                    <stop offset="100%" stopColor="var(--color-secondary)" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(94, 45, 135, 0.04)', radius: 8 }}
                                contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(255, 255, 255, 0.3)",
                                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                    padding: "12px"
                                }}
                                itemStyle={{ color: "var(--color-primary)", fontWeight: "bold" }}
                                formatter={(value) => [`${value} Units`, "Sales"]}
                            />
                            <Bar
                                dataKey="sales"
                                fill="url(#barGradient)"
                                radius={[0, 10, 10, 0]}
                                barSize={32}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default TopProductsChart;
