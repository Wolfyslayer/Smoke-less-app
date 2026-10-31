# Guest-to-account migration safety (6.1.3)

The new `migrateGuestHistoryWithBackup` service is **not wired into the UI**. It is a preparatory operation that must only be called after the user has explicitly confirmed a copy of guest history to their currently authenticated account.

Safeguards: validates guest data, checks current Firebase UID before and after asynchronous steps, refuses to overwrite an existing account record, writes a recovery snapshot first, leaves guest history unchanged, and performs no cloud writes.

**Known limitations:** AsyncStorage does not support atomic compare-and-swap; concurrent account writes or two migrations for the same UID must be serialized by the future session controller. A UID change after destination write does not roll back the saved account record. A backup key is returned but a recovery UI is not yet implemented. Account data remains in local device storage; it is not encrypted by this module.

## Next PR / acceptance gates

- Introduce a session controller with account-aware loading and saving; pause writes during account transitions.
- Offer explicit migration confirmation, with a clear distinction between copying guest data and replacing account data.
- Never read another UID's local data when switching accounts.
- Rework cloud import so it targets the current account namespace, not the legacy device-wide key.
- Add automated tests with an AsyncStorage mock for absent/existing destination, malformed data, failed backup, UID switch and concurrent operations, plus native Android QA.

Do not enable automatic cloud sync before those gates are met.
