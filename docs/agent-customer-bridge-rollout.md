# Agent-to-Customer Portal bridge rollout

## Stable rollback points

- Agent CRM Git baseline: `97d9674b3d5e2d146e50aabfba7e9ef8884b55b1`
- Agent CRM tag: `backup/agent-production-20260920`
- Agent Vercel deployment before bridge: `dpl_5U3ePMe197Y49tVU8rJSMpSUdjcn`
- Customer Vercel deployment before bridge: `dpl_HdAQef9EW7cyDEBVxFpoNMAygo6e`
- Website Vercel deployment before bridge: `dpl_2FDnbGL5asjYQSKVoddgadh6iv8V`
- Customer source tag: `backup/customer-portal-pre-live-20260919`

## Ownership contract

Every ingested lead receives server-owned `tenantId`, `brandId`, `industryId`, `sourceId`, `campaignId`, `routingProfileId`, `workflowVersion`, `scriptSetId`, `qualificationFormId`, `consentPolicyId`, `retentionPolicyId`, and `receivedAt` values. The ingestion endpoint resolves those values from `ingestionRoutes/{routeKey}` and ignores browser-supplied ownership fields.

Customers receive access through active tenant memberships. Agents and supervisors receive access through active tenant and Brand assignments. LMS Super Admin access is granted only by a trusted Firebase custom claim.

## Deployment order

1. Preserve the current Vercel deployments and Git tags listed above.
2. Deploy Firestore rules and indexes.
3. Deploy Storage rules.
4. Set `LMS_INGESTION_KEY` in Firebase Functions and the Website Vercel project.
5. Deploy Functions.
6. Set the Website `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN`, and server-only `LEAD_ROUTE_KEY` values.
7. Deploy Agent CRM, Customer Portal, and Website.
8. Provision `tenant-golden-cross-beta`; never modify `tenant-golden-cross-demo`.
9. Run the Golden Cross pilot and security acceptance matrix.

## Golden Cross acceptance flow

1. Submit a clearly marked beta lead through the protected `golden-cross-beta` route.
2. Confirm immutable ownership and an assignment to an authorized Agent CRM user.
3. Record qualification, disposition, notes, and follow-up activity.
4. Schedule and confirm an appointment or handoff.
5. Confirm the matching Customer Portal membership can see the lead, appointment, activity, and notification.
6. Confirm every other tenant and Brand receives permission-denied for read, update, export, and Storage download attempts.
7. Confirm desktop and mobile direct routes load without changing the demo experience.

## Rollback

Promote the recorded stable Vercel deployment for the affected application. Redeploy the previous Firebase rules and Functions revision from the Git rollback tag if backend behavior must also be restored. Do not delete new tenant records during rollback; disable the related `ingestionRoutes/{routeKey}` document and mark the tenant `suspended` so audit history remains intact.
