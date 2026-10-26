import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import type { AuthUser } from "../../lib/types";

interface AppLayoutProps {
  onLogout: () => void | Promise<void>;
  user: AuthUser | null;
}

function AppLayout({ onLogout, user }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col cyber-bg text-slate-100 antialiased selection:bg-cyan-500/30">
      <Navbar onLogout={onLogout} user={user} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export { AppLayout };
