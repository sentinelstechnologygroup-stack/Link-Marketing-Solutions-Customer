// Link Marketing Services — Customer Portal Service Adapter
// ----------------------------------------------------------------------------
// This is the ONLY layer that talks to a backend. Every page and component
// imports from here; nothing in the portal calls portalAuthClient or any data source
// directly. To go live, set VITE_CUSTOMER_PORTAL_API_URL and implement the
// matching endpoints server-side — no UI changes required.
//
// Contract (preview shapes mirror production responses):
//   GET    /auth/session
//   POST   /auth/session            { email, password, trustDevice }
//   DELETE /auth/session
//   POST   /auth/mfa/verify          { code, method, trustDevice }
//   POST   /auth/recovery/request    { email }
//   POST   /auth/recovery/complete    { token, password }
//   GET    /dashboard
//   GET    /leads                    ?search&source&campaign&service&stage&...
//   GET    /leads/:id
//   GET    /appointments
//   GET    /reports                  ?range&compare
//   GET    /billing
//   GET    /billing/invoices/:id
//   POST   /billing/reviews          { invoice, reason, note }
//   GET    /documents
//   POST   /documents                FormData
//   GET    /support
//   POST   /support                  { type, subject, priority, body }
//   GET    /notifications
//   PATCH  /notifications/preferences { preferences }
//   GET    /security
//   GET    /account
//   GET    /account/users
//   POST   /account/users/invite      { email, role }
//
// All live requests use credentials: "include" + cache: "no-store" (secure
// cookie sessions). No tokens, passwords, or secrets are persisted in the
// browser. Preview mode never transmits entered credentials anywhere.

import {
  sampleSession, sampleDashboard, sampleLeads, sampleAppointments,
  sampleReports, sampleBilling, sampleInvoice, sampleDocuments,
  sampleSupport, sampleNotifications, sampleSecurity, sampleAccount,
} from "./sampleData";
import { firebaseAuth, firebaseConfigured, firebaseFunctions, firebaseDb } from "@/lib/firebaseClient";
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";

const API_URL = (import.meta.env && import.meta.env.VITE_CUSTOMER_PORTAL_API_URL) || "";
const PREVIEW_DATA_ENABLED = (import.meta.env && import.meta.env.VITE_PORTAL_PREVIEW_DATA === "true");
const UI_FIXTURES_ENABLED = (import.meta.env && import.meta.env.VITE_PORTAL_UI_FIXTURES === "true");
const BYPASS_ENABLED = (import.meta.env && import.meta.env.VITE_PORTAL_BYPASS_AUTH === "true");
const BYPASS_TOKEN = (import.meta.env && import.meta.env.VITE_PORTAL_BYPASS_TOKEN) || "";
const BYPASS_KEY = "link-marketing-portal-bypass";
export const isPreviewMode = PREVIEW_DATA_ENABLED;
export const isFixtureDataMode = PREVIEW_DATA_ENABLED || UI_FIXTURES_ENABLED;
export const isFirebaseMode = firebaseConfigured && !API_URL;
const DEMO_TENANT_IDS = new Set([
  "tenant-lms-realtor-demo",
  "tenant-golden-cross-demo",
  "tenant-lms-customer-test",
]);
let activeTenantId = null;

const toPortalSession = (profile, user) => {
  const membership = profile?.memberships?.[0] || {};
  activeTenantId = membership.tenantId || null;
  const name = profile?.displayName || user?.displayName || profile?.email || user?.email || "Customer";
  return {
    ...profile,
    user: { id: profile?.uid || user?.uid, name, email: profile?.email || user?.email || "", role: membership.role || "customer", initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() },
    company: { name: membership.tenantName || membership.organizationName || membership.tenantId || "Customer organization", programStatus: membership.active ? "Active" : "Inactive" },
    tenantId: membership.tenantId || null,
  };
};

const isNode = typeof window === "undefined";
const readBypassFromQuery = () => {
  if (isNode) return false;
  try {
    const queryToken = new URLSearchParams(window.location.search).get("portal_bypass_token");
    if (!BYPASS_ENABLED && !BYPASS_TOKEN) return false;

    if (queryToken && BYPASS_TOKEN && queryToken === BYPASS_TOKEN) {
      window.sessionStorage.setItem(BYPASS_KEY, "granted");
      return true;
    }

    if (BYPASS_ENABLED && !BYPASS_TOKEN) {
      return true;
    }

    return window.sessionStorage.getItem(BYPASS_KEY) === "granted";
  } catch {
    return false;
  }
};

// Always let local developers reach the workspace. Production bypass remains
// an explicit deployment setting and must never be inferred from a URL alone.
export const isBypassMode = () => Boolean(import.meta.env.DEV || BYPASS_ENABLED || (isPreviewMode && readBypassFromQuery()));
const isDataFixtureMode = () => Boolean(
  isBypassMode()
  || PREVIEW_DATA_ENABLED
  || (UI_FIXTURES_ENABLED && DEMO_TENANT_IDS.has(activeTenantId))
);

