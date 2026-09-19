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
const AGENT_COLLECTIONS = new Set([
  'organizations', 'brands', 'campaigns', 'leadSources', 'leads', 'followUpTasks',
  'communicationAlerts', 'callRecords', 'callTranscripts', 'callQualityReviews',
  'appointments', 'businessOwners', 'scripts', 'qualificationForms', 'routingRules',
  'phoneNumbers', 'reports', 'auditLogs',
]);
const AGENT_WRITE_COLLECTIONS = new Set([
  'leads', 'followUpTasks', 'communicationAlerts', 'callRecords', 'callTranscripts',
  'callQualityReviews', 'appointments', 'businessOwners', 'reports',
]);
const ADMIN_WRITE_COLLECTIONS = new Set([
  'organizations', 'brands', 'campaigns', 'leadSources', 'scripts',
  'qualificationForms', 'routingRules', 'phoneNumbers',
]);
const REQUIRED_FIELDS = {
  organizations: ['name', 'status', 'settings'],
  brands: ['name', 'status', 'domain'],
  campaigns: ['name', 'brandId', 'status', 'startDate', 'endDate'],
  leadSources: ['name', 'type', 'status'],
  leads: ['firstName', 'lastName', 'email', 'phone', 'status', 'sourceId', 'brandId', 'assignedTo'],
  followUpTasks: ['leadId', 'assignedTo', 'status', 'dueAt'],
  communicationAlerts: ['leadId', 'channel', 'status', 'sentAt'],
  callRecords: ['leadId', 'agentUid', 'status', 'startedAt', 'endedAt'],
  callTranscripts: ['callId', 'storagePath', 'status'],
  callQualityReviews: ['callId', 'reviewerUid', 'score', 'status'],
  appointments: ['leadId', 'title', 'scheduledStart', 'scheduledEnd', 'status', 'calendarProvider'],
  businessOwners: ['leadId', 'name', 'email', 'phone'],
  scripts: ['name', 'status', 'body', 'version'],
  qualificationForms: ['name', 'status', 'fields', 'version'],
  routingRules: ['name', 'status', 'priority', 'conditions', 'destination'],
  phoneNumbers: ['phoneNumber', 'provider', 'status', 'assignedTo'],
  reports: ['name', 'type', 'periodStart', 'periodEnd', 'status', 'storagePath'],
};

function writeRolesFor(collectionName) {
  if (ADMIN_WRITE_COLLECTIONS.has(collectionName)) return ['admin', 'supervisor'];
  if (AGENT_WRITE_COLLECTIONS.has(collectionName)) return ['admin', 'supervisor', 'agent'];
  return [];
}

function twilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

