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
  const displayName = user?.name ? user.name.split(" ")[0] : "Guest";
  const visibleNavItems = user ? [...navItems.slice(0, 1), ...protectedNavItems, ...navItems.slice(1)] : navItems;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070d17]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8" aria-label="Primary navigation">
        {/* Brand */}
        <NavLink className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white transition hover:opacity-90" to="/">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" />
          </span>
          <span>Network Security</span>
        </NavLink>

        {/* Center Nav items with active underline / glow */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] p-1 px-3">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `relative px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-cyan-400 after:shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    : "text-slate-300 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right User / Auth controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-1 pl-3">
              <UserRound className="h-4 w-4 text-cyan-400" />
              <span className="max-w-28 truncate text-xs font-semibold text-cyan-200">{displayName}</span>
              <Button
                className="h-7 border-white/10 bg-white/5 px-2.5 text-xs text-slate-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                onClick={() => void onLogout()}
                size="sm"
                type="button"
                variant="secondary"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button asChild className="h-8 border-cyan-500/30 bg-cyan-500/10 px-3.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.2)]" size="sm" variant="secondary">
              <NavLink to="/auth">
                <UserRound className="h-3.5 w-3.5 mr-1" />
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
