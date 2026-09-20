# LMS Firebase production architecture

## Canonical production backend

- Google Cloud display name: `LinkMarketing Platform Prod`
- Firebase project ID: `linkmarketing-agent-portal-crm`
- Firestore location: `nam5`
- Storage bucket: `linkmarketing-agent-portal-crm.firebasestorage.app`
- Authentication: one shared Firebase Authentication user directory

Google Cloud limits project display names to 30 characters, so the console uses
`LinkMarketing Platform Prod` rather than the longer requested name
`LinkMarketing Platform Production`. The immutable project ID is retained.

## Registered web applications

| Application | Firebase app ID | App Check domain |
| --- | --- | --- |
| LMS Website | `1:1089114348316:web:8af2519a66cdddafc778d9` | `linkmarketingservices.co` |
| LMS Customer Portal | `1:1089114348316:web:6d1cf9944ca6ef1cc778d9` | `customer.linkmarketingservices.co` |
| LMS Agent CRM | `1:1089114348316:web:8df2b05d88d1df8cc778d9` | `agent.linkmarketingservices.co` |

The corresponding `.com` domains are also authorized so the transfer can be
completed without recreating App Check keys.

## Security boundaries

Separate Firebase web applications identify the browser clients. They do not
replace authorization. Access is enforced by tenant memberships, Agent
assignments, Brand restrictions, immutable ownership fields, Firestore rules,
Storage rules, callable Function authorization, and audit records.

- Customer users enter through `tenants/{tenantId}/members/{uid}`.
- Agent users enter through `agentUsers/{uid}/assignments/{tenantId}`.
- LMS Super Admin authority is server-verified and audited.
- Browser-supplied tenant, Brand, role, and ownership changes cannot grant access.
- Storage remains partitioned under tenant-owned paths.

## Function boundaries

- `website-ingestion.js`: server-authorized public lead intake.
- `agent-operations.js`: assigned Agent CRM reads, writes, and communications.
- `customer-operations.js`: tenant-member portal operations.
- `platform-administration.js`: provisioning, assignments, policy, projections,
  asset registration, and health administration.
- `platform-core.js`: canonical shared implementation and authorization helpers.

## App Check rollout

All three web apps are registered with domain-restricted reCAPTCHA Enterprise
providers. Portal clients initialize App Check and automatically refresh tokens
when their application-specific site key is present.

Production monitoring confirmed valid attestation from both Customer and Agent
browser sessions. Baseline App Check enforcement is enabled for Authentication,
Firestore, Storage, and every callable Function. The Website's current lead flow
remains server-to-server and is protected by route credentials, origin checks,
rate limiting, consent validation, and server-side tenant routing.

## Reserved projects

- `linkmarketing-customer-portal`: display name `LMS Customer Reserved`
- `linkmarketing-website`: display name `LMS Website Reserved`

These projects contain no production LMS data and must not be selected for
production deployments. They are retained only to prevent accidental reuse or
confusion. Do not delete them without explicit approval.
