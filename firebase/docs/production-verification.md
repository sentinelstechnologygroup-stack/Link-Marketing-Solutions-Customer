# Production verification checklist

Before production approval, use a real invited tenant member and verify:

- Upload a PDF under `tenants/{tenantId}/documents/{documentId}/...`.
- Confirm a different tenant cannot read or download that file.
- Download the file through the Customer Portal protected-document action.
- Generate a live report and export CSV, XLSX, PDF, and DOCX.
- Create and transition a lead, then confirm the audit event.
- Create, confirm, reschedule, cancel, and complete an appointment.
- Confirm Twilio health reports `configured: true` only after secrets are installed.
- Confirm a signed Twilio webhook is accepted and an invalid signature is rejected.

The Realtor demo remains fixture-backed and must not be used as evidence for production tenant readiness. Golden Cross remains an isolated beta tenant.
