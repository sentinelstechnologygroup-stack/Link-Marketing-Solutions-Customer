const crypto = require('node:crypto');
const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { HttpsError, onCall, onRequest } = require('firebase-functions/v2/https');
const { canonicalLead } = require('./bridge-contract.cjs');

if (!getApps().length) initializeApp();
const db = getFirestore();
const auth = getAuth();
const ingestionKey = defineSecret('LMS_INGESTION_KEY');
const CLIENT_ROLES = new Set(['client', 'client_admin', 'client_supervisor']);
const ASSET_COLLECTIONS = {
  document: 'documents', report: 'reports', export: 'reports', invoice: 'invoices', recording: 'callRecords', upload: 'documents',
};

function clean(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function safeId(value, prefix) {
  const id = clean(value, 120).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!id) throw new HttpsError('invalid-argument', `${prefix} identifier is required.`);
  return id.startsWith(`${prefix}-`) ? id : `${prefix}-${id}`;
}

function requireCaller(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  return request.auth;
}

async function requireSuperAdmin(request) {
  const caller = requireCaller(request);
  const user = await auth.getUser(caller.uid);
  if (caller.token?.lmsSuperAdmin !== true && user.customClaims?.lmsSuperAdmin !== true && user.customClaims?.platformAdmin !== true) {
    throw new HttpsError('permission-denied', 'LMS Super Admin access is required.');
  }
  return caller;
}

async function canOperateTenant(uid, tenantId, brandId = null, superAdmin = false) {
  if (superAdmin) return true;
  const [member, assignment] = await Promise.all([
    db.doc(`tenants/${tenantId}/members/${uid}`).get(),
    db.doc(`agentUsers/${uid}/assignments/${tenantId}`).get(),
  ]);
  if (member.exists && member.data().active === true) return true;
  if (!assignment.exists || assignment.data().status !== 'active') return false;
  const data = assignment.data();
  if (!brandId || !data.brandId || data.brandId === brandId) return true;
  return Array.isArray(data.brandIds) && data.brandIds.includes(brandId);
}

async function writeAudit(tenantId, actorUid, action, target, metadata = {}) {
  await db.collection(`tenants/${tenantId}/auditLogs`).add({
    tenantId, actorUid, action, target, metadata,
    occurredAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
  });
}

async function recipientUids(tenantId, assignedTo = null, clientContactUid = null) {
  const members = await db.collection(`tenants/${tenantId}/members`).where('active', '==', true).get();
  return [...new Set([
    assignedTo,
    clientContactUid,
    ...members.docs.filter((item) => CLIENT_ROLES.has(item.data().role)).map((item) => item.id),
  ].filter(Boolean))];
}

