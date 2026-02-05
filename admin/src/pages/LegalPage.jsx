import { useParams, useLocation, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
    const { pathname } = useLocation();

    // Simple mapping based on path
    const getContent = () => {
        switch (pathname) {
            case "/privacy": return { title: "Privacy Policy", content: "Your privacy is important to us. This policy outlines how we handle your data." };
            case "/terms": return { title: "Terms of Service", content: "By using Orderker, you agree to these terms governing your use of the platform." };
            case "/support": return { title: "Support", content: "Need help? Contact our support team at support@orderker.com or call our Karachi helpline." };
            case "/status": return { title: "System Status", content: "All systems operational. \n\n Database: Operational \n API: Operational \n Payments: Operational" };
            default: return { title: "Page Not Found", content: "The requested page does not exist." };
        }
    };

    const { title, content } = getContent();

    return (
        <div className="min-h-screen bg-base-100 text-base-content font-inter p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="btn btn-ghost mb-8 gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>

                <div className="card bg-base-200 shadow-xl border border-base-300">
                    <div className="card-body">
                        <h1 className="text-3xl font-bold mb-4 text-primary">{title}</h1>
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-line text-lg opacity-80 leading-relaxed">
                                {content}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-40 text-sm">
                    &copy; {new Date().getFullYear()} Orderker Operations
                </div>
            </div>
        </div>
    );
}
