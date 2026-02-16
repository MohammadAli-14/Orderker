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
                <div style={{ width: '100%', height: 300, minWidth: 0, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fill: "#4B5563", fontSize: 11, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                formatter={(value, name) => [value, name === "sales" ? "Units Sold" : name]}
                            />
                            <Bar
                                dataKey="sales"
                                fill="#5E2D87"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default TopProductsChart;
