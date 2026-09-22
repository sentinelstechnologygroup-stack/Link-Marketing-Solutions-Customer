# LMS production acceptance record

Date: 2026-09-20

## Release identities

- Platform and Customer source: `c8d6bde`
- Agent source: `9ac1694d7611a74bb33e73724581a025323b2c77`
- Platform release tag: `release/lms-platform-app-check-20260920`
- Agent release tag: `release/agent-app-check-20260920`
- Pre-enforcement rollback tag: `backup/pre-app-check-enforcement-20260920`
- Firebase Functions maintenance source: `42bbe1f`
- Firebase Functions maintenance tag: `release/firebase-functions-7.4.0-20260921`
- Firebase Functions Brand-isolation source: `ec6eb09`
- Firebase Functions Brand-isolation tag: `release/agent-brand-isolation-20260921`
- Firebase Functions communications-scope source: `971e57d`
- Firebase Functions communications-scope tag: `release/communications-scope-20260921`
- Firebase Functions routed-contact source: `dbba194`
- Firebase Functions routed-contact tag: `release/routed-contact-security-20260921`
- Customer export release tag: `release/customer-report-exports-20260921`
- Agent production deployment: `dpl_sKJYWhjmU7kgFNk7NACPpzocgDsa`
- Customer known-good deployment: `dpl_EbUPdwcLvmeUvguifP48WSQik3Ni`
- Website known-good deployment: `dpl_H8FJ8yZw1h9GnKKwFRTrztTeDCH5`

## Golden Cross production pilot

- Tenant: `tenant-golden-cross-beta`
- Brand: `brand-golden-cross-realty`
- Lead: `B4EHHkwiZDX7hH0bh3kB`
- Appointment: `rbsAy3jChzj5hD1YDkdY`
- Follow-up: `PqG7OvgwaGU5XNlMDg60`
- Final lead state: `handed_off`
- Server-authorized ingestion: passed
- Assigned Agent visibility: passed
- Qualification and disposition: passed
- Appointment and follow-up creation: passed
- Customer dashboard and report projection: passed
- In-app notification projection: passed
- Agent and Customer recording download: passed
- Unassigned-tenant Function denial: passed
- Customer cross-tenant denial: passed
- Unassigned-tenant Storage denial: passed

The pilot data is synthetic and intentionally retained as an auditable production
acceptance record.

## Security acceptance

- Emulator authorization and bridge suite: 15 of 15 passed.
- Provisioning, server-authorized ingestion, Agent disposition, appointment,
  Customer projection, audit, notification, tenant denial, and Brand denial:
  passed in one repeatable emulator workflow.
- Agent callable collection reads, record writes, lead transitions, appointment
  workflows, and assignment revocation enforce tenant and Brand ownership.
- App Check browser requests: valid tokens observed from Customer and Agent.
- Callable Functions reject missing App Check tokens.
- Authentication, Firestore, and Storage report `ENFORCED` baseline protection.
- Tenant membership, Agent assignment, Brand path, and immutable ownership checks
  remain the primary authorization boundaries.
- Authenticated Golden Cross Agent production regression: passed with all five
  production-tenant leads visible after the Brand-isolation deployment.
- Permanent Realtor demo tenant remained present and independently selectable.

## Export acceptance

- CSV artifact generation: passed.
- XLSX artifact generation and workbook parsing: passed.
- DOCX artifact generation and Office archive validation: passed.
- PDF artifact generation and trailer validation: passed.
- Zero-data report export preservation in all four formats: passed.
- CSV formula-injection escaping: passed.
- Customer production lint and build: passed.
- Authenticated Golden Cross production report page: passed.
- Production CSV, Excel, Word, and PDF controls: passed with no application
  export errors and no browser console warnings or errors.

The repeatable export gate is `npm run test:exports`.

## Communications acceptance

- In-app notifications: passed.
- Recording upload, metadata, and protected download: passed.
- Communication health checks and pre-provider failure handling: passed.
- Outbound call creation now requires an authorized tenant-and-Brand lead.
- Call lifecycle operations require the persisted tenant-and-Brand call record.
- Cross-Brand call attempts are rejected before provider access.
- Outbound calls must match the authorized lead phone number.
- Warm transfers must match the active Client Contact routed to that lead.
- Destination and routed-contact denial tests: passed.
- Twilio voice and transfers: blocked because no Twilio credentials or caller
  number are installed in the production Functions environment.
- External email delivery: blocked because no production email provider is
  configured.
- SMS: optional and blocked by the same missing provider configuration.

No real customer was called or messaged during acceptance testing.

## Domain gate

The `.com` website and portal names still resolve to Porkbun infrastructure and
do not provide working HTTPS. The `.co` domains remain primary. Do not redirect
or switch the `.co` aliases until the `.com` transfer and Vercel domain
verification are complete.

## Rollback procedure

1. Set App Check service modes for Authentication, Firestore, and Storage from
   `ENFORCED` to `UNENFORCED` through the Firebase App Check API or console.
2. Check out `backup/pre-app-check-enforcement-20260920` and deploy Firebase
   Functions to remove callable enforcement.
3. If a portal regression exists, use Vercel Rollback to restore the deployment
   IDs recorded above.
4. Confirm `.co` aliases point to the restored deployments.
5. Verify Customer and Agent sign-in, then review Function logs before reopening
   production traffic.

Rollback does not require deleting tenants, records, demos, or Storage objects.

## Agent Firebase entity contract release - 2026-09-21

- Agent source commit: `d93f59a` (`Normalize Firebase entity contract`).
- Production deployment: `dpl_4NcqdpXEjw3Da2sJBR9vZnJA9jpG`.
- Production alias: `https://agent.linkmarketingservices.co`.
- Focused Firebase entity-contract test passed.
- Production Vite build passed.
- Live authenticated Golden Cross verification passed: five leads resolve to `Golden Cross Realty`, Brand activity is populated, and the pilot agent tenant menu remains assignment-scoped.
- The repository-wide lint command remains blocked by 15 pre-existing unused-import errors in legacy page files; none are introduced by this release.

## Agent lint-gate release - 2026-09-21

- Agent source commit: `5645238` (`Clear Agent CRM lint gate`).
- Production deployment: `dpl_A6NgmKwG3nHkax9RDMv7uP1tweRq`.
- Firebase entity-contract test, repository-wide lint, and production build all passed.
- The changes remove unused import names only; no page layout, table, card, form, workflow, fixture, or demo behavior changed.
- Live authenticated verification passed with five Golden Cross leads and correct Brand attribution.
