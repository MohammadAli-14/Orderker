import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import InteractiveMap from "../components/landing/InteractiveMap";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen text-base-content bg-base-100 font-inter selection:bg-primary/20 selection:text-primary">
            <Navbar />
            <Hero />
            <Features />
            <InteractiveMap />
            <Footer />
        </div>
    );
}
