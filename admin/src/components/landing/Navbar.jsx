import { useNavigate } from "react-router";
import logo from "../../assets/logo.png";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 glass-navbar">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate("/")}
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-primary/20 group-hover:-rotate-3">
                        <img src={logo} alt="Orderker" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-800">
                        Orderker<span className="text-primary">.</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="btn btn-primary btn-md rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 border-none text-white font-bold tracking-tight hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        Admin Login
                    </button>
                </div>
            </div>
        </nav>
    );
}
