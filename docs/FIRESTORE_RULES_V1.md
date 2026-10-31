# Firestore rules v1 — publication checklist

This change **does not deploy rules**. Existing Firebase Console rules remain active until explicitly published.

## Scope
- Owner-only reads of `users/{uid}/entries/*`, `cravings/*`, `checkins/*`, and `settings/plan`.
- Only documents with `schemaVersion: 1`, `updatedAt` (Firestore timestamp), positive `revision`, and `deleted` (boolean) can be created/updated.
- Revision must start at 1 and increment exactly once per update.
- Hard deletes are denied; future sync will use tombstones.
- All other document paths and parent writes are denied.
- Basic field allowlists, ranges, and string size limits are enforced.

## Required before publication
Run Firebase Emulator Suite rules tests for anonymous users, owner, other users, malformed records, revision replay, tombstone updates, and denied hard deletes. Verify Firestore Rules parser and compatibility. The repository does **not** yet contain a verified emulator test suite.

## Compatibility warning
This replaces the previous broad per-user allow rule. Any code writing `users/{uid}` directly or writing unversioned documents will be denied. The current app does not perform cloud writes, so local guest data remains unchanged. Publish these rules only after emulator verification; do not merge/deploy them as a substitute for testing.

## Future work
Add server timestamp freshness constraints, per-record document size tests, rules emulator CI, and native cloud service with offline queue and conflict resolution. Do not enable sync until those checks pass.
