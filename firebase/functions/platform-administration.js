const core = require('./platform-core');
const bridge = require('./bridge');

module.exports = {
  health: core.health,
  createAgentAssignment: core.createAgentAssignment,
  revokeAgentAssignment: core.revokeAgentAssignment,
  setIndustryConfig: core.setIndustryConfig,
  provisionClient: bridge.provisionClient,
  registerTenantAsset: bridge.registerTenantAsset,
  projectLeadActivity: bridge.projectLeadActivity,
  projectAppointmentActivity: bridge.projectAppointmentActivity,
};
