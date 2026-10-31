# Account-scoped storage foundation

This PR adds account-specific AsyncStorage helpers using a validated Firebase UID. It does **not** change the active app storage flow yet. Existing history stays in the legacy `smoke-less-v6` key, and the new account namespaces are not read or written automatically.

- A missing account record returns a fresh empty history, never another user's history.
- Malformed records raise errors instead of silently resetting them.
- Guest-to-account copying requires an explicit caller action; existing account keys are never intentionally overwritten by the helper.
- AsyncStorage has no atomic compare-and-swap. Callers must serialize migrations, ensure account identity hasn't changed, and avoid simultaneous writes.

## Required before activation

1. Build an account-aware session state machine that blocks UI and writes while switching users, and ensures writes are flushed before switching storage namespaces.
2. Keep guest data under its existing key; prompt before any guest-to-account copy.
3. Require explicit confirmation and a backup before migration, and never expose one account's records to another account.
4. Make cloud import write to the current account namespace, not the shared legacy key.
5. Test sign-in, sign-out, switching accounts, app restart, offline operation, malformed data, concurrent operations and recovery.

No cloud writes or automatic sync are enabled in this PR.
