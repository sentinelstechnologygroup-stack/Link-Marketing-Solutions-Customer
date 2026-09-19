import { getFirebaseConfig } from "@/lib/firebaseConfig"

const isNode = typeof window === "undefined";
const firebaseConfig = getFirebaseConfig()

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === "true";

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('portal_access_token');
	window.localStorage.removeItem('token');
}

const getStoredAccessToken = () => {
  if (isNode) return "";
  return window.localStorage.getItem("portal_access_token") || "";
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		appId:
      import.meta.env.VITE_PORTAL_APP_ID ||
      import.meta.env.VITE_FIREBASE_CUSTOMER_PORTAL_APP_ID ||
      firebaseConfig.appId ||
      "customer-portal",
		token: getStoredAccessToken(),
		functionsVersion: import.meta.env.VITE_PORTAL_FUNCTIONS_VERSION || "v1",
		appBaseUrl: import.meta.env.VITE_PORTAL_APP_BASE_URL || "",
	}
}


export const appParams = {
	...getAppParams()
}
