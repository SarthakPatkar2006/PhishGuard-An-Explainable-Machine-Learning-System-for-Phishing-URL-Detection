import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { SidebarNavbar } from "./SidebarNavbar";
import type { AuthUser } from "../../lib/types";

interface AppLayoutProps {
  onLogout: () => void | Promise<void>;
  user: AuthUser | null;
}

function AppLayout({ onLogout, user }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen cyber-bg text-slate-100 antialiased selection:bg-cyan-500/30">
      {/* Left Collapsible Sidebar */}
      <SidebarNavbar onLogout={onLogout} user={user} />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex flex-1 flex-col transition-all duration-300 md:pl-20">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export { AppLayout };