async function getActiveTenantId() {
  const session = await getSession();
  return session?.memberships?.find((membership) => membership.active !== false)?.tenantId || null;
}

async function getTenantRows(collectionName) {
  if (!isFirebaseMode) return null;
  const tenantId = await getActiveTenantId();
  if (!tenantId) return [];
  const snapshot = await getDocs(query(
    collection(firebaseDb, `tenants/${tenantId}/${collectionName}`),
    where("tenantId", "==", tenantId),
    limit(250),
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
export const isPreviewOrBypassMode = () => isBypassMode();

export class PortalApiError extends Error {
  constructor(status, message) {
    super(message || `Request failed (${status})`);
    this.status = status;
    this.name = "PortalApiError";
  }
}

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new PortalApiError(401, "Session expired");
  if (!res.ok) {
    const data = await safeJson(res);
    throw new PortalApiError(res.status, (data && (data.message || data.error)) || `Request failed (${res.status})`);
  }
  return safeJson(res);
}

// ---- Auth -----------------------------------------------------------------
async function getSession() {
  // Hosted previews open directly into the sample customer workspace.
  // A configured production API still requires its real secure session and MFA.
  if (isPreviewOrBypassMode()) { await delay(120); return sampleSession; }
  if (isFirebaseMode) {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    const profile = await httpsCallable(firebaseFunctions, "getMyProfile")();
    return { ...toPortalSession(profile.data, user), access_token: await user.getIdToken() };
  }
  try { return await request("GET", "/auth/session"); } catch (e) { if (e.status === 401) return null; throw e; }
}

async function createSession({ email, password, trustDevice }) {
  if (isPreviewOrBypassMode()) {
    await delay(500);
    // Preview never authenticates against a real identity service. We return a
    // pending-MFA state so the reviewer can walk the full flow with sample data.
    return { status: "mfa_required", methods: ["authenticator", "email"], email, trustDevice };
  }
  if (isFirebaseMode) {
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    const profile = await httpsCallable(firebaseFunctions, "getMyProfile")();
    return { ...toPortalSession(profile.data, firebaseAuth.currentUser), trustDevice: !!trustDevice };
  }
  return request("POST", "/auth/session", { email, password, trustDevice });
}

async function verifyMfa({ code, method, trustDevice }) {
  if (isPreviewOrBypassMode()) {
    await delay(500);
    if (!/^\d{6}$/.test(code || "")) throw new PortalApiError(422, "Invalid code");
    return { ...sampleSession, trustDevice: !!trustDevice };
  }
  return request("POST", "/auth/mfa/verify", { code, method, trustDevice });
}

async function deleteSession() {
  if (isPreviewOrBypassMode()) { await delay(120); return { ok: true }; }
  if (isFirebaseMode) { await signOut(firebaseAuth); return { ok: true }; }
  return request("DELETE", "/auth/session");
}

async function requestRecovery({ email }) {
  if (isPreviewOrBypassMode()) { await delay(400); return { ok: true }; }
  if (isFirebaseMode) {
    await sendPasswordResetEmail(firebaseAuth, email.trim(), { url: `${window.location.origin}/login` });
    return { ok: true };
  }
  return request("POST", "/auth/recovery/request", { email });
}

async function completeRecovery({ token, password }) {
  if (isPreviewOrBypassMode()) {
    await delay(400);
    if (!token || password.length < 8) throw new PortalApiError(422, "Invalid or expired recovery token");
    return { ok: true };
  }
  return request("POST", "/auth/recovery/complete", { token, password });
}

// ---- Data -----------------------------------------------------------------
const getDashboard = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleDashboard);
  if (isFirebaseMode) {
    const session = await getSession();
    const tenantId = session?.memberships?.[0]?.tenantId;
    if (!tenantId) return null;
    const snapshot = await getDoc(doc(firebaseDb, `tenants/${tenantId}/dashboard/summary`));
    return snapshot.exists() ? snapshot.data() : null;
  }
  return request("GET", "/dashboard");
};