async function notifyTenant({ tenantId, brandId, assignedTo, clientContactUid, type, title, body, relatedId, audiences = ['agent', 'customer'] }) {
  const recipients = await recipientUids(tenantId, assignedTo, clientContactUid);
  if (!recipients.length) return;
  const batch = db.batch();
  recipients.forEach((uid) => {
    const ref = db.collection(`tenants/${tenantId}/notifications`).doc();
    batch.set(ref, {
      tenantId, brandId: brandId || null, recipientUid: uid, audiences, type, title, body,
      relatedId: relatedId || null, readAt: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}

async function chooseAssignment(route, leadId) {
  let candidates = Array.isArray(route.assignedAgentUids) ? route.assignedAgentUids.filter(Boolean) : [];
  if (!candidates.length) {
    const snapshot = await db.collection('agentAssignments').where('tenantId', '==', route.tenantId).where('status', '==', 'active').get();
    candidates = snapshot.docs
      .map((item) => item.data())
      .filter((item) => !item.brandId || item.brandId === route.brandId || item.brandIds?.includes?.(route.brandId))
      .map((item) => item.agentUid)
      .filter(Boolean);
  }
  candidates = [...new Set(candidates)].sort();
  if (!candidates.length) return null;
  const index = parseInt(leadId.slice(-8), 36) % candidates.length;
  return candidates[index];
}

async function chooseClientContact(route) {
  const snapshot = await db.collection(`tenants/${route.tenantId}/businessOwners`).limit(100).get();
  const contacts = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.status !== 'inactive' && (!item.brandId || item.brandId === route.brandId))
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  return contacts[0] || null;
}

exports.provisionClient = onCall(async (request) => {
  const caller = await requireSuperAdmin(request);
  const input = request.data || {};
  const tenantId = safeId(input.tenantSlug || input.clientName, 'tenant');
  const brandId = safeId(input.brandSlug || input.brandName || input.clientName, 'brand');
  const clientName = clean(input.clientName, 200);
  const brandName = clean(input.brandName || input.clientName, 200);
  const industryId = clean(input.industryId || 'general', 100).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const adminEmail = clean(input.adminEmail, 320).toLowerCase();
  const routeKey = clean(input.routeKey || tenantId.replace(/^tenant-/, ''), 120).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (!clientName || !brandName || !adminEmail || !routeKey) throw new HttpsError('invalid-argument', 'Client, Brand, administrator email, and route key are required.');
  const tenantRef = db.doc(`tenants/${tenantId}`);
  if ((await tenantRef.get()).exists) throw new HttpsError('already-exists', 'This tenant already exists.');

  const now = FieldValue.serverTimestamp();
  const route = {
    routeKey, tenantId, brandId, industryId,
    sourceId: clean(input.sourceId || 'source-website', 120),
    campaignId: clean(input.campaignId || 'campaign-initial', 120),
    routingProfileId: clean(input.routingProfileId || 'routing-default', 120),
    workflowVersion: clean(input.workflowVersion || '1.0', 40),
    scriptSetId: clean(input.scriptSetId || 'script-default', 120),
    qualificationFormId: clean(input.qualificationFormId || 'qualification-default', 120),
    consentPolicyId: clean(input.consentPolicyId || 'consent-standard', 120),
    retentionPolicyId: clean(input.retentionPolicyId || 'retention-standard', 120),
    notificationProfileId: clean(input.notificationProfileId || 'notification-default', 120),
    assignedAgentUids: Array.isArray(input.assignedAgentUids) ? input.assignedAgentUids.filter(Boolean) : [],
    status: 'active', createdAt: now, updatedAt: now, createdBy: caller.uid,
  };
  const batch = db.batch();
  batch.set(tenantRef, { tenantId, name: clientName, legalName: clean(input.legalName || clientName, 200), status: input.status === 'beta' ? 'beta' : 'active', environment: 'production', industry: industryId, vertical: industryId, demo: false, createdAt: now, updatedAt: now, createdBy: caller.uid });
  batch.set(db.doc(`tenants/${tenantId}/organizations/default`), { tenantId, name: clientName, status: 'active', settings: { timezone: clean(input.timezone || 'America/Chicago', 80), domain: clean(input.domain, 300) }, createdAt: now, updatedAt: now });
  batch.set(db.doc(`tenants/${tenantId}/brands/${brandId}`), { tenantId, brandId, name: brandName, status: 'active', domain: clean(input.domain, 300), industryId, createdAt: now, updatedAt: now });
  batch.set(db.doc(`tenants/${tenantId}/leadSources/${route.sourceId}`), { tenantId, brandId, name: 'Website', type: 'website', status: 'active', createdAt: now, updatedAt: now });
  batch.set(db.doc(`tenants/${tenantId}/campaigns/${route.campaignId}`), { tenantId, brandId, name: 'Initial program', status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: null, createdAt: now, updatedAt: now });
  batch.set(db.doc(`tenants/${tenantId}/routingRules/${route.routingProfileId}`), { tenantId, brandId, name: 'Default client contact rotation', status: 'active', priority: 1, conditions: [], destination: { type: 'client_contact_rotation' }, createdAt: now, updatedAt: now });
  batch.set(db.doc(`tenants/${tenantId}/config/workflow`), { ...route, notificationChannels: input.notificationChannels || ['in_app', 'email'], retentionDays: Number(input.retentionDays) || 2555, createdAt: now, updatedAt: now });
  batch.set(db.doc(`industryConfigs/${industryId}`), { industryId, workflowVersion: route.workflowVersion, scriptSetId: route.scriptSetId, qualificationFormId: route.qualificationFormId, routingProfileId: route.routingProfileId, consentPolicyId: route.consentPolicyId, retentionPolicyId: route.retentionPolicyId, updatedAt: now, updatedBy: caller.uid }, { merge: true });
  batch.set(db.doc(`ingestionRoutes/${routeKey}`), route);

  let initialAdminUid = null;
  const adminUser = await auth.getUserByEmail(adminEmail).catch(() => null);
  if (adminUser && !adminUser.disabled) {
    initialAdminUid = adminUser.uid;
    batch.set(db.doc(`tenants/${tenantId}/members/${adminUser.uid}`), { uid: adminUser.uid, tenantId, email: adminEmail, role: 'client_admin', active: true, brandIds: [brandId], invitedBy: caller.uid, createdAt: now, updatedAt: now });
    batch.set(db.doc(`tenants/${tenantId}/businessOwners/${adminUser.uid}`), { tenantId, brandId, uid: adminUser.uid, memberUid: adminUser.uid, name: clean(adminUser.displayName || `${brandName} administrator`, 200), email: adminEmail, phone: '', roleType: 'client_contact', status: 'active', routingEligible: true, createdAt: now, updatedAt: now });
  } else {
    const invitationRef = db.collection(`tenants/${tenantId}/invitations`).doc();
    batch.set(invitationRef, { tenantId, email: adminEmail, role: 'client_admin', brandIds: [brandId], status: 'pending', invitedBy: caller.uid, createdAt: now, updatedAt: now });
  }

  for (const agentUid of route.assignedAgentUids) {
    const assignmentRef = db.collection('agentAssignments').doc();
    const assignment = { agentUid, tenantId, industry: industryId, brandId, brandIds: [brandId], campaignIds: [route.campaignId], sourceIds: [route.sourceId], scope: 'assigned', permissions: ['lead.read', 'lead.update', 'appointment.manage'], role: 'agent', status: 'active', assignedBy: caller.uid, createdAt: now, updatedAt: now };
    batch.set(assignmentRef, assignment);
    batch.set(db.doc(`agentUsers/${agentUid}/assignments/${tenantId}`), { ...assignment, assignmentId: assignmentRef.id }, { merge: true });
  }
  batch.set(db.collection(`tenants/${tenantId}/auditLogs`).doc(), { tenantId, actorUid: caller.uid, action: 'client.provisioned', target: tenantId, metadata: { brandId, industryId, routeKey, initialAdminUid }, occurredAt: now, createdAt: now });
  await batch.commit();
  return { ok: true, tenantId, brandId, routeKey, initialAdminUid, invitationPending: !initialAdminUid };
});

exports.ingestWebsiteLead = onRequest({ cors: false, secrets: [ingestionKey], timeoutSeconds: 30 }, async (request, response) => {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const expected = ingestionKey.value();
  const supplied = String(request.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const valid = expected && supplied && supplied.length === expected.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return response.status(401).json({ error: 'Unauthorized' });
  const routeKey = clean(request.get('x-lms-route-key'), 120).toLowerCase();
  if (!routeKey) return response.status(400).json({ error: 'A server route key is required' });
  const routeSnapshot = await db.doc(`ingestionRoutes/${routeKey}`).get();
  if (!routeSnapshot.exists || routeSnapshot.data().status !== 'active') return response.status(404).json({ error: 'Route not found' });
  const route = routeSnapshot.data();
  const [tenant, brand] = await Promise.all([
    db.doc(`tenants/${route.tenantId}`).get(),
    db.doc(`tenants/${route.tenantId}/brands/${route.brandId}`).get(),
  ]);
  if (!tenant.exists || !brand.exists || tenant.data().demo === true) return response.status(409).json({ error: 'Production route is unavailable' });

  const leadRef = db.collection(`tenants/${route.tenantId}/leads`).doc();
  const [assignedTo, clientContact] = await Promise.all([chooseAssignment(route, leadRef.id), chooseClientContact(route)]);
  let lead;
  try {
    lead = canonicalLead(route, request.body || {}, assignedTo, clientContact);
  } catch (error) {
    return response.status(409).json({ error: error.message });
  }
  if (!lead.email && !lead.phone) return response.status(400).json({ error: 'Email or phone is required' });
  const now = FieldValue.serverTimestamp();
  await leadRef.set({ ...lead, receivedAt: now, createdAt: now, updatedAt: now, createdBy: 'server:website-ingestion' });
  await writeAudit(route.tenantId, 'server:website-ingestion', 'lead.ingested', leadRef.id, { brandId: route.brandId, routeKey, assignedTo });
  await notifyTenant({ tenantId: route.tenantId, brandId: route.brandId, assignedTo, clientContactUid: clientContact?.uid || clientContact?.memberUid, type: 'lead_received', title: 'New lead received', body: `${lead.name} entered the ${brand.data().name || 'client'} queue.`, relatedId: leadRef.id });
  return response.status(202).json({ accepted: true, leadId: leadRef.id, receivedAt: new Date().toISOString() });
});

exports.registerTenantAsset = onCall(async (request) => {
  const caller = requireCaller(request);
  const input = request.data || {};
  const tenantId = clean(input.tenantId, 120);
  const brandId = clean(input.brandId, 120);
  const assetType = clean(input.assetType, 50).toLowerCase();
  const storagePath = clean(input.storagePath, 1000);
  const user = await auth.getUser(caller.uid);
  const superAdmin = caller.token?.lmsSuperAdmin === true || user.customClaims?.lmsSuperAdmin === true || user.customClaims?.platformAdmin === true;
  if (!tenantId || !brandId || !ASSET_COLLECTIONS[assetType]) throw new HttpsError('invalid-argument', 'tenantId, brandId, and a supported assetType are required.');
  if (!storagePath.startsWith(`tenants/${tenantId}/brands/${brandId}/`)) throw new HttpsError('permission-denied', 'The asset path must match its immutable tenant and Brand ownership.');
  if (!(await canOperateTenant(caller.uid, tenantId, brandId, superAdmin))) throw new HttpsError('permission-denied', 'You are not authorized for this tenant and Brand.');
  const collectionName = ASSET_COLLECTIONS[assetType];
  const ref = db.collection(`tenants/${tenantId}/${collectionName}`).doc();
  const record = { tenantId, brandId, assetType, name: clean(input.name, 300), category: clean(input.category || assetType, 100), storagePath, contentType: clean(input.contentType, 200), sizeBytes: Number(input.sizeBytes) || 0, status: 'active', createdBy: caller.uid, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
  await ref.set(record);
  await writeAudit(tenantId, caller.uid, 'asset.registered', ref.id, { brandId, assetType, storagePath });
  return { id: ref.id, ...record, createdAt: undefined, updatedAt: undefined };
});

exports.projectLeadActivity = onDocumentUpdated('tenants/{tenantId}/leads/{leadId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  const fields = ['status', 'disposition', 'qualificationStatus', 'assignedTo', 'latestNote', 'followUpAt'];
  const changed = fields.filter((field) => JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null));
  if (!changed.length) return;
  const tenantId = event.params.tenantId;
  await db.collection(`tenants/${tenantId}/customerActivity`).add({ tenantId, brandId: after.brandId || null, leadId: event.params.leadId, type: 'lead_updated', changedFields: changed, status: after.status || null, disposition: after.disposition || null, occurredAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() });
  await notifyTenant({ tenantId, brandId: after.brandId, assignedTo: after.assignedTo, type: `lead_${after.status || 'updated'}`, title: 'Lead activity updated', body: `${after.name || after.email || 'A lead'} is now ${after.status || 'updated'}.`, relatedId: event.params.leadId });
});

exports.projectAppointmentActivity = onDocumentCreated('tenants/{tenantId}/appointments/{appointmentId}', async (event) => {
  const appointment = event.data?.data();
  if (!appointment) return;
  const tenantId = event.params.tenantId;
  await db.collection(`tenants/${tenantId}/customerActivity`).add({ tenantId, brandId: appointment.brandId || null, appointmentId: event.params.appointmentId, leadId: appointment.leadId || null, type: 'appointment_created', occurredAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() });
  await notifyTenant({ tenantId, brandId: appointment.brandId, assignedTo: appointment.assignedTo, type: 'appointment_created', title: 'Appointment scheduled', body: appointment.title || 'A new appointment was scheduled.', relatedId: event.params.appointmentId });
});
