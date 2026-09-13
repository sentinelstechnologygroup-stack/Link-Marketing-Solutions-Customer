import { useEffect } from "react";

export default function PortalSplash({ onComplete, mode = "entry" }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const timer = window.setTimeout(onComplete, reduceMotion ? 120 : mode === "dashboard" ? 1550 : 1850);
    return () => window.clearTimeout(timer);
  }, [mode, onComplete]);

  return (
    <div className="portal-splash" role="status" aria-live="polite" aria-label={mode === "dashboard" ? "Opening customer dashboard" : "Opening customer portal"}>
      <div className="portal-splash__aura" aria-hidden="true" />
      <div className="portal-splash__content">
        <div className="portal-splash__logo-stage">
          <img
            src="/link-customer-portal-logo.svg"
            alt="Link Marketing Services Customer Portal"
            className="portal-splash__logo"
            width="1400"
            height="466"
            decoding="sync"
          />
          <span className="portal-splash__light-sweep" aria-hidden="true" />
          <span className="portal-splash__energy-line" aria-hidden="true" />
        </div>
        <div className="portal-splash__status">
          <span>{mode === "dashboard" ? "Access verified" : "Secure customer access"}</span>
          <span className="portal-splash__status-line" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
