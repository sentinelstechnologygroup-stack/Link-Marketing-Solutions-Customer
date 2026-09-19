const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
  assertFails,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { getBytes, ref, uploadBytes } = require('firebase/storage');

const rulesDir = path.resolve(__dirname, '../..');
let env;

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-linkmarketing-rules-test',
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
