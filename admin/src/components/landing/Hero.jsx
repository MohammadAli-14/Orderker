import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShoppingBag, Truck, TrendingUp, Package } from "lucide-react";
import axios from "axios";
import logo from "../../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function fetchPublicStats() {
    return axios.get(`${API_BASE}/public/stats`).then((res) => res.data);
}

export default function Hero() {
    const navigate = useNavigate();

    const { data: stats } = useQuery({
        queryKey: ["public-stats"],
        queryFn: fetchPublicStats,
        retry: 1,
        staleTime: 120000,
    });

    const formatRevenue = (val) => {
        if (!val) return "—";
        if (val >= 1000000) return `Rs. ${(val / 1000000).toFixed(1)}M+`;
        if (val >= 1000) return `Rs. ${(val / 1000).toFixed(1)}K+`;
        return `Rs. ${val}`;
    };

    return (
        <section className="relative pt-24 pb-16 overflow-hidden lg:pt-36 lg:pb-24 bg-[#F9FAFB]">
            {/* Background Decorative Elements */}
            <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 px-6 mx-auto text-center max-w-7xl">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2.5 px-5 py-2 mb-10 text-xs font-bold uppercase tracking-widest border rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm animate-fadeInUp">
                    <span className="relative flex w-2.5 h-2.5">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary" />
                        <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-primary" />
                    </span>
                    Live Operations in Karachi
                </div>

                {/* Headline */}
                <div className="max-w-5xl mx-auto mb-10">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-8">
                        <span className="block opacity-0 animate-[fadeInUp_0.7s_ease-out_0.2s_forwards]">
                            Powering smarter
                        </span>
                        <span className="text-primary opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards] block mt-2">
                            grocery operations<span className="text-secondary">.</span>
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl font-medium text-slate-500/80 leading-relaxed opacity-0 animate-[fadeIn_0.7s_ease-out_0.6s_forwards]">
                        The enterprise-grade infrastructure for inventory control,
                        vendor management, and real-time delivery logistics in Karachi.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center justify-center gap-5 sm:flex-row opacity-0 animate-[fadeInScale_0.6s_ease-out_0.8s_forwards]">
                    <button
                        onClick={() => navigate("/login")}
                        className="btn btn-primary btn-lg rounded-2xl px-10 h-16 shadow-2xl shadow-primary/30 hover:shadow-primary/50 border-none text-white text-lg font-black tracking-tight hover:scale-102 active:scale-98 transition-all duration-300"
                    >
                        Access Dashboard
                        <ArrowRight className="w-5 h-5 ml-2 stroke-[3px]" />
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-ghost btn-lg h-16 rounded-2xl px-10 text-slate-600 font-bold hover:bg-slate-100 transition-all duration-300"
                    >
                        Explore Features
                    </button>
                </div>

                {/* Stats Section with Glassmorphism */}
                <div className="relative mt-20 md:mt-32 max-w-5xl mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-[40px] blur-3xl opacity-50 -z-10" />

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 opacity-0 animate-[fadeInUp_0.8s_ease-out_1s_forwards]">
                        <StatsCard
                            label="Total Orders"
                            value={stats?.totalOrders ? `${stats.totalOrders.toLocaleString()}` : "1,240+"}
                            icon={ShoppingBag}
                            trend="+12%"
                            color="text-primary"
                            iconBg="bg-primary/10"
                        />
                        <StatsCard
                            label="Net Revenue"
                            value={stats?.totalRevenue ? formatRevenue(stats.totalRevenue) : "Rs. 2.4M"}
                            icon={TrendingUp}
                            trend="+8.4%"
                            color="text-emerald-500"
                            iconBg="bg-emerald-50"
                        />
                        <StatsCard
                            label="Active Items"
                            value={stats?.activeProducts ? `${stats.activeProducts}` : "850+"}
                            icon={Package}
                            trend="Live"
                            color="text-blue-500"
                            iconBg="bg-blue-50"
                        />
                        <StatsCard
                            label="Delivery Hub"
                            value="Karachi"
                            icon={Truck}
                            trend="24/7"
                            color="text-amber-500"
                            iconBg="bg-amber-50"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatsCard({ label, value, icon: Icon, trend, color, iconBg }) {
    return (
        <div className="group relative glass-card p-6 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[80px] transition-transform duration-500 group-hover:scale-110`} />

            <div className="relative z-10 text-left">
                <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-2xl ${iconBg} ${color} border border-white/50 shadow-sm transition-transform duration-500 group-hover:rotate-6`}>
                        <Icon className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/80 border border-slate-100 shadow-sm ${color}`}>
                        {trend}
                    </span>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                    <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 tabular-nums">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
