import { useCallback, useEffect, useState } from "react";
import { PortalApiError } from "@/services/portalAdapter";

// Generic adapter fetch hook with loading / error / retry states.
export function usePortalData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const timeout = new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("This section is taking longer than expected.")), 12000);
      });
      const result = await Promise.race([fetcher(), timeout]);
      setData(result);
    } catch (e) {
      if (e instanceof PortalApiError && e.status === 401) {
        // session expired — let the auth context / route guard handle redirect
        setError({ status: 401, message: "Your session has expired. Please sign in again." });
      } else {
        setError({ message: e?.message || "Unable to load this section." });
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, retry: run, setData };
}
