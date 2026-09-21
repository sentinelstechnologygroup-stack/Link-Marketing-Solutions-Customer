const assert = require('node:assert/strict');
const test = require('node:test');

process.env.LMS_INGESTION_KEY = 'emulator-ingestion-key';

const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('../index.js');

const db = getFirestore();
const auth = getAuth();
const lmsAdminUid = 'workflow-lms-admin';
const agentUid = 'workflow-brand-agent';
const clientUid = 'workflow-client-admin';

const callableRequest = (uid, data, token = {}) => ({ auth: { uid, token }, data });

async function invokeHttp(handler, { method = 'POST', headers = {}, body = {} } = {}) {
  const normalizedHeaders = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
  const state = { status: 200, body: null };
  const listeners = new Map();
  const finish = () => listeners.get('finish')?.forEach((listener) => listener());
  const request = {
    method,
    headers: normalizedHeaders,
    body,
    rawBody: Buffer.from(JSON.stringify(body)),
    protocol: 'http',
    originalUrl: '/demo-linkmarketing-local/us-central1/ingestWebsiteLead',
    url: '/demo-linkmarketing-local/us-central1/ingestWebsiteLead',
    get(name) { return normalizedHeaders[String(name).toLowerCase()] || ''; },
  };
  const response = {
    locals: {},
    on(event, listener) {
      const eventListeners = listeners.get(event) || [];
      eventListeners.push(listener);
      listeners.set(event, eventListeners);
      return this;
    },
    status(code) { state.status = code; return this; },
    json(value) { state.body = value; finish(); return this; },
    send(value) { state.body = value; finish(); return this; },
    type() { return this; },
    setHeader() {},
    getHeader() { return undefined; },
    end(value) { if (value !== undefined) state.body = value; finish(); return this; },
  };
  await handler(request, response);
  return state;
}

test.before(async () => {
  await Promise.all([
    auth.createUser({ uid: lmsAdminUid, email: 'workflow-admin@example.test', displayName: 'Workflow LMS Admin' }),
    auth.createUser({ uid: agentUid, email: 'workflow-agent@example.test', displayName: 'Workflow Agent' }),
    auth.createUser({ uid: clientUid, email: 'workflow-client@example.test', displayName: 'Workflow Client Admin' }),
  ]);
  await auth.setCustomUserClaims(lmsAdminUid, { lmsSuperAdmin: true, platformAdmin: true });
});

test.after(async () => {
  await Promise.all([lmsAdminUid, agentUid, clientUid].map((uid) => auth.deleteUser(uid).catch(() => null)));
});

