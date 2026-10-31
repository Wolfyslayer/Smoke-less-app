# Local session storage controller

`src/localSessionStorage.ts` introduces a standalone queue for account-aware local persistence. It is **not activated in the UI**. `switchTo({kind:'account',uid})` loads the UID-specific namespace; `switchTo({kind:'guest'})` loads the existing guest key. The queue waits for pending saves before switching and refuses saves tagged with an obsolete session. Invalid account records cause an error, not an empty-history overwrite.

The controller intentionally does not copy legacy data into a signed-in account. The explicit migration helper from PR #65 remains separate. There are no Firebase writes.

## Before enabling in the app

- Wait for Firebase auth initialization before choosing the first session.
- Suspend editing and persistence during transitions; do not render the previous user's history in the new session.
- Rework the React state lifecycle so writes are tagged to the session in which the edits originated, and are queued before switches.
- Ensure cloud import saves to the correct account namespace and never silently merges across accounts.
- Test account A -> guest -> account B -> A, failed reads, pending writes, offline startup, and recovery backups on a physical Android device.

**Caution:** This queue serializes operations made through a single controller instance only. Direct `save()` calls from the legacy UI bypass it until the UI is migrated. No active account isolation is claimed yet.