async function twilioRequest(path, method = 'POST', params = {}) {
  if (!twilioConfigured()) throw new HttpsError('failed-precondition', 'Telephony is not configured.');
  const body = new URLSearchParams(params);
  const credentials = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}${path}`, {
    method,
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpsError('internal', payload.message || 'Telephony provider request failed.');
  return payload;
}

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

function validateRequiredFields(collectionName, data) {
  const input = objectInput(data);
  const missing = (REQUIRED_FIELDS[collectionName] || []).filter((field) => input[field] === undefined || input[field] === null);
  if (missing.length) throw new HttpsError('invalid-argument', `Missing required fields: ${missing.join(', ')}`);
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

exports.getLiveReport = onCall(async (request) => {
  const { tenantId, rangeStart = null, rangeEnd = null } = request.data || {};
  await requireMembership(request, tenantId, ['admin', 'supervisor', 'agent', 'auditor', 'customer']);
  const [leadsSnapshot, appointmentsSnapshot] = await Promise.all([
    db.collection(`tenants/${tenantId}/leads`).where('tenantId', '==', tenantId).get(),
    db.collection(`tenants/${tenantId}/appointments`).where('tenantId', '==', tenantId).get(),
  ]);
  const inRange = (item) => {
    const value = item.createdAt?.toDate?.() || (item.createdAt ? new Date(item.createdAt) : null);
    return (!rangeStart || !value || value >= new Date(rangeStart)) && (!rangeEnd || !value || value <= new Date(rangeEnd));
  };
  const leads = leadsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter(inRange);
  const appointments = appointmentsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter(inRange);
  const qualified = leads.filter((lead) => ['qualified', 'appointment set', 'handed off', 'closed'].includes(String(lead.stage || lead.status || '').toLowerCase()));
  const completed = leads.filter((lead) => ['closed', 'closed-won', 'closed won'].includes(String(lead.stage || lead.status || lead.disposition || '').toLowerCase()));
  return {
    tenantId,
    rangeStart,
    rangeEnd,
    metrics: {
      leadVolume: leads.length,
      qualifiedOpportunities: qualified.length,
      appointments: appointments.length,
      closedWon: completed.length,
      qualificationRate: leads.length ? Number(((qualified.length / leads.length) * 100).toFixed(1)) : 0,
      closeRate: leads.length ? Number(((completed.length / leads.length) * 100).toFixed(1)) : 0,
    },
    leads,
    appointments,
    generatedAt: new Date().toISOString(),
  };
});

exports.getAgentCollection = onCall(async (request) => {
  const { tenantId, collectionName, limit: requestedLimit = 200 } = request.data || {};
  await requireMembership(request, tenantId, ['admin', 'supervisor', 'agent', 'auditor']);
  if (!AGENT_COLLECTIONS.has(collectionName)) throw new HttpsError('invalid-argument', 'Collection is not available through the CRM API.');
  const pageSize = Math.min(Math.max(Number(requestedLimit) || 200, 1), 500);
  const snapshot = await db.collection(`tenants/${tenantId}/${collectionName}`).where('tenantId', '==', tenantId).limit(pageSize).get();
  return { rows: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) };
});

exports.createAgentRecord = onCall(async (request) => {
  const { tenantId, collectionName, data } = request.data || {};
  if (!AGENT_COLLECTIONS.has(collectionName) || collectionName === 'auditLogs') throw new HttpsError('invalid-argument', 'Collection is not writable through the CRM API.');
  const roles = writeRolesFor(collectionName);
  if (!roles.length) throw new HttpsError('permission-denied', 'This collection is not writable through the CRM API.');
  validateRequiredFields(collectionName, data);
  return createTenantRecord({ request, tenantId, collectionName, roles, action: `crm.${collectionName}.created`, data });
});

exports.updateAgentRecord = onCall(async (request) => {
  const { tenantId, collectionName, recordId, data } = request.data || {};
  if (!AGENT_COLLECTIONS.has(collectionName) || collectionName === 'auditLogs' || typeof recordId !== 'string' || !recordId) throw new HttpsError('invalid-argument', 'A valid writable collection and recordId are required.');
  const roles = writeRolesFor(collectionName);
  if (!roles.length) throw new HttpsError('permission-denied', 'This collection is not writable through the CRM API.');
  const { caller } = await requireMembership(request, tenantId, roles);
  const recordRef = db.doc(`tenants/${tenantId}/${collectionName}/${recordId}`);
  const current = await recordRef.get();
  if (!current.exists || current.data().tenantId !== tenantId) throw new HttpsError('not-found', 'Record not found.');
  const patch = objectInput(data);
  delete patch.tenantId;
  delete patch.createdAt;
  delete patch.createdBy;
  await recordRef.update({ ...patch, updatedAt: FieldValue.serverTimestamp(), updatedBy: caller.uid });
  await recordAudit({ tenantId, actorUid: caller.uid, action: `crm.${collectionName}.updated`, target: recordId });
  return { id: recordId, ...current.data(), ...patch };
});

exports.communications = onCall(async (request) => {
  const { tenantId, action, params = {}, adminCheck = false } = request.data || {};
  const roles = adminCheck ? ['admin', 'supervisor'] : ['admin', 'supervisor', 'agent'];
  const { caller } = await requireMembership(request, tenantId, roles);
  if (!['health_check', 'start_call', 'end_call', 'hold_call', 'resume_call', 'warm_transfer'].includes(action)) throw new HttpsError('invalid-argument', 'Unsupported communications action.');
  if (action === 'health_check') return { ok: true, configured: twilioConfigured(), provider: 'twilio', actorUid: caller.uid };
  const callSid = typeof params.callId === 'string' ? params.callId : '';
  if (!callSid && action !== 'start_call') throw new HttpsError('invalid-argument', 'A callId is required.');
  let result;
  if (action === 'start_call') {
    if (!params.to || !process.env.TWILIO_FROM_NUMBER) throw new HttpsError('invalid-argument', 'A destination and configured caller number are required.');
    result = await twilioRequest('/Calls.json', 'POST', { To: params.to, From: process.env.TWILIO_FROM_NUMBER, Url: params.twimlUrl || process.env.TWILIO_VOICE_WEBHOOK_URL });
  } else if (action === 'end_call') {
    result = await twilioRequest(`/Calls/${encodeURIComponent(callSid)}.json`, 'POST', { Status: 'completed' });
  } else if (action === 'hold_call' || action === 'resume_call') {
    result = await twilioRequest(`/Calls/${encodeURIComponent(callSid)}.json`, 'POST', { Twiml: action === 'hold_call' ? '<Response><Say>The call is on hold.</Say><Pause length="60"/></Response>' : '<Response><Say>Resuming call.</Say></Response>' });
  } else {
    if (!params.transferTo) throw new HttpsError('invalid-argument', 'A transfer destination is required.');
    result = await twilioRequest(`/Calls/${encodeURIComponent(callSid)}.json`, 'POST', { Twiml: `<Response><Dial>${String(params.transferTo).replace(/[<>]/g, '')}</Dial></Response>` });
  }
  await recordAudit({ tenantId, actorUid: caller.uid, action: `telephony.${action}`, target: callSid || result.sid || null });
  return { ok: true, action, callId: result.sid || callSid, status: result.status || 'accepted' };
});

exports.twilioWebhook = onRequest({ cors: false }, async (request, response) => {
  if (request.method !== 'POST') return response.status(405).send('Method not allowed');
  if (!process.env.TWILIO_AUTH_TOKEN) return response.status(503).send('Telephony is not configured');
  const signature = request.get('X-Twilio-Signature') || '';
  const url = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
  const params = request.body || {};
  const data = url + Object.keys(params).sort().map((key) => `${key}${params[key]}`).join('');
  const expected = crypto.createHmac('sha1', process.env.TWILIO_AUTH_TOKEN).update(data).digest('base64');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return response.status(403).send('Invalid signature');
  response.type('text/xml').send('<Response><Say>Link Marketing Services call connected.</Say></Response>');
});
