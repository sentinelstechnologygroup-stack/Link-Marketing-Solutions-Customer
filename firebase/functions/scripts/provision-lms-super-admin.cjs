const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'linkmarketing-agent-portal-crm';
const email = String(process.env.LMS_SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.LMS_SUPER_ADMIN_PASSWORD || '');
const displayName = String(process.env.LMS_SUPER_ADMIN_NAME || 'LMS Super Admin').trim();

if (process.env.CONFIRM_LMS_SUPER_ADMIN !== 'yes') {
  throw new Error('Set CONFIRM_LMS_SUPER_ADMIN=yes to provision a production LMS Super Admin.');
}
if (!email || !email.includes('@')) throw new Error('LMS_SUPER_ADMIN_EMAIL is required.');
if (password.length < 16) throw new Error('LMS_SUPER_ADMIN_PASSWORD must contain at least 16 characters.');

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });

async function main() {
  const auth = getAuth();
  const db = getFirestore();
  let user;
  let created = false;
  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    user = await auth.createUser({ email, password, displayName, emailVerified: false, disabled: false });
    created = true;
  }

  const tenants = await db.collection('tenants').get();
  if (tenants.empty) throw new Error('No production tenants are available for administrative assignment.');
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.set(db.doc(`users/${user.uid}`), {
    uid: user.uid,
    email,
    displayName,
    title: 'LMS Super Admin',
    status: 'active',
    updatedAt: now,
    ...(created ? { createdAt: now } : {}),
  }, { merge: true });
  batch.set(db.doc(`agentUsers/${user.uid}`), {
    uid: user.uid,
    email,
    displayName,
    role: 'super_admin',
    status: 'active',
    updatedAt: now,
    ...(created ? { createdAt: now } : {}),
  }, { merge: true });

  for (const tenantDocument of tenants.docs) {
    const tenant = tenantDocument.data();
    const tenantId = tenantDocument.id;
    const assignmentId = `${user.uid}__${tenantId}`;
    const assignment = {
      assignmentId,
      agentUid: user.uid,
      tenantId,
      tenantName: tenant.name || tenantId,
      industry: tenant.industry || tenant.vertical || 'general',
      brandId: null,
      brandIds: [],
      campaignIds: [],
      sourceIds: [],
      scope: 'all',
      permissions: ['*'],
      role: 'admin',
      status: 'active',
      assignedBy: 'lms-super-admin-provisioning',
      createdAt: now,
      updatedAt: now,
    };
    batch.set(db.doc(`agentAssignments/${assignmentId}`), assignment, { merge: true });
    batch.set(db.doc(`agentUsers/${user.uid}/assignments/${tenantId}`), assignment, { merge: true });
    batch.set(db.collection(`tenants/${tenantId}/auditLogs`).doc(), {
      tenantId,
      actorUid: 'lms-super-admin-provisioning',
      action: created ? 'lms_super_admin.assignment.provisioned' : 'lms_super_admin.assignment.refreshed',
      target: user.uid,
      metadata: { role: 'lms_super_admin' },
      occurredAt: now,
      createdAt: now,
    });
  }
  batch.set(db.collection('auditLogs').doc(), {
    actorUid: 'lms-super-admin-provisioning',
    action: created ? 'lms_super_admin.provisioned' : 'lms_super_admin.refreshed',
    targetUid: user.uid,
    tenantCount: tenants.size,
    createdAt: now,
  });
  await batch.commit();

  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    lmsSuperAdmin: true,
    platformAdmin: true,
  });
  await auth.revokeRefreshTokens(user.uid);

  console.log(JSON.stringify({ created, uid: user.uid, email, role: 'lms_super_admin', tenantCount: tenants.size }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
