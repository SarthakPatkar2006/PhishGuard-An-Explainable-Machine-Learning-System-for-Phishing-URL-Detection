import { NavLink } from "react-router-dom";
import { 
  ShieldCheck, 
  Home, 
  Radar, 
  LayoutDashboard, 
  History, 
  Cpu, 
  Info, 
  LogOut, 
  UserRound, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import type { AuthUser } from "../../lib/types";
import sidebarShieldImg from "../../assets/sidebar-shield.png";

interface SidebarNavbarProps {
  onLogout: () => void | Promise<void>;
  user: AuthUser | null;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Analyze", to: "/analyze", icon: Radar },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "History", to: "/history", icon: History },
  { label: "Models", to: "/models", icon: Cpu },
  { label: "About", to: "/about", icon: Info },
];

function SidebarNavbar({ onLogout, user, isExpanded: propIsExpanded, onToggleExpanded }: SidebarNavbarProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalExpanded;
  const toggleExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user?.name ? user.name.split(" ")[0] : "Guest";

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#040811]/90 px-4 py-3 backdrop-blur-md">
        <NavLink to="/" className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Network Security
        </NavLink>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-cyan-500/20 bg-[#040813]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${
          isExpanded ? "md:w-64" : "md:w-20"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden" onClick={() => setMobileOpen(false)}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </span>
            <div className={`transition-opacity duration-200 ${isExpanded || mobileOpen ? "opacity-100" : "md:opacity-0 md:w-0"}`}>
              <span className="block text-sm font-black tracking-tight text-white whitespace-nowrap">Network Security</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-semibold">AI Phishing Guard</span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={toggleExpanded}
            className="hidden md:grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition cursor-pointer"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? "border border-cyan-500/50 bg-gradient-to-r from-cyan-500/25 to-teal-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className={`whitespace-nowrap transition-all duration-200 ${isExpanded || mobileOpen ? "opacity-100" : "md:opacity-0 md:w-0 md:overflow-hidden"}`}>
                  {item.label}
                </span>

                {!isExpanded && (
                  <span className="md:group-hover:flex hidden absolute left-full ml-3.5 z-50 whitespace-nowrap rounded-lg border border-cyan-500/30 bg-[#070e1b] px-3 py-1.5 text-xs font-bold text-cyan-200 shadow-xl shadow-black/80">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User's Exact Shield Card in Sidebar (Visible when expanded) */}
        {(isExpanded || mobileOpen) && (
          <div className="p-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-[#061122]/90 p-3.5 text-center shadow-lg shadow-cyan-950/40 backdrop-blur-md">
              <img 
                src={sidebarShieldImg} 
                alt="Stay Safe Online Logo" 
                className="mx-auto h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              />
              <h4 className="mt-2 text-xs font-black text-white tracking-wide">Stay Safe Online</h4>
              <p className="mt-1 text-[10px] text-slate-300 font-medium leading-tight">
                AI-powered phishing detection for a safer web.
              </p>
            </div>
          </div>
        )}

        {/* Compact logo on collapsed view */}
        {!isExpanded && !mobileOpen && (
          <div className="p-2 pb-3 flex justify-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <img src={sidebarShieldImg} alt="Shield Icon" className="h-7 w-7 object-contain" />
            </div>
          </div>
        )}

        {/* User Account / Auth Section */}
        <div className="border-t border-white/10 p-3 bg-[#02050b]/80">
          {user ? (
            <div className={`flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/[0.03] ${isExpanded || mobileOpen ? "justify-between" : "justify-center"}`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <UserRound className="h-4 w-4" />
                </span>
                {(isExpanded || mobileOpen) && (
                  <div className="overflow-hidden">
                    <span className="block text-xs font-bold text-white truncate">{displayName}</span>
                    <span className="block text-[10px] text-emerald-400 font-semibold">● Online</span>
                  </div>
                )}
              </div>
              {(isExpanded || mobileOpen) && (
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <Button
              asChild
              className={`w-full rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)] ${
                !isExpanded && "md:px-2 md:justify-center"
              }`}
              size="sm"
            >
              <NavLink to="/auth" onClick={() => setMobileOpen(false)}>
                <UserRound className="h-4 w-4 shrink-0" />
                {(isExpanded || mobileOpen) && <span className="ml-2 text-xs font-bold">Sign in</span>}
              </NavLink>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

export { SidebarNavbar };
