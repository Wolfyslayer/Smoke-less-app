# Cloud Firestore v1 schema proposal (6.1.3)

**No cloud writes or migrations are activated by this PR.** Existing AsyncStorage key `smoke-less-v6` remains authoritative.

## Proposed layout
- `users/{uid}/settings/plan`: versioned profile/plan, with revision and update metadata
- `users/{uid}/entries/{entryId}`: cigarette events
- `users/{uid}/cravings/{cravingId}`: craving events
- `users/{uid}/checkins/{yyyy-MM-dd}`: daily confirmations
- `users/{uid}/sync/device-{deviceId}`: device cursor, only after defining secure device IDs

Each record will need `schemaVersion`, `updatedAt`, a revision, and a `deleted` tombstone. Profile and checkins need conflict resolution; never overwrite silently. Use the existing event IDs for idempotent upload.

## Security prerequisites before writing
The existing deployed rules are owner-scoped, but do **not** validate field schemas, document sizes, revision monotonicity, or timestamps. Extend rules with explicit collection matches, field allowlists, type/range constraints, and request-size limits; add Firebase Emulator Suite allow/deny tests for guest, owner, other user, malformed writes, and deletes. Do not trust TypeScript client validation as a security boundary.

## Migration prerequisites
Before account linking, preserve a restorable local snapshot; show an explicit import preview and require confirmation. Make imports retryable and idempotent, never replace a cloud dataset wholesale, and never delete local history on logout. Prevent cross-account local-data leakage by scoping caches per UID and keeping guest data separate.

## Offline prerequisites
Use a durable queue and acknowledgements, handle reconnection, deleted-record tombstones, concurrent edits and app restarts. Validate server data before merging. Data export and full account deletion follow in 6.1.4.

The path helpers and validators in `src/cloudSchema.ts` are a preliminary client-side contract only; they do not activate sync.
