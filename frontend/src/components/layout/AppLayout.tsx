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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar onLogout={onLogout} user={user} />
      <Outlet />
      <Footer />
    </div>
  );
}

export { AppLayout };
