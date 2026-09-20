const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { getBytes, ref, uploadBytes } = require('firebase/storage');

const rulesDir = path.resolve(__dirname, '../..');
let env;

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-linkmarketing-local',
    firestore: {
      rules: fs.readFileSync(path.join(rulesDir, 'firestore.rules'), 'utf8'),
    },
    storage: {
      rules: fs.readFileSync(path.join(rulesDir, 'storage.rules'), 'utf8'),
    },
  });
});

test.after(async () => {
  await env.cleanup();
});

test('Firestore denies unauthenticated access', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'tenants/tenant-a/leads/lead-a')));
});

test('Firestore denies authenticated and cross-tenant access until rules are approved', async () => {
  const db = env.authenticatedContext('agent-a', {
    tenantId: 'tenant-a',
    role: 'agent',
  }).firestore();

  await assertFails(getDoc(doc(db, 'tenants/tenant-a/leads/lead-a')));
  await assertFails(setDoc(doc(db, 'tenants/tenant-b/leads/lead-b'), {
    tenantId: 'tenant-b',
    ownerId: 'agent-a',
  }));
});

test('Firestore allows an active member to read its tenant and blocks customer writes', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'tenants/tenant-c', 'members/customer-c'), {
      uid: 'customer-c', tenantId: 'tenant-c', role: 'customer', active: true,
    });
    await setDoc(doc(context.firestore(), 'tenants/tenant-c', 'reports/report-c'), {
      tenantId: 'tenant-c', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  const db = env.authenticatedContext('customer-c').firestore();
  await getDoc(doc(db, 'tenants/tenant-c/reports/report-c'));
  await assertFails(setDoc(doc(db, 'tenants/tenant-c/reports/report-new'), {
    tenantId: 'tenant-c', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  }));
  await assertFails(getDoc(doc(db, 'tenants/tenant-d/reports/report-d')));
});

test('Firestore keeps configuration writes above agent scope', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'tenants/tenant-e', 'members/agent-e'), {
      uid: 'agent-e', tenantId: 'tenant-e', role: 'agent', active: true,
    });
    await setDoc(doc(db, 'tenants/tenant-e', 'members/admin-e'), {
      uid: 'admin-e', tenantId: 'tenant-e', role: 'admin', active: true,
    });
  });

  const agentDb = env.authenticatedContext('agent-e').firestore();
  await assertFails(setDoc(doc(agentDb, 'tenants/tenant-e/brands/brand-e'), {
    tenantId: 'tenant-e', name: 'Unauthorized brand', status: 'draft', domain: 'example.test',
  }));

  const adminDb = env.authenticatedContext('admin-e').firestore();
  await setDoc(doc(adminDb, 'tenants/tenant-e/brands/brand-e'), {
    tenantId: 'tenant-e', name: 'Approved brand', status: 'active', domain: 'example.test',
  });
});

test('Firestore grants assigned agent reads only for assigned tenants', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'agentUsers/assigned-agent/assignments/tenant-assigned'), {
      agentUid: 'assigned-agent', tenantId: 'tenant-assigned', status: 'active', role: 'agent', industry: 'real-estate',
    });
    await setDoc(doc(db, 'tenants/tenant-assigned/leads/lead-1'), {
      tenantId: 'tenant-assigned', firstName: 'Assigned', lastName: 'Lead', status: 'new',
    });
    await setDoc(doc(db, 'tenants/tenant-other/leads/lead-2'), {
      tenantId: 'tenant-other', firstName: 'Other', lastName: 'Lead', status: 'new',
    });
  });

  const db = env.authenticatedContext('assigned-agent').firestore();
  await getDoc(doc(db, 'tenants/tenant-assigned/leads/lead-1'));
  await assertFails(getDoc(doc(db, 'tenants/tenant-other/leads/lead-2')));
  await assertFails(setDoc(doc(db, 'agentUsers/assigned-agent/assignments/tenant-other'), {
    agentUid: 'assigned-agent', tenantId: 'tenant-other', status: 'active', role: 'agent',
  }));
});

test('client, client supervisor, and client admin stay inside their tenant', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [uid, role] of [['client-user', 'client'], ['client-supervisor', 'client_supervisor'], ['client-admin', 'client_admin']]) {
      await setDoc(doc(db, `tenants/tenant-role/members/${uid}`), { uid, tenantId: 'tenant-role', role, active: true });
    }
    await setDoc(doc(db, 'tenants/tenant-role/leads/lead-role'), { tenantId: 'tenant-role', status: 'new' });
    await setDoc(doc(db, 'tenants/tenant-private/leads/lead-private'), { tenantId: 'tenant-private', status: 'new' });
  });

  for (const uid of ['client-user', 'client-supervisor', 'client-admin']) {
    const db = env.authenticatedContext(uid).firestore();
    await assertSucceeds(getDoc(doc(db, 'tenants/tenant-role/leads/lead-role')));
    await assertFails(getDoc(doc(db, 'tenants/tenant-private/leads/lead-private')));
  }
});

test('LMS super admin claim can audit tenants but cannot be granted from tenant data', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'tenants/tenant-super/reports/report-super'), { tenantId: 'tenant-super', createdAt: '2026-01-01', updatedAt: '2026-01-01' });
  });
  const privileged = env.authenticatedContext('lms-admin', { lmsSuperAdmin: true }).firestore();
  await assertSucceeds(getDoc(doc(privileged, 'tenants/tenant-super/reports/report-super')));
  const unprivileged = env.authenticatedContext('fake-lms-admin', { role: 'lms_super_admin' }).firestore();
  await assertFails(getDoc(doc(unprivileged, 'tenants/tenant-super/reports/report-super')));
});

test('Storage denies unauthenticated and authenticated access', async () => {
  const unauthenticated = env.unauthenticatedContext().storage();
  const authenticated = env.authenticatedContext('customer-a', {
    tenantId: 'tenant-a',
    role: 'customer',
  }).storage();
  const bytes = new Uint8Array([76, 77, 83]);

  await assertFails(uploadBytes(ref(unauthenticated, 'tenants/tenant-a/evidence/a.txt'), bytes));
  await assertFails(uploadBytes(ref(authenticated, 'tenants/tenant-b/evidence/b.txt'), bytes));
  await assertFails(getBytes(ref(authenticated, 'tenants/tenant-a/evidence/a.txt')));
});

test('Storage permits validated files only within the active member tenant', async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'tenants/tenant-storage/members/storage-client'), {
      uid: 'storage-client', tenantId: 'tenant-storage', role: 'client', active: true,
    });
  });
  const storage = env.authenticatedContext('storage-client').storage();
  const bytes = new Uint8Array([76, 77, 83]);
  await assertSucceeds(uploadBytes(ref(storage, 'tenants/tenant-storage/documents/doc-1/readme.txt'), bytes, { contentType: 'text/plain' }));
  await assertFails(uploadBytes(ref(storage, 'tenants/other/documents/doc-2/readme.txt'), bytes, { contentType: 'text/plain' }));
  await assertFails(uploadBytes(ref(storage, 'tenants/tenant-storage/documents/doc-3/file.exe'), bytes, { contentType: 'application/x-msdownload' }));
});
