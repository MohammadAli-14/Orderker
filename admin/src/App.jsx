import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useUser, useClerk } from "@clerk/clerk-react"; // Changed from useAuth
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";

import LandingPage from "./pages/LandingPage";
import LegalPage from "./pages/LegalPage";

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return <PageLoader />;
  // Role Check: If signed in but NOT admin, show Access Denied
  if (isSignedIn && user?.publicMetadata?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>You do not have permission to access the Admin Dashboard.</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Sign Out & Try Again
        </button>
      </div>
    );
  }

  return (
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
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
