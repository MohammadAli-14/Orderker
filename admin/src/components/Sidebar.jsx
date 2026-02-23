import { Link, useLocation } from "react-router";
import {
  UsersIcon,
  LayoutDashboardIcon,
  ShoppingBagIcon,
  SettingsIcon,
  ListOrderedIcon,
  Link2,
  LogOutIcon,
  ZapIcon
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";

const sidebarLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/products", label: "Products", icon: ShoppingBagIcon },
  { href: "/sales", label: "Sales Management", icon: ZapIcon },
  { href: "/orders", label: "Orders", icon: ListOrderedIcon },
  { href: "/order-chains", label: "Order Chains", icon: Link2 },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/analytics", label: "Analytics", icon: SettingsIcon },
];

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { pathname } = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-gradient text-white flex flex-col h-full shadow-2xl transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* BRAND HEADER */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/20">
            <img src="/favicon.png" alt="Orderker Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Orderker</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60 font-medium">Admin Panel</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-white/70 hover:text-white"
        >
          <LogOutIcon className="size-5 rotate-180" />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Main Menu</p>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              to={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "bg-white text-primary font-bold shadow-lg shadow-black/10 scale-[1.02]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon
                className={`size-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-sm">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="avatar placeholder">
            <div className="bg-white/20 text-white rounded-full w-10 border border-white/20">
              <img src={user?.imageUrl} alt={user?.fullName} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.fullName || "Admin User"}</p>
            <p className="text-xs text-white/50 truncate">Administrator</p>
          </div>
          <button
            onClick={() => signOut()}
            className="btn btn-ghost btn-circle btn-sm text-white/60 hover:text-white hover:bg-red-500/20"
            title="Sign Out"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
