import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { SidebarNavbar } from "./SidebarNavbar";
import type { AuthUser } from "../../lib/types";

interface AppLayoutProps {
  onLogout: () => void | Promise<void>;
  user: AuthUser | null;
}

function AppLayout({ onLogout, user }: AppLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="relative min-h-screen cyber-bg-global text-slate-100 antialiased selection:bg-cyan-500/30 flex">
      {/* Ambient dark overlay for high contrast & readability */}
      <div className="cyber-overlay" />

      {/* Left Collapsible Sidebar */}
      <SidebarNavbar
        onLogout={onLogout}
        user={user}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded((prev) => !prev)}
      />

      {/* Main Content Area (Offset smoothly by sidebar width on desktop) */}
      <div
        className={`relative z-10 flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "md:pl-64" : "md:pl-20"
        }`}
      >
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export { AppLayout };
