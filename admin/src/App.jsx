import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useUser, useClerk } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderChainsPage from "./pages/OrderChainsPage";
import CustomersPage from "./pages/CustomersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SalesManagementPage from "./pages/SalesManagementPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";

import LandingPage from "./pages/LandingPage";
import LegalPage from "./pages/LegalPage";

import logo from "./assets/logo.png";
import { ShieldAlert } from "lucide-react";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return <PageLoader />;
  // Role Check: If signed in but NOT admin, show Access Denied
  if (isSignedIn && user?.publicMetadata?.role !== "admin") {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen gap-8 px-6 overflow-hidden bg-base-100">
        {/* Background Glows */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-error/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8 opacity-0 animate-[fadeIn_0.5s_ease-out_0.1s_forwards]">
            <img src={logo} alt="Orderker" className="w-10 h-10 object-contain" />
            <h2 className="text-2xl font-bold tracking-tight text-base-content">
              Orderker<span className="text-primary">.</span>
            </h2>
          </div>

          {/* Alert Icon */}
          <div className="flex items-center justify-center mb-6 opacity-0 animate-[fadeInScale_0.5s_ease-out_0.3s_forwards]">
            <div className="p-4 rounded-full bg-error/10 border border-error/20">
              <ShieldAlert className="w-12 h-12 text-error" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-base-content opacity-0 animate-[fadeInUp_0.5s_ease-out_0.5s_forwards]">
            Access Denied
          </h1>

          {/* Description */}
          <p className="mb-8 text-base-content/60 opacity-0 animate-[fadeIn_0.5s_ease-out_0.7s_forwards]">
            You don't have permission to access the Admin Dashboard. If you believe this is an error, try syncing your permissions below.
          </p>

          {/* Sync Button */}
          <div className="mb-4 opacity-0 animate-[fadeInScale_0.5s_ease-out_0.9s_forwards]">
            <SyncRoleButton />
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut()}
            className="btn btn-outline btn-sm text-base-content/60 hover:text-base-content opacity-0 animate-[fadeIn_0.5s_ease-out_1.1s_forwards]"
          >
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <Routes>
        {/* If signed in & admin, go straight to dashboard. Otherwise show Landing Page */}
        <Route path="/" element={isSignedIn && user?.publicMetadata?.role === "admin" ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/support" element={<LegalPage />} />
        <Route path="/status" element={<LegalPage />} />

        {/* Route for dedicated login page */}
        <Route path="/login" element={isSignedIn && user?.publicMetadata?.role === "admin" ? <Navigate to="/dashboard" /> : <LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={isSignedIn ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sales" element={<SalesManagementPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="order-chains" element={<OrderChainsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
        </Route>
      </Routes>
    </>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

function SyncRoleButton() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSync = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/sync-role`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.role === "admin") {
        setMsg("Permissions updated! Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMsg("You are not listed as an admin.");
      }
    } catch (error) {
      console.error(error);
      setMsg("Failed to sync permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleSync}
        disabled={loading}
        className="btn btn-primary btn-wide shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50"
      >
        {loading ? "Checking Permissions..." : "Check Permissions Again"}
      </button>
      {msg && (
        <div className={`mt-3 text-sm ${msg.includes("updated") ? "text-success" : msg.includes("not listed") ? "text-warning" : "text-error"}`}>
          {msg}
        </div>
      )}
    </div>
  );
}

export default App;
