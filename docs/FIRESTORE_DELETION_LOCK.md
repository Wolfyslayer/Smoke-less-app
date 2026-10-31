# Firestore deletion lock — deployment gate

This PR changes **rules only**, not the app. Do not create a deletion lock in production yet.

## Lock path and ownership
- Path: `users/{uid}/control/deletion`.
- A trusted server using Firebase Admin SDK must create/manage this document; client rules deny all writes.
- Presence of the document means **locked**, regardless of its fields. Do not write a placeholder document for unlocked accounts.
- The owner can read the lock; other users cannot.

## Expected rules behavior
| Case | No lock | Lock exists |
| --- | --- | --- |
| Owner reads their data | Allow | Allow |
| Owner creates a record | Allow | Deny |
| Owner updates a record | Allow (revision/validation required) | Deny, except tombstone transition |
| Owner changes deleted:false → true with only metadata revision/timestamp changes | Allow under existing validation | Allow |
| Owner changes deleted:true → false | Existing normal-write rules may allow | Deny |
| Owner deletes a record physically | Deny | Deny |
| Other user reads/writes | Deny | Deny |
| Client creates/updates/deletes lock | Deny | Deny |

## Mandatory Firebase emulator checks before deploying rules
1. Owner writes to each of `entries`, `cravings`, `checkins`, and `settings/plan` before lock.
2. Admin SDK creates lock; the same owner and a second stale client can no longer create or modify live data.
3. Owner can only transition existing live records to tombstones with revision + 1 and server timestamp; cannot alter payload, remove records or resurrect tombstones.
4. An unrelated account remains writable.
5. Cross-account reads and writes to the lock and user data are rejected.
6. Removing lock with Admin SDK restores normal writes only after deletion has been verified complete.
7. Verify existing valid documents and rules compatibility with real Firestore emulator; no emulator run was performed in this PR.

## Important follow-up
- Implement a server-authoritative deletion operation with recent authentication and resumable progress.
- Teach all current app sync/read paths to check the lock and fail closed before exposing any destructive UI.
- Deploy tested rules before releasing deletion clients. Existing clients will be blocked from writing when the lock exists, even if they have not been updated.
- A client-only deletion implementation is **not** safe.
