import { useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "@/components/portal/Sidebar";

export default function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[280px] max-w-[82vw] shadow-2xl animate-[slideIn_0.2s_ease-out]">
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="touch-target absolute top-3 right-3 z-10 w-9 h-9 rounded-lg flex items-center justify-center text-white focus-ring"
          style={{ background: "var(--shell-3)" }}
        >
          <X className="w-5 h-5" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}