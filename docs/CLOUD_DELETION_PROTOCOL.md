# Cloud history deletion protocol (design gate)

Status: design only. **Do not expose a destructive UI until all acceptance checks pass.**

## Existing constraints (verified in code)
- Cloud sync is additive and reads four Firestore subcollections under `users/{uid}`: `settings/plan`, `entries`, `cravings`, `checkins`.
- The current read path ignores `deleted:true` documents but reports tombstones; sync aborts when any tombstone is present.
- The Firestore rules deny hard deletes, allow owner-only updates with `revision + 1`, and currently deny writes to parent `users/{uid}`.
- Per-account local cache is independent of guest storage. Guest reset and account reset must remain separate.
- The current cloud inventory counts **active** documents, not tombstones.

## Required deletion model
1. Authenticate the current user and require recent sign-in before a destructive operation. Re-check UID at every asynchronous boundary.
2. Require explicit confirmation with a clear explanation of scope. Provide a JSON export first.
3. Persist a **server-authoritative deletion lock/epoch** for the account before touching documents. The lock must be enforced by Firestore rules for all sync writers, including other devices, and readable before any sync attempt. A local-only flag is insufficient.
4. Make all sync/import/migration entry points refuse to write when a deletion lock is present. Fail closed on permission, network, and malformed-lock errors; never treat an unreadable lock as absent.
5. Under the lock, mark every document in `settings/plan`, `entries`, `cravings`, and `checkins` deleted using revisions and validated metadata. Use paginated/bounded batches and record progress so partial failure is resumable.
6. Validate that the server inventory contains no active documents. Keep deletion markers or an epoch so stale clients cannot re-create old records. Deletion of Firebase Auth user is a **separate** flow and cannot silently remove Firestore subcollections.
7. Only after verified cloud deletion, clear the account-specific local cache using the serialized storage queue, update in-memory state, and prevent pending saves from restoring it. Do not touch the guest namespace.
8. If any step fails, show partial completion and leave the lock in place. Never report success prematurely. Recovery must be idempotent and must not unlock before the server is consistent.

## Deployment sequence
A. Add server-side rules and lock data model; test in Firebase emulator (unauthorized user, second device, stale writer, offline client, revision conflict).
B. Deploy rules and verify reads/writes in a development Firebase project.
C. Add fail-closed lock checks to all sync paths and release compatible clients.
D. Implement resumable tombstone writer and account-local cache reset with recovery tests.
E. Expose deletion UI with confirmation, status, backup, and error recovery.
F. Implement Firebase Auth account deletion separately with reauthentication and a server-side cleanup strategy.

## Must-pass acceptance tests
- Two devices: stale device cannot resurrect deleted records.
- Network interruption halfway through deletion: restart resumes safely.
- Guest data and a different signed-in account remain unchanged.
- Invalid/partial Firestore documents stop deletion safely.
- New sign-in during deletion aborts work for the previous UID.
- Backup failure prevents deletion.
- Deletion succeeds only when server verification succeeds.
- Old app versions cannot write after the lock is set.

Do not deploy a client-only delete operation: it would be unsafe with the current additive sync and permissive update rules.
