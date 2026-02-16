import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";

const COLORS = ["#5E2D87", "#F59E0B", "#10B981", "#EF4444"];

function StatusChart({ data }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="card h-full bg-white border border-base-200 shadow-sm min-h-[300px]" />;

    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
                No order data available
            </div>
        );
    }

    return (
        <div className="card h-full bg-white border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
                <h3 className="card-title text-lg font-bold text-gray-800 mb-4">Order Status</h3>
                <div style={{ width: '100%', height: 300, minWidth: 0, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="_id"
                            >
                                {data.map((entry, index) => {
                                    let color = COLORS[index % COLORS.length];
                                    if (entry._id === "pending") color = "#F59E0B"; // Amber
                                    if (entry._id === "shipped") color = "#3B82F6"; // Blue
                                    if (entry._id === "delivered") color = "#10B981"; // Emerald
                                    if (entry._id === "cancelled") color = "#EF4444"; // Red
                                    return <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />;
                                })}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                itemStyle={{ fontWeight: "bold" }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-gray-600 font-medium capitalize ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default StatusChart;
