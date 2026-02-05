import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useUser, useClerk } from "@clerk/clerk-react"; // Changed from useAuth
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";

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
      <Route path="/login" element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />} />

      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
