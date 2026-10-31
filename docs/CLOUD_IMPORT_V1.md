# Confirmed local cloud import (6.1.3)

Signed-in users may explicitly request an import from Firestore into local history. The app previews and rejects conflicts/tombstones, asks for confirmation, reads again and compares against the preview, checks that the signed-in UID and local data are unchanged, saves a recovery copy in AsyncStorage, then updates local state. There are no Firestore writes. A failed backup aborts import.

**Important limitation:** The app still uses one device-wide local history key, not separate per-account local stores. Imported records become part of that device's local history even after sign-out. The UI must make this clear before users proceed; account isolation is required before enabling automatic sync. Recovery snapshots are stored under `smoke-less-pre-cloud-import-*` keys and are not yet exposed in the restore UI. No automatic migration, deletion reconciliation, or two-way sync is enabled.

Manual Android QA: signed-in with empty remote, additive remote, conflict, tombstone, offline, account switch mid-request, changed local history mid-request, and backup write failure. Check that history is unchanged on all failures. Verify app navigation after import. CI must pass before merge.
