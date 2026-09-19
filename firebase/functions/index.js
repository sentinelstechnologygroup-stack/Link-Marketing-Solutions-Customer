const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { HttpsError, onCall, onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = getFirestore();
const auth = getAuth();
const ROLES = new Set(['admin', 'supervisor', 'agent', 'auditor', 'customer']);

function requireAuth(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  return request.auth;
}

async function getMembership(tenantId, uid) {
  const snapshot = await db.doc(`tenants/${tenantId}/members/${uid}`).get();
  const membership = snapshot.exists ? snapshot.data() : null;
  return membership?.active === true ? membership : null;
}

async function requireMembership(request, tenantId, roles = null) {
  const caller = requireAuth(request);
  if (typeof tenantId !== 'string' || !tenantId.trim()) throw new HttpsError('invalid-argument', 'A tenantId is required.');
  const membership = await getMembership(tenantId, caller.uid);
  if (!membership || (roles && !roles.includes(membership.role))) throw new HttpsError('permission-denied', 'You are not authorized for this tenant.');
  return { caller, membership };
}

async function recordAudit({ tenantId, actorUid, action, target = null, metadata = {} }) {
  await db.collection(`tenants/${tenantId}/auditLogs`).add({
    tenantId, actorUid, action, target, metadata,
    occurredAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });
}

function objectInput(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function createTenantRecord({ request, tenantId, collectionName, data, roles, action }) {
  const { caller } = await requireMembership(request, tenantId, roles);
  const now = FieldValue.serverTimestamp();
  const record = { ...objectInput(data), tenantId, createdBy: caller.uid, createdAt: now, updatedAt: now };
  const ref = await db.collection(`tenants/${tenantId}/${collectionName}`).add(record);
  await recordAudit({ tenantId, actorUid: caller.uid, action, target: ref.id });
  return { id: ref.id, ...record, createdAt: undefined, updatedAt: undefined };
}

// Minimal non-sensitive diagnostic only. Business operations are intentionally
// absent until the shared API contract, authorization model, and tests are ready.
exports.health = onRequest({ cors: false }, (_request, response) => {
  response.status(200).json({ service: 'linkmarketing-backend', status: 'ok' });
});

exports.getMyProfile = onCall(async (request) => {
  const caller = requireAuth(request);
  const user = await auth.getUser(caller.uid);
  const memberships = await db.collectionGroup('members').where('uid', '==', caller.uid).where('active', '==', true).get();
  return { uid: user.uid, email: user.email || null, displayName: user.displayName || null, disabled: user.disabled, memberships: memberships.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

exports.createInvitation = onCall(async (request) => {
  const { tenantId, email, role, brandIds = [] } = request.data || {};
  const { caller } = await requireMembership(request, tenantId, ['admin']);
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail.includes('@') || !ROLES.has(role) || role === 'admin') throw new HttpsError('invalid-argument', 'A valid email and non-admin role are required.');
  if (!Array.isArray(brandIds) || brandIds.some((id) => typeof id !== 'string')) throw new HttpsError('invalid-argument', 'brandIds must be an array of strings.');
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invitation = await db.collection(`tenants/${tenantId}/invitations`).add({ tenantId, email: normalizedEmail, role, brandIds, tokenHash, status: 'pending', invitedBy: caller.uid, createdAt: FieldValue.serverTimestamp(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  await recordAudit({ tenantId, actorUid: caller.uid, action: 'invitation.created', target: invitation.id, metadata: { email: normalizedEmail, role } });
  return { invitationId: invitation.id, email: normalizedEmail, role, status: 'pending', delivery: 'pending' };
});

exports.acceptInvitation = onCall(async (request) => {
  const caller = requireAuth(request);
  const { tenantId, invitationId, token } = request.data || {};
  if (!tenantId || !invitationId || typeof token !== 'string') throw new HttpsError('invalid-argument', 'tenantId, invitationId, and token are required.');
  const invitationRef = db.doc(`tenants/${tenantId}/invitations/${invitationId}`);
  const snapshot = await invitationRef.get();
  const invitation = snapshot.exists ? snapshot.data() : null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (!invitation || invitation.status !== 'pending' || invitation.tokenHash !== tokenHash || invitation.expiresAt.toDate() < new Date()) throw new HttpsError('permission-denied', 'Invitation is invalid or expired.');
  const user = await auth.getUser(caller.uid);
  if ((user.email || '').toLowerCase() !== invitation.email) throw new HttpsError('permission-denied', 'Invitation email does not match the signed-in user.');
  const membershipRef = db.doc(`tenants/${tenantId}/members/${caller.uid}`);
  await db.runTransaction(async (transaction) => {
    transaction.set(membershipRef, { uid: caller.uid, tenantId, email: invitation.email, role: invitation.role, brandIds: invitation.brandIds || [], active: true, invitedBy: invitation.invitedBy, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    transaction.update(invitationRef, { status: 'accepted', acceptedBy: caller.uid, acceptedAt: FieldValue.serverTimestamp(), tokenHash: FieldValue.delete() });
  });
  await recordAudit({ tenantId, actorUid: caller.uid, action: 'invitation.accepted', target: caller.uid });
  return { tenantId, uid: caller.uid, role: invitation.role, active: true };
});

exports.listMyMemberships = onCall(async (request) => {
  const caller = requireAuth(request);
  const memberships = await db.collectionGroup('members').where('uid', '==', caller.uid).where('active', '==', true).get();
  return { memberships: memberships.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

exports.createSupportRequest = onCall(async (request) => {
  const { tenantId, subject, category = 'general', priority = 'normal', body } = request.data || {};
  if (typeof subject !== 'string' || !subject.trim() || typeof body !== 'string' || !body.trim()) throw new HttpsError('invalid-argument', 'subject and body are required.');
  return createTenantRecord({ request, tenantId, collectionName: 'supportRequests', roles: ['admin', 'supervisor', 'agent', 'customer'], action: 'support.created', data: { subject: subject.trim(), category, priority, body: body.trim(), status: 'open' } });
});

exports.createBillingReview = onCall(async (request) => {
  const { tenantId, invoiceId, reason, note = '' } = request.data || {};
  if (typeof invoiceId !== 'string' || !invoiceId.trim() || typeof reason !== 'string' || !reason.trim()) throw new HttpsError('invalid-argument', 'invoiceId and reason are required.');
  return createTenantRecord({ request, tenantId, collectionName: 'billingReviews', roles: ['admin', 'supervisor', 'customer'], action: 'billing.review.created', data: { invoiceId: invoiceId.trim(), reason: reason.trim(), note, status: 'submitted' } });
});

exports.updateNotificationPreferences = onCall(async (request) => {
  const { tenantId, preferences } = request.data || {};
  const { caller } = await requireMembership(request, tenantId, ['admin', 'supervisor', 'agent', 'auditor', 'customer']);
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) throw new HttpsError('invalid-argument', 'preferences must be an object.');
  await db.doc(`tenants/${tenantId}/notificationPreferences/${caller.uid}`).set({ tenantId, uid: caller.uid, preferences, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await recordAudit({ tenantId, actorUid: caller.uid, action: 'notifications.preferences.updated', target: caller.uid });
  return { ok: true, preferences };
});

exports.createDocumentMetadata = onCall(async (request) => {
  const { tenantId, name, category, storagePath, contentType, sizeBytes } = request.data || {};
  if (typeof name !== 'string' || !name.trim() || typeof storagePath !== 'string' || !storagePath.startsWith(`tenants/${tenantId}/`)) throw new HttpsError('invalid-argument', 'A tenant-scoped name and storagePath are required.');
  return createTenantRecord({ request, tenantId, collectionName: 'documents', roles: ['admin', 'supervisor', 'agent', 'customer'], action: 'document.metadata.created', data: { name: name.trim(), category: category || 'general', storagePath, contentType: contentType || 'application/octet-stream', sizeBytes: Number(sizeBytes) || 0, status: 'available' } });
});
