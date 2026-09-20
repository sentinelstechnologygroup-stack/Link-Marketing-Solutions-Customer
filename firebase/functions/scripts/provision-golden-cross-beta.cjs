const { getApps, initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.GCLOUD_PROJECT || 'linkmarketing-agent-portal-crm' });
const db = getFirestore();
const auth = getAuth();

async function main() {
  if (process.env.CONFIRM_GOLDEN_CROSS_BETA !== 'yes') throw new Error('Set CONFIRM_GOLDEN_CROSS_BETA=yes to provision the production beta tenant.');
  const tenantId = 'tenant-golden-cross-beta';
  const brandId = 'brand-golden-cross-realty';
  const routeKey = 'golden-cross-beta';
  const now = FieldValue.serverTimestamp();
  const route = { routeKey, tenantId, brandId, industryId: 'real-estate', sourceId: 'source-golden-cross-pilot', campaignId: 'campaign-golden-cross-pilot', routingProfileId: 'routing-golden-cross-default', workflowVersion: '1.0', scriptSetId: 'script-golden-cross-default', qualificationFormId: 'qualification-golden-cross-default', consentPolicyId: 'consent-standard', retentionPolicyId: 'retention-standard', notificationProfileId: 'notification-default', status: 'active', assignedAgentUids: [], createdAt: now, updatedAt: now, createdBy: 'server:beta-bootstrap' };
  const lmsTenantId = 'tenant-lms-sales';
  const lmsBrandId = 'brand-link-marketing-services';
  const lmsRoute = { routeKey: 'lms-website', tenantId: lmsTenantId, brandId: lmsBrandId, industryId: 'business-services', sourceId: 'source-lms-website', campaignId: 'campaign-lms-website', routingProfileId: 'routing-lms-sales', workflowVersion: '1.0', scriptSetId: 'script-lms-sales', qualificationFormId: 'qualification-lms-sales', consentPolicyId: 'consent-standard', retentionPolicyId: 'retention-standard', notificationProfileId: 'notification-default', status: 'active', assignedAgentUids: [], createdAt: now, updatedAt: now, createdBy: 'server:beta-bootstrap' };
  const agents = await db.collection('agentUsers').where('status', '==', 'active').get();
  route.assignedAgentUids = agents.docs.map((item) => item.id);
  lmsRoute.assignedAgentUids = route.assignedAgentUids;
  const betaEmail = process.env.GOLDEN_CROSS_BETA_EMAIL || 'goldencross.beta@linkmarketingservices.co';
  const betaPassword = process.env.GOLDEN_CROSS_BETA_PASSWORD || '';
  let betaUser = await auth.getUserByEmail(betaEmail).catch(() => null);
  if (!betaUser && betaPassword) betaUser = await auth.createUser({ email: betaEmail, password: betaPassword, displayName: 'Golden Cross Beta Admin', emailVerified: true });
  const batch = db.batch();
  batch.set(db.doc(`tenants/${tenantId}`), { tenantId, name: 'Golden Cross Realty', legalName: 'Golden Cross Realty', status: 'beta', environment: 'production', industry: 'real-estate', vertical: 'real-estate', demo: false, createdAt: now, updatedAt: now, createdBy: 'server:beta-bootstrap' }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/organizations/default`), { tenantId, name: 'Golden Cross Realty', status: 'active', settings: { timezone: 'America/Chicago' }, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/brands/${brandId}`), { tenantId, brandId, name: 'Golden Cross Realty', status: 'active', domain: '', industryId: 'real-estate', createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/leadSources/${route.sourceId}`), { tenantId, brandId, name: 'Golden Cross pilot', type: 'website', status: 'active', createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/campaigns/${route.campaignId}`), { tenantId, brandId, name: 'Golden Cross beta pilot', status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: null, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/routingRules/${route.routingProfileId}`), { tenantId, brandId, name: 'Golden Cross client contact rotation', status: 'active', priority: 1, conditions: [], destination: { type: 'client_contact_rotation' }, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${tenantId}/config/workflow`), { ...route, notificationChannels: ['in_app', 'email'], retentionDays: 2555 }, { merge: true });
  batch.set(db.doc(`industryConfigs/real-estate`), { industryId: 'real-estate', workflowVersion: route.workflowVersion, scriptSetId: route.scriptSetId, qualificationFormId: route.qualificationFormId, routingProfileId: route.routingProfileId, consentPolicyId: route.consentPolicyId, retentionPolicyId: route.retentionPolicyId, updatedAt: now, updatedBy: 'server:beta-bootstrap' }, { merge: true });
  batch.set(db.doc(`ingestionRoutes/${routeKey}`), route, { merge: true });
  if (betaUser) {
    batch.set(db.doc(`tenants/${tenantId}/members/${betaUser.uid}`), { uid: betaUser.uid, tenantId, email: betaEmail, role: 'client_admin', active: true, brandIds: [brandId], invitedBy: 'server:beta-bootstrap', createdAt: now, updatedAt: now }, { merge: true });
    batch.set(db.doc(`users/${betaUser.uid}`), { uid: betaUser.uid, email: betaEmail, displayName: 'Golden Cross Beta Admin', updatedAt: now }, { merge: true });
  } else {
    batch.set(db.collection(`tenants/${tenantId}/invitations`).doc('golden-cross-beta-admin'), { tenantId, email: betaEmail, role: 'client_admin', brandIds: [brandId], status: 'pending', note: 'Dedicated beta invitation; demo membership remains unchanged.', invitedBy: 'server:beta-bootstrap', createdAt: now, updatedAt: now }, { merge: true });
  }
  batch.set(db.doc(`tenants/${lmsTenantId}`), { tenantId: lmsTenantId, name: 'Link Marketing Services Sales', legalName: 'Link Marketing Services', status: 'active', environment: 'production', industry: 'business-services', vertical: 'business-services', demo: false, createdAt: now, updatedAt: now, createdBy: 'server:beta-bootstrap' }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/organizations/default`), { tenantId: lmsTenantId, name: 'Link Marketing Services Sales', status: 'active', settings: { timezone: 'America/Chicago', domain: 'linkmarketingservices.co' }, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/brands/${lmsBrandId}`), { tenantId: lmsTenantId, brandId: lmsBrandId, name: 'Link Marketing Services', status: 'active', domain: 'linkmarketingservices.co', industryId: 'business-services', createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/leadSources/${lmsRoute.sourceId}`), { tenantId: lmsTenantId, brandId: lmsBrandId, name: 'LMS website', type: 'website', status: 'active', createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/campaigns/${lmsRoute.campaignId}`), { tenantId: lmsTenantId, brandId: lmsBrandId, name: 'LMS website inquiries', status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: null, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/routingRules/${lmsRoute.routingProfileId}`), { tenantId: lmsTenantId, brandId: lmsBrandId, name: 'LMS sales queue', status: 'active', priority: 1, conditions: [], destination: { type: 'agent_pool' }, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(db.doc(`tenants/${lmsTenantId}/config/workflow`), { ...lmsRoute, notificationChannels: ['in_app', 'email'], retentionDays: 2555 }, { merge: true });
  batch.set(db.doc('ingestionRoutes/lms-website'), lmsRoute, { merge: true });
  for (const agent of agents.docs) {
    const assignmentRef = db.collection('agentAssignments').doc();
    const role = agent.data().role || 'agent';
    const assignment = { agentUid: agent.id, tenantId, industry: 'real-estate', brandId, brandIds: [brandId], campaignIds: [route.campaignId], sourceIds: [route.sourceId], scope: role === 'lms_super_admin' ? 'all' : 'assigned', permissions: ['lead.read', 'lead.update', 'appointment.manage'], role, status: 'active', assignedBy: 'server:beta-bootstrap', createdAt: now, updatedAt: now };
    batch.set(assignmentRef, assignment);
    batch.set(db.doc(`agentUsers/${agent.id}/assignments/${tenantId}`), { ...assignment, assignmentId: assignmentRef.id }, { merge: true });
    const lmsAssignmentRef = db.collection('agentAssignments').doc();
    const lmsAssignment = { ...assignment, tenantId: lmsTenantId, industry: 'business-services', brandId: lmsBrandId, brandIds: [lmsBrandId], campaignIds: [lmsRoute.campaignId], sourceIds: [lmsRoute.sourceId] };
    batch.set(lmsAssignmentRef, lmsAssignment);
    batch.set(db.doc(`agentUsers/${agent.id}/assignments/${lmsTenantId}`), { ...lmsAssignment, assignmentId: lmsAssignmentRef.id }, { merge: true });
  }
  batch.set(db.collection(`tenants/${tenantId}/auditLogs`).doc(), { tenantId, actorUid: 'server:beta-bootstrap', action: 'beta.provisioned', target: tenantId, metadata: { brandId, routeKey, agentCount: agents.size }, occurredAt: now, createdAt: now });
  batch.set(db.collection(`tenants/${lmsTenantId}/auditLogs`).doc(), { tenantId: lmsTenantId, actorUid: 'server:beta-bootstrap', action: 'internal.sales.provisioned', target: lmsTenantId, metadata: { brandId: lmsBrandId, routeKey: lmsRoute.routeKey, agentCount: agents.size }, occurredAt: now, createdAt: now });
  await batch.commit();
  console.log(JSON.stringify({ ok: true, tenantId, brandId, routeKey, betaAdminEmail: betaEmail, betaAdminUid: betaUser?.uid || null, lmsTenantId, lmsBrandId, lmsRouteKey: lmsRoute.routeKey, agentCount: agents.size }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
