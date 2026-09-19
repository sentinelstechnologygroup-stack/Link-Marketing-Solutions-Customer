# Link Marketing Solutions Firebase backend foundation

## Current state

- Firebase projects are active under the `sentinelstechnologygroup@gmail.com` account:
  - Website/hosting: `linkmarketing-website`
  - Agent CRM / proposed shared Backend-Core: `linkmarketing-agent-portal-crm`
  - Customer portal/hosting: `linkmarketing-customer-portal`
- Each project already has its requested web app registration.
- This workspace contains multiple frontends and migration snapshots. The root customer portal and the existing Vercel deployment were not changed by this Firebase scaffold.
- Local Firebase work defaults to `demo-linkmarketing-local`, which cannot target a real cloud project. Cloud databases, Auth providers, Storage buckets, Functions, Hosting, and billing have not been provisioned by this setup.

## Architecture proposal to preserve the roadmap

The roadmap calls for one canonical backend contract and tenant-aware shared data. The three Firebase projects should therefore not become three competing operational databases. Proposed division:

- `linkmarketing-agent-portal-crm`: canonical Auth, Firestore, Functions, Storage, audit trail, and shared API/backend.
- `linkmarketing-website` and `linkmarketing-customer-portal`: hosting/project boundaries only, if Firebase Hosting is selected. Their web clients must authenticate against the canonical backend project when they need shared identity/data.
- Development: local Emulator Suite using a `demo-` project ID. A dedicated staging cloud project is not currently part of the requested three-project allocation; do not treat production as staging.

This is a documented proposal, not yet a cloud-side change. It avoids splitting leads, memberships, consent evidence, routing state, and customer records across databases. Before connecting clients, register the needed web app clients in the canonical backend project and explicitly map each frontend's runtime config to that project.

## Local sandbox

From this directory, install the Functions dependencies and start the emulators. Emulator ports are Auth `9099`, Functions `5001`, Firestore `8080`, Storage `9199`, and Emulator UI `4000`. The `.firebaserc` default is deliberately a `demo-` project ID; do not replace it with a production project for local development.

Firestore and Storage rules currently deny all client access. This is intentional until a tenant/membership model and emulator-tested authorization rules are implemented. The only Function is a non-sensitive health diagnostic; no business endpoint or production write path is exposed yet.

## Backend contract: initial canonical domains

The existing Agent CRM inventory and GCR pilot roadmap define the minimum discovery set. Proposed top-level domains are tenants, users, memberships, providers/brands, campaigns, lead sources, consent versions, leads, contact attempts, calls/conversations, qualification templates/responses, follow-ups, routing rules/offers/transfers, appointments, outcomes, billing events/invoice items/disputes, evidence packets, notifications, documents, suppression records, audit events, and security events.

All records must be tenant-scoped. The server derives tenant, role, and permitted brand scope from verified Firebase identity plus persisted membership; browser-supplied organization, role, brand, or user headers are never authorization evidence. Privileged mutations, role assignment, state transitions, telephony/webhooks, routing, billing classification, and audit writes must be server-controlled and idempotent where retries can occur.

## Required gates before production data or GCR traffic

1. Complete feature/field parity inventories for Website, Agent CRM, Customer Portal, and legacy legacy provider entities/actions.
2. Approve the canonical schema, role/membership matrix, state machine, API/event catalog, retention policy, and environment ownership.
3. Implement invitation-only identity, privileged-user MFA, tenant isolation, least-privilege roles, App Check rollout, and deny/allow emulator tests.
4. Implement consent/source/version capture, deduplication/idempotency, suppression and calling-hour controls, approved GCR-only routing, auditable appointments/outcomes, evidence packets, and only contractually billable events.
5. Add secrets through Secret Manager (not client env), monitoring/alerts, backup and restore procedures, and synthetic end-to-end staging tests.
6. Pass the roadmap's release/security/legal/client gates before any production lead ingestion, customer data migration, or paid campaign traffic.

## Billing and irreversible setup

Keep all projects on Spark while the local contract and emulator work proceeds. Cloud Functions deployment and Firebase Storage may require Blaze; enabling Blaze attaches a billing account and can incur charges. Production Firestore also requires choosing a database location that may not be changeable later. Neither billing nor a production database location is changed by this scaffold.
