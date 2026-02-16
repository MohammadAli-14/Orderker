import { Link } from "react-router";
import logo from "../../assets/logo.png";

export default function Footer() {
    return (
        <footer className="py-20 border-t border-slate-100 bg-[#F8FAFC]">
            <div className="px-6 mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col items-center md:items-start transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <img src={logo} alt="Orderker" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-2xl font-black text-slate-800 tracking-tighter">
                                Orderker<span className="text-primary">.</span>
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium text-sm max-w-xs text-center md:text-left">
                            Pakistan's most advanced grocery operations platform.
                            Built with precision for the streets of Karachi.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm font-black text-slate-500/80 uppercase tracking-widest">
                            <Link to="/privacy" className="hover:text-primary transition-all duration-300">Privacy</Link>
                            <Link to="/terms" className="hover:text-primary transition-all duration-300">Terms</Link>
                            <Link to="/support" className="hover:text-primary transition-all duration-300">Support</Link>
                            <Link to="/status" className="hover:text-primary transition-all duration-300">Status</Link>
                        </div>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
                            &copy; {new Date().getFullYear()} Orderker Core. Enterprise Operations.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
