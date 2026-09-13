import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import MobileDrawer from "@/components/portal/MobileDrawer";
import PreviewBanner from "@/components/portal/PreviewBanner";
import PortalErrorBoundary from "@/components/portal/PortalErrorBoundary";

export default function PortalLayout({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to));
  const title = current?.label || "Overview";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <PreviewBanner />
        <TopBar title={title} onOpenMenu={() => setMenuOpen(true)} />
        <main id="main-content" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <PortalErrorBoundary>
            {children}
          </PortalErrorBoundary>
        </main>
      </div>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}