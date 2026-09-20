const assert = require('node:assert/strict');
const test = require('node:test');
const { assertRoute, canonicalLead } = require('../bridge-contract.cjs');

const route = {
  tenantId: 'tenant-golden-cross-beta', brandId: 'brand-golden-cross-realty', industryId: 'real-estate',
  sourceId: 'source-website', campaignId: 'campaign-pilot', routingProfileId: 'routing-default',
  workflowVersion: '1.0', scriptSetId: 'script-default', qualificationFormId: 'qualification-default',
  consentPolicyId: 'consent-standard', retentionPolicyId: 'retention-standard',
};

test('canonical lead ownership comes only from the server route', () => {
  const lead = canonicalLead(route, {
    name: 'Golden Cross Pilot', email: 'pilot@example.test', tenantId: 'tenant-attacker',
    brandId: 'brand-attacker', industryId: 'other', sourceId: 'source-attacker', isTest: true,
  }, 'agent-a', { id: 'contact-a', name: 'Client Contact' });
  assert.equal(lead.tenantId, route.tenantId);
  assert.equal(lead.brandId, route.brandId);
  assert.equal(lead.industryId, route.industryId);
  assert.equal(lead.sourceId, route.sourceId);
  assert.equal(lead.assignedTo, 'agent-a');
  assert.equal(lead.routedClientContactId, 'contact-a');
});

test('route contract rejects missing immutable policy metadata', () => {
  assert.throws(() => assertRoute({ tenantId: 'tenant-a' }), /immutable fields/);
});
