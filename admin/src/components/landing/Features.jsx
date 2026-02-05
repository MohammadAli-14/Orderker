import { MapPin, BarChart3, Package, Users, BellRing, ShieldCheck } from "lucide-react";

export default function Features() {
    const features = [
        {
            title: "Karachi-Wide Zones",
            description: "Manage delivery zones from Clifton to North Nazimabad with precision geofencing.",
            icon: MapPin,
            color: "text-red-400",
        },
        {
            title: "Real-time Analytics",
            description: "Live dashboards tracking orders, revenue, and active rider locations.",
            icon: BarChart3,
            color: "text-blue-400",
        },
        {
            title: "Smart Inventory",
            description: "Automated stock alerts and vendor management for thousands of SKUs.",
            icon: Package,
            color: "text-emerald-400",
        },
        {
            title: "Vendor Portal",
            description: "Seamless onboarding for local suppliers and direct monitoring of their performance.",
            icon: Users,
            color: "text-violet-400",
        },
        {
            title: "Instant Alerts",
            description: "Get notified immediately about critical stock levels or delayed shipments.",
            icon: BellRing,
            color: "text-amber-400",
        },
        {
            title: "Secure Access",
            description: "Role-based access control ensuring only authorized personnel can make changes.",
            icon: ShieldCheck,
            color: "text-cyan-400",
        },
    ];

    return (
        <section id="features" className="py-24 bg-base-200/50">
            <div className="px-6 mx-auto max-w-7xl">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-base-content lg:text-4xl">Everything you need to run operations.</h2>
                    <p className="max-w-xl mx-auto text-base-content/60">
                        A powerful suite of tools designed for the complexities of modern grocery logistics.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-8 transition-all duration-300 border rounded-2xl border-base-content/10 bg-base-100 hover:bg-base-200 hover:-translate-y-1 group"
                        >
                            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 border border-base-content/10 group-hover:border-primary/20">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-base-content">{feature.title}</h3>
                            <p className="leading-relaxed text-base-content/60">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
