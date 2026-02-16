import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "primary" }) {
    const isPositive = trend === "up";

    // Dynamic color classes based on the 'color' prop
    const colorMap = {
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary/10 text-secondary border-secondary/20",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };

    const iconClass = colorMap[color] || colorMap.primary;

    return (
        <div className="card bg-white border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${iconClass}`}>
                        <Icon className="size-6" />
                    </div>
                </div>

                {/* Trend Indicator (Optional) */}
                {trendValue && (
                    <div className="mt-4 flex items-center gap-2">
                        <span
                            className={`
                flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full
                ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              `}
                        >
                            {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                            {trendValue}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatsCard;
