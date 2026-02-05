import { useNavigate } from "react-router";
import { LayoutDashboard } from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-base-content/10 bg-base-100/80 backdrop-blur-md">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-base-content">
                        Orderker<span className="text-primary">.</span>
                    </span>
                </div>

                <button
                    onClick={() => navigate("/login")}
                    className="btn btn-primary btn-sm md:btn-md shadow-lg shadow-primary/20 hover:shadow-primary/40 border-none text-primary-content"
                >
                    Admin Login
                </button>
            </div>
        </nav>
    );
}