function getLeads(params = {}) {
  if (isDataFixtureMode()) {
    return delay().then(() => {
      let rows = [...sampleLeads];
      const { search, source, campaign, service, stage, qualification, handoff, disposition, rep } = params;
      if (search) {
        const q = search.toLowerCase();
        rows = rows.filter((r) => [r.name, r.email, r.phone, r.campaign, r.location].join(" ").toLowerCase().includes(q));
      }
      if (source && source !== "all") rows = rows.filter((r) => r.source === source);
      if (campaign && campaign !== "all") rows = rows.filter((r) => r.campaign === campaign);
      if (service && service !== "all") rows = rows.filter((r) => r.service === service);
      if (stage && stage !== "all") rows = rows.filter((r) => r.stage === stage);
      if (qualification && qualification !== "all") rows = rows.filter((r) => r.qualification === qualification);
      if (handoff && handoff !== "all") rows = rows.filter((r) => (r.handoffType || "None") === handoff);
      if (disposition && disposition !== "all") rows = rows.filter((r) => r.disposition.startsWith(disposition));
      if (rep && rep !== "all") rows = rows.filter((r) => r.rep === rep);
      return { total: rows.length, rows };
    });
  }
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== "all")).toString();
  return request("GET", `/leads${qs ? `?${qs}` : ""}`);
}

const getLead = async (id) => {
  if (isDataFixtureMode()) return delay().then(() => sampleLeads.find((l) => l.id === id) || null);
  if (isFirebaseMode) { const tenantId = await getActiveTenantId(); if (!tenantId) return null; const snapshot = await getDoc(doc(firebaseDb, `tenants/${tenantId}/leads/${id}`)); return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null; }
  return request("GET", `/leads/${id}`);
};
const getAppointments = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleAppointments);
  if (isFirebaseMode) return getTenantRows("appointments");
  return request("GET", "/appointments");
};
const getReports = async (params) => {
  if (isDataFixtureMode()) return delay().then(() => sampleReports);
  if (isFirebaseMode) return { range: params?.range || null, rows: await getTenantRows("reports") };
  return request("GET", `/reports${params?.range ? `?range=${params.range}` : ""}`);
};
const getBilling = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleBilling);
  if (isFirebaseMode) { const rows = await getTenantRows("billing"); return rows[0] || { invoices: [] }; }
  return request("GET", "/billing");
};
const getInvoice = (id) => (isDataFixtureMode() ? delay().then(() => sampleInvoice) : request("GET", `/billing/invoices/${id}`));
const createBillingReview = (data) => (isDataFixtureMode() ? delay().then(() => ({ ok: true, id: `rev_${Date.now()}`, ...data, status: "Submitted" })) : request("POST", "/billing/reviews", data));
const getDocuments = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleDocuments);
  if (isFirebaseMode) return getTenantRows("documents");
  return request("GET", "/documents");
};
const createDocument = (formData) => (isDataFixtureMode() ? delay(400).then(() => ({ ok: true, id: `doc_${Date.now()}` })) : request("POST", "/documents", formData));
const getSupport = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleSupport);
  if (isFirebaseMode) return getTenantRows("supportRequests");
  return request("GET", "/support");
};
const createSupport = (data) => (isDataFixtureMode() ? delay(400).then(() => ({ ok: true, id: `sr_${Date.now()}`, ...data, status: "Open" })) : request("POST", "/support", data));
const getNotifications = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleNotifications);
  if (isFirebaseMode) { const user = firebaseAuth.currentUser; const rows = await getTenantRows("notifications"); return rows.filter((item) => !item.recipientUid || item.recipientUid === user?.uid); }
  return request("GET", "/notifications");
};
const updateNotifications = (prefs) => (isDataFixtureMode() ? delay().then(() => ({ ok: true, preferences: prefs })) : request("PATCH", "/notifications/preferences", { preferences: prefs }));
const getSecurity = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleSecurity);
  if (isFirebaseMode) return { mfaEnabled: !!firebaseAuth.currentUser?.multiFactor?.enrolledFactors?.length, sessions: [], trustedDevices: [], recentSignIns: [] };
  return request("GET", "/security");
};
const getAccount = async () => {
  if (isDataFixtureMode()) return delay().then(() => sampleAccount);
  if (isFirebaseMode) { const tenantId = await getActiveTenantId(); if (!tenantId) return null; const tenant = await getDoc(doc(firebaseDb, `tenants/${tenantId}`)); const profile = await httpsCallable(firebaseFunctions, "getMyProfile")(); return { businessProfile: tenant.exists() ? tenant.data() : {}, memberships: profile.data?.memberships || [], user: profile.data || null, users: [] }; }
  return request("GET", "/account");
};
const inviteUser = (data) => (isDataFixtureMode() ? delay(400).then(() => ({ ok: true, id: `inv_${Date.now()}`, ...data, status: "Pending" })) : request("POST", "/account/users/invite", data));

export const portalAdapter = {
  isPreviewMode,
  isFirebaseMode,
  isBypassMode,
  apiUrl: API_URL,
  auth: { getSession, createSession, verifyMfa, deleteSession, requestRecovery, completeRecovery },
  getDashboard, getLeads, getLead, getAppointments, getReports, getBilling, getInvoice,
  createBillingReview, getDocuments, createDocument, getSupport, createSupport,
  getNotifications, updateNotifications, getSecurity, getAccount, inviteUser,
};

export default portalAdapter;