test('provisioning, ingestion, Agent workflow, Customer projection, and Brand isolation stay aligned', async () => {
  const provisioned = await functions.provisionClient.run(callableRequest(lmsAdminUid, {
    clientName: 'Workflow Bridge Client',
    tenantSlug: 'workflow-bridge-client',
    brandName: 'Workflow Primary Brand',
    brandSlug: 'workflow-primary-brand',
    industryId: 'general-services',
    adminEmail: 'workflow-client@example.test',
    routeKey: 'workflow-bridge-route',
    assignedAgentUids: [agentUid],
    notificationChannels: ['in_app'],
  }, { lmsSuperAdmin: true, platformAdmin: true }));

  assert.equal(provisioned.tenantId, 'tenant-workflow-bridge-client');
  assert.equal(provisioned.brandId, 'brand-workflow-primary-brand');
  assert.equal(provisioned.initialAdminUid, clientUid);

  const tenantId = provisioned.tenantId;
  const brandId = provisioned.brandId;
  const agentRequest = (data) => callableRequest(agentUid, { tenantId, ...data }, { role: 'agent' });
  const clientRequest = (data) => callableRequest(clientUid, { tenantId, ...data }, { role: 'client_admin' });

  const ingestion = await invokeHttp(functions.ingestWebsiteLead, {
    headers: {
      authorization: 'Bearer emulator-ingestion-key',
      'x-lms-route-key': 'workflow-bridge-route',
    },
    body: {
      name: 'Workflow Pilot Lead',
      email: 'workflow-lead@example.test',
      tenantId: 'tenant-attacker',
      brandId: 'brand-attacker',
      industryId: 'attacker-industry',
      isTest: true,
    },
  });

  assert.equal(ingestion.status, 202);
  assert.equal(ingestion.body.accepted, true);
  const leadId = ingestion.body.leadId;
  const leadRef = db.doc(`tenants/${tenantId}/leads/${leadId}`);
  const ingested = (await leadRef.get()).data();
  assert.equal(ingested.tenantId, tenantId);
  assert.equal(ingested.brandId, brandId);
  assert.equal(ingested.industryId, 'general-services');
  assert.equal(ingested.assignedTo, agentUid);
  assert.equal(ingested.routedClientContactId, clientUid);

  const forbiddenLeadRef = db.doc(`tenants/${tenantId}/leads/brand-b-lead`);
  await forbiddenLeadRef.set({ ...ingested, brandId: 'brand-forbidden', brand_id: 'brand-forbidden', name: 'Forbidden Brand Lead' });

  const collection = await functions.getAgentCollection.run(agentRequest({ collectionName: 'leads', limit: 50 }));
  assert.deepEqual(collection.rows.map((row) => row.id), [leadId]);

  await assert.rejects(
    functions.transitionLead.run(agentRequest({ leadId: 'brand-b-lead', status: 'contacted' })),
    (error) => error.code === 'permission-denied',
  );
  await assert.rejects(
    functions.createAgentRecord.run(agentRequest({
      collectionName: 'followUpTasks',
      data: { leadId, assignedTo: agentUid, status: 'pending', dueAt: new Date().toISOString(), brandId: 'brand-forbidden' },
    })),
    (error) => error.code === 'permission-denied',
  );

  const beforeTransition = await leadRef.get();
  await functions.transitionLead.run(agentRequest({ leadId, status: 'qualified', disposition: 'qualified', note: 'Qualified in emulator workflow.' }));
  const afterTransition = await leadRef.get();
  assert.equal(afterTransition.data().status, 'qualified');
  assert.equal(afterTransition.data().brandId, brandId);

  await functions.projectLeadActivity.run({
    params: { tenantId, leadId },
    data: { before: beforeTransition, after: afterTransition },
  });

  const appointment = await functions.appointmentWorkflow.run(agentRequest({
    action: 'create',
    data: {
      leadId,
      title: 'Workflow consultation',
      scheduledStart: '2026-09-22T15:00:00.000Z',
      scheduledEnd: '2026-09-22T15:30:00.000Z',
      calendarProvider: 'internal',
      brandId: 'brand-forbidden',
    },
  }));
  const appointmentSnapshot = await db.doc(`tenants/${tenantId}/appointments/${appointment.id}`).get();
  assert.equal(appointmentSnapshot.data().brandId, brandId);
  assert.equal(appointmentSnapshot.data().tenantId, tenantId);

  await functions.projectAppointmentActivity.run({
    params: { tenantId, appointmentId: appointment.id },
    data: { data: () => appointmentSnapshot.data() },
  });

  const dashboard = await functions.getDashboardWorkspace.run(clientRequest({}));
  const report = await functions.getLiveReport.run(clientRequest({ range: 'Workflow test' }));
  assert.equal(dashboard.metrics.leadsReceived.value, 2);
  assert.equal(dashboard.metrics.appointmentsAndTransfers.value, 1);
  assert.equal(report.metrics.leadVolume.value, 2);
  assert.equal(report.metrics.appointmentRate.value, 50);

  const [activities, audits, notifications] = await Promise.all([
    db.collection(`tenants/${tenantId}/customerActivity`).get(),
    db.collection(`tenants/${tenantId}/auditLogs`).get(),
    db.collection(`tenants/${tenantId}/notifications`).get(),
  ]);
  assert.equal(activities.size, 2);
  assert.ok(audits.size >= 4);
  assert.ok(notifications.size >= 3);

  await assert.rejects(
    functions.transitionLead.run(callableRequest(agentUid, { tenantId: 'tenant-unassigned', leadId, status: 'contacted' }, { role: 'agent' })),
    (error) => error.code === 'permission-denied',
  );
});
