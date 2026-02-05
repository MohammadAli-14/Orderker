import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className="py-12 border-t border-base-content/10 bg-base-200">
            <div className="px-6 mx-auto text-center max-w-7xl">
                <p className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-base-content">
                    Orderker<span className="text-primary">.</span>
                </p>
                <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium text-base-content/60">
                    <Link to="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms of Service</Link>
                    <Link to="/support" className="hover:text-primary transition-colors cursor-pointer">Support</Link>
                    <Link to="/status" className="hover:text-primary transition-colors cursor-pointer">Status</Link>
                </div>
                <p className="text-sm text-base-content/40">
                    &copy; {new Date().getFullYear()} Orderker Operations. Designed for Karachi.
                </p>
            </div>
        </footer>
    );
}
