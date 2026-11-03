# Beakim CRM & Hospitality Architecture: Disaster Recovery Protocol (DRP)

**Document Status:** Production Operational Deliverable (Audit Gate A10)  
**Date:** November 2026  
**Auditor Finding Reference:** A10  

---

## 1. RPO and RTO SLA Commitments

- **Recovery Point Objective (RPO):** Maximum **5 minutes**.
  - All financial transactions, bookings, till payments, and maintenance approvals trigger atomic file writes (`fs.renameSync` via temporary staging files) and immediate cloud CAS synchronization to Upstash Redis.
  - Periodic automated database snapshot rotations occur every 60 minutes locally and remotely.
- **Recovery Time Objective (RTO):** Maximum **15 minutes**.
  - Stateless Vercel serverless deployment allows immediate traffic rerouting.
  - Encrypted database container restoration executes in under 60 seconds from any cold backup snapshot.

---

## 2. Cryptographic Container Architecture

The Beakim CRM database (`data_store.enc`) is protected by **AES-256-GCM** authenticated encryption:
1. **Key Derivation:** The encryption key is derived using SHA-256 over `process.env.CRM_SECRET` or `process.env.SESSION_SECRET`.
2. **Tamper-Evident Authentication:** Each encrypted block includes a 16-byte initialization vector (IV) and a 16-byte authentication tag (`authTag`). Any bit modification or unauthorized alteration outside the application causes immediate authentication rejection (`Unsupported state or unable to authenticate data`).
3. **Audit Ledger Chaining:** High-value actions (financial payouts, till verification, cancellations, check-out overrides) are signed into `db.auditLogs` with SHA-256 tamper-evident hash chaining linking each entry to its predecessor.

---

## 3. Cold Storage & Snapshot Rotation Routine

### 3.1 Local Snapshot Structure
Snapshots are automatically generated in `Beakim CRM/backups/`:
- `db-snapshot-<timestamp>.enc`: Full AES-256-GCM encrypted database copy.
- The system automatically retains the last **30 rolling snapshots**, pruning older snapshots to manage storage budgets while ensuring multiple daily restore points.

### 3.2 Cloud Replication
When `UPSTASH_REDIS_REST_URL` or `REDIS_URL` is configured:
- The authoritative store is mirrored with monotonic integer revision counters (`storeRevision`).
- Compare-and-Swap (CAS) optimistic concurrency prevents split-brain writes during multi-instance execution.

---

## 4. Step-by-Step Restoration Drill Procedure

In the event of an infrastructure outage, catastrophic host failure, or data corruption incident, follow this drill:

### Step 1: Quarantine & Cold-Stop
1. Terminate or pause traffic to the affected CRM instance:
   ```bash
   vercel rollback [deployment-id]
   ```
2. Verify that no background cron processes are actively dispatching outbox messages:
   ```bash
   # Temporarily disable CRON runner or revoke CRON_SECRET in environment
   ```

### Step 2: Snapshot Verification & Decryption Check
1. Locate the most recent healthy snapshot in `backups/` or cloud storage:
   ```bash
   ls -lat "Beakim CRM/backups/"
   ```
2. Verify the candidate snapshot using the automated verification harness:
   ```bash
   node -e "
     const { decrypt, DatabaseLoadError } = require('./Beakim CRM/lib/db');
     const fs = require('fs');
     const rawEnc = fs.readFileSync('Beakim CRM/backups/db-snapshot-[LATEST].enc', 'utf8');
     const decrypted = JSON.parse(decrypt(rawEnc));
     console.log('Snapshot Valid! Units:', decrypted.units?.length, 'Bookings:', decrypted.bookings?.length);
   "
   ```

### Step 3: Atomic Restore
1. Stage the verified snapshot to `data_store.enc`:
   ```bash
   cp "Beakim CRM/backups/db-snapshot-[LATEST].enc" "Beakim CRM/data_store.enc"
   ```
2. If cloud store is active, increment `storeRevision` and execute cloud resynchronization:
   ```bash
   node -e "
     const { ensureCloudSynced, saveDbAsync, getDb } = require('./Beakim CRM/lib/db');
     (async () => {
       await saveDbAsync(getDb());
       console.log('Cloud store restored and synchronized.');
     })();
   "
   ```

### Step 4: Health Verification & Traffic Restoration
1. Run the CRM verification matrix:
   ```bash
   cd "Beakim CRM"
   node tests/clean-code-unit.test.js
   node tests/audit-production-readiness.test.js
   ```
2. Resume production traffic and verify live health endpoint:
   ```bash
   curl -I https://crm.beakim.co.ke/api/health
   ```
3. Document incident in `docs/INCIDENT_LOG.md`.
