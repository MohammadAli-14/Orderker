import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, LayoutDashboard, Package, ShoppingBag, X } from "lucide-react";

function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
        if (!hasSeenOnboarding) {
            // Small delay for better UX
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding", "true");
    };

    const steps = [
        {
            title: "Welcome to Orderker Admin",
            description: "Your new command center for managing your e-commerce business using the modern design system.",
            icon: <LayoutDashboard className="size-12 text-primary" />,
            action: "Get Started",
        },
        {
            title: "Manage Products",
            description: "Easily add, edit, and organize your inventory. Upload images and track stock levels in real-time.",
            icon: <Package className="size-12 text-secondary" />,
            action: "Next",
        },
        {
            title: "Track Orders",
            description: "View incoming orders, update statuses, and monitor your revenue growth with advanced analytics.",
            icon: <ShoppingBag className="size-12 text-emerald-500" />,
            action: "Finish Setup",
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Background Decorative Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative p-8 text-center">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>

                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-base-50 rounded-2xl shadow-inner">
                            {steps[step].icon}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                        {steps[step].title}
                    </h2>

                    <p className="text-gray-500 mb-8 leading-relaxed">
                        {steps[step].description}
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => {
                                if (step < steps.length - 1) {
                                    setStep(step + 1);
                                } else {
                                    handleClose();
                                }
                            }}
                            className="btn btn-primary w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 text-white border-0"
                        >
                            {steps[step].action}
                            {step < steps.length - 1 ? <ChevronRight className="size-4" /> : <CheckCircle2 className="size-4" />}
                        </button>

                        <div className="flex justify-center gap-2 mt-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-primary" : "w-1.5 bg-gray-200"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingModal;
