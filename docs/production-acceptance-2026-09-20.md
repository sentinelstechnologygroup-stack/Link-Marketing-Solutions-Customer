# LMS production acceptance record

Date: 2026-09-20

## Release identities

- Platform and Customer source: `54b30cbf7780025b031cadcf9dd0987d17643bb3`
- Agent source: `9ac1694d7611a74bb33e73724581a025323b2c77`
- Platform release tag: `release/lms-platform-app-check-20260920`
- Agent release tag: `release/agent-app-check-20260920`
- Pre-enforcement rollback tag: `backup/pre-app-check-enforcement-20260920`
- Agent production deployment: `dpl_sKJYWhjmU7kgFNk7NACPpzocgDsa`
- Customer known-good deployment: `dpl_Ezu5QYifac4vdH3Y7dENg9hXHJ4W`
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

- Emulator authorization suite: 14 of 14 passed.
- App Check browser requests: valid tokens observed from Customer and Agent.
- Callable Functions reject missing App Check tokens.
- Authentication, Firestore, and Storage report `ENFORCED` baseline protection.
- Tenant membership, Agent assignment, Brand path, and immutable ownership checks
  remain the primary authorization boundaries.

## Communications acceptance

- In-app notifications: passed.
- Recording upload, metadata, and protected download: passed.
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
