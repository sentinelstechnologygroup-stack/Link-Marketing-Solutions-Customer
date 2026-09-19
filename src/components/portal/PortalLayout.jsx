import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import MobileDrawer from "@/components/portal/MobileDrawer";
import PreviewBanner from "@/components/portal/PreviewBanner";
import PortalErrorBoundary from "@/components/portal/PortalErrorBoundary";
import { isFixtureDataMode } from "@/services/portalAdapter";

export default function PortalLayout({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to));
  const title = current?.label || "Overview";

  return (
    <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: "var(--cream)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[264px] min-w-[264px] shrink-0 h-screen sticky top-0 overflow-hidden">
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 w-0 flex flex-col">
        {isFixtureDataMode && <PreviewBanner />}
        <TopBar title={title} onOpenMenu={() => setMenuOpen(true)} />
        <main id="main-content" className="flex-1 min-w-0 w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <PortalErrorBoundary>
            {children}
          </PortalErrorBoundary>
        </main>
      </div>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
