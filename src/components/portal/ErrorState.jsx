import { PortalApiError } from "@/services/portalAdapter";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  const expired = error?.status === 401;
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <AlertTriangle className="w-8 h-8 mb-3" style={{ color: "var(--warn)" }} />
      <h3 className="font-display text-lg font-semibold" style={{ color: "var(--shell)" }}>
        {expired ? "Session expired" : "Couldn’t load this section"}
      </h3>
      <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--muted-ink)" }}>
        {error?.message || "A connection problem prevented this data from loading."}
      </p>
      {onRetry && !expired && (
        <button
          onClick={onRetry}
          className="mt-4 touch-target inline-flex items-center gap-2 px-4 rounded-md text-sm font-medium text-white focus-ring"
          style={{ background: "var(--shell)" }}
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}