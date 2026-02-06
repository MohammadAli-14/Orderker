import { useNavigate } from "react-router";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
            {/* Background Glows (Using Forest Theme Colors) */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />

            <div className="relative z-10 px-6 mx-auto text-center max-w-7xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border rounded-full border-primary/20 bg-primary/5 text-primary">
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary" />
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
                    </span>
                    Live in Karachi
                </div>

                <h1 className="max-w-4xl mx-auto mb-6 text-5xl font-extrabold tracking-tight md:text-7xl text-base-content">
                    <span className="inline-block opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
                        Powering smarter
                    </span>{" "}
                    <br />
                    <span className="text-primary">
                        <span className="inline-block opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
                            grocery
                        </span>{" "}
                        <span className="inline-block opacity-0 animate-[fadeInUp_0.6s_ease-out_0.65s_forwards]">
                            operations.
                        </span>
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto mb-10 text-lg text-base-content/60 md:text-xl opacity-0 animate-[fadeIn_0.6s_ease-out_0.9s_forwards]">
                    Complete control over inventory, vendor monitoring, and delivery zones across Karachi.
                    Built for high-volume daily essentials.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => navigate("/login")}
                        className="btn btn-primary btn-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 border-none text-primary-content opacity-0 animate-[fadeInScale_0.5s_ease-out_1.1s_forwards] hover:scale-105 transition-transform"
                    >
                        Access Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-outline btn-lg text-base-content hover:bg-base-content hover:text-base-100 opacity-0 animate-[fadeInScale_0.5s_ease-out_1.3s_forwards]"
                    >
                        Learn More
                    </button>
                </div>

                {/* Floating cards visual for trustworthiness */}
                <div className="relative mt-20 md:mt-28">
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
                    <div className="grid grid-cols-1 gap-6 mx-auto max-w-3xl md:grid-cols-3 opacity-90 rotate-x-12 perspective-1000">
                        <StatsCard label="Active Orders" value="14" icon={ShoppingBag} color="text-primary" glow="primary" />
                        <StatsCard label="Daily Revenue" value="Rs 42.5K" icon={null} color="text-base-content" highlight glow="secondary" />
                        <StatsCard label="Active Riders" value="5" icon={Truck} color="text-accent" glow="accent" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatsCard({ label, value, icon: Icon, color, highlight, glow }) {
    const glowColors = {
        primary: "group-hover:shadow-primary/20",
        secondary: "group-hover:shadow-secondary/20",
        accent: "group-hover:shadow-accent/20",
    };

    return (
        <div className={`group relative p-6 border rounded-2xl backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${glowColors[glow]} 
            ${highlight
                ? 'bg-base-content/10 border-base-content/20'
                : 'bg-base-200/60 border-base-content/10'
            }`}>
            {/* Inner Glow Gradient */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-tr ${highlight ? 'from-secondary to-accent' : 'from-primary to-secondary'}`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-base-content/60">{label}</span>
                    {Icon && (
                        <div className={`p-2 rounded-lg bg-base-100/50 border border-base-content/10 ${color}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <div className={`text-3xl font-bold tracking-tight ${highlight ? 'text-base-content' : 'text-base-content'}`}>
                    {value}
                </div>
                {highlight && <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    +12% vs yesterday
                </div>}
            </div>
        </div>
    )
}
