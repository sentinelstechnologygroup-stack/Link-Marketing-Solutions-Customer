import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const required = ["apiKey", "authDomain", "projectId", "appId"];
const env = (key) => import.meta.env?.[key] || "";

export const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_CUSTOMER_PORTAL_API_KEY"),
  authDomain: env("VITE_FIREBASE_CUSTOMER_PORTAL_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_CUSTOMER_PORTAL_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_CUSTOMER_PORTAL_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_CUSTOMER_PORTAL_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_CUSTOMER_PORTAL_APP_ID"),
};

export const firebaseConfigured = required.every((key) => Boolean(firebaseConfig[key]));
export const firebaseApp = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
const appCheckSiteKey = env("VITE_FIREBASE_CUSTOMER_PORTAL_APP_CHECK_SITE_KEY");
export const firebaseAppCheck = firebaseApp && appCheckSiteKey && typeof window !== "undefined"
  ? initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseFunctions = firebaseApp ? getFunctions(firebaseApp, "us-central1") : null;
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;

if (firebaseApp && import.meta.env.DEV && env("VITE_FIREBASE_USE_EMULATORS") === "true") {
  connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFunctionsEmulator(firebaseFunctions, "127.0.0.1", 5001);
  connectFirestoreEmulator(firebaseDb, "127.0.0.1", 8080);
  connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
}
