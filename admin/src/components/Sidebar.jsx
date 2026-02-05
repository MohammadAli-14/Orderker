import { useUser } from "@clerk/clerk-react";

import { Link, useLocation } from "react-router";
import { NAVIGATION } from "./Navbar";

import logo from "../assets/logo.png";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

      <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
        <div className="p-4 w-full">
          <div className="flex items-center gap-3">
            <img src={logo} alt="OrderKer Logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold is-drawer-close:hidden">Admin</span>
          </div>
        </div>

        <ul className="menu w-full grow flex flex-col gap-2">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right 
                    ${isActive ? "bg-primary text-primary-content" : ""}
                  `}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4 w-full">
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              <img src={user?.imageUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
            </div>

            <div className="flex-1 min-w-0 is-drawer-close:hidden">
              <p className="text-sm font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs opacity-60 truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Sidebar;
