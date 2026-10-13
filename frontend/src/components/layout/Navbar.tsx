import { NavLink } from "react-router-dom";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "../ui/button";
import type { AuthUser } from "../../lib/types";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
];

const protectedNavItems = [
  { label: "Analyze", to: "/analyze" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "History", to: "/history" },
  { label: "Models", to: "/models" },
];

interface NavbarProps {
  onLogout: () => void | Promise<void>;
  user: AuthUser | null;
}

function Navbar({ onLogout, user }: NavbarProps) {
  const displayName = user?.name.split(" ")[0] ?? "";
  const visibleNavItems = user ? [...navItems.slice(0, 1), ...protectedNavItems, ...navItems.slice(1)] : navItems;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071114]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8" aria-label="Primary navigation">
        <NavLink className="flex items-center gap-3 text-sm font-semibold text-white" to="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/10">
            <ShieldCheck className="h-5 w-5 text-teal-300" />
          </span>
          Network Security
        </NavLink>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:justify-end">
          <div className="flex flex-wrap gap-2 text-sm text-slate-300">
            {visibleNavItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${
                    isActive ? "bg-white/10 text-white" : "hover:bg-white/10 hover:text-white"
                  }`
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1 pl-3">
              <UserRound className="h-4 w-4 text-teal-300" />
              <span className="max-w-28 truncate text-sm font-medium text-white">{displayName}</span>
              <Button className="h-8 px-2 text-xs" onClick={() => void onLogout()} size="sm" type="button" variant="secondary">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button asChild className="h-9 px-3" size="sm" variant="secondary">
              <NavLink to="/auth">
                <UserRound className="h-4 w-4" />
                Sign in
              </NavLink>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export { Navbar };
