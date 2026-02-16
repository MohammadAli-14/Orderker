import { UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router";
import { MenuIcon } from "lucide-react";

function Navbar({ onToggleSidebar }) {
  const { pathname } = useLocation();

  // Helper to get title from path
  const getPageTitle = (path) => {
    switch (path) {
      case "/": return "Dashboard";
      case "/products": return "Product Management";
      case "/orders": return "Order Management";
      case "/customers": return "Customer Overview";
      case "/analytics": return "Analytics & Reports";
      default: return "Dashboard";
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-base-300 px-4 md:px-8 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-primary transition-colors"
        >
          <MenuIcon className="size-6" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-base-content tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[10px] md:text-xs text-base-content/50 font-medium">
            Welcome back, Admin
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="divider divider-horizontal mx-0 h-8 opacity-20 hidden md:flex"></div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8 md:size-10 ring-2 ring-primary/20 hover:ring-primary transition-all duration-300",
              userButtonPopoverCard: "shadow-xl border border-base-200"
            }
          }}
        />
      </div>
    </div>
  );
}

export default Navbar;
