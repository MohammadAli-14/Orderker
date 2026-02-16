import { MapPin, BarChart3, Package, Users, BellRing, ShieldCheck } from "lucide-react";

export default function Features() {
    const features = [
        {
            title: "Karachi-Wide Zones",
            description: "Manage delivery zones from Clifton to North Nazimabad with precision geofencing.",
            icon: MapPin,
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            title: "Real-time Analytics",
            description: "Live dashboards tracking orders, revenue, and active rider locations.",
            icon: BarChart3,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            title: "Smart Inventory",
            description: "Automated stock alerts and vendor management for thousands of SKUs.",
            icon: Package,
            color: "text-primary",
            bg: "bg-primary/5",
        },
        {
            title: "Vendor Portal",
            description: "Seamless onboarding for local suppliers and direct monitoring of their performance.",
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
        },
        {
            title: "Instant Alerts",
            description: "Get notified immediately about critical stock levels or delayed shipments.",
            icon: BellRing,
            color: "text-amber-500",
            bg: "bg-amber-50",
        },
        {
            title: "Secure Access",
            description: "Role-based access control ensuring only authorized personnel can make changes.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
        },
    ];

    return (
        <section id="features" className="py-24 bg-white/50">
            <div className="px-6 mx-auto max-w-7xl">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="mb-6 text-4xl font-black text-slate-900 tracking-tight lg:text-5xl">Everything you need to run operations.</h2>
                    <p className="text-lg font-medium text-slate-500 leading-relaxed">
                        A powerful suite of enterprise tools designed for the complexities of modern grocery logistics.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-10 transition-all duration-500 glass-card rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 group"
                        >
                            <div className={`mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} border border-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                                <feature.icon className={`w-7 h-7 ${feature.color} stroke-[2.5px]`} />
                            </div>
                            <h3 className="mb-4 text-2xl font-black text-slate-800 tracking-tight">{feature.title}</h3>
                            <p className="leading-relaxed text-slate-500 font-medium">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
