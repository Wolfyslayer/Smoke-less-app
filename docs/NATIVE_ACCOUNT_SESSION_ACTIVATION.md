# Android account-scoped session activation

The React Native root now waits for the native Firebase auth observer before mounting the tracker. Every Firebase UID (or guest) mounts a separate keyed tracker instance. Each instance loads through `LocalSessionStorage.switchTo` and writes through `LocalSessionStorage.save`, which serializes saves within that session. Account records are stored under `smoke-less-v6-account:<uid>`; guest records continue using the legacy `smoke-less-v6` key.

## Safety behavior

- Signing in does **not** automatically import guest history.
- Signing out remounts the guest session and restores its own local history.
- Switching between accounts remounts the tracker and loads only that UID's local namespace.
- A failed account load displays an error instead of silently resetting or overwriting account data.
- Cloud preview/import remains explicitly initiated and only targets the signed-in session; no Firebase writes are enabled.
- Pending saves from an old tracker remain targeted at the old session namespace, never the new UID.

## Follow-up work

Add a user-confirmed guest-history copy UI using `migrateGuestHistoryWithBackup` (with single-flight serialization and account-switch checks), plus account-specific recovery/export UX. Verify on a real Android development build: cold start while logged in, guest→A→guest→B→A, offline startup, logout during a save, malformed account data, cloud import and recovery. Existing web CI is not proof of native Android compatibility. Build locally with `npx expo run:android`.
