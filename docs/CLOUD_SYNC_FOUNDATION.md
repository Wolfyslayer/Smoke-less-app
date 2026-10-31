# Smoke Less 6.1.3 — Cloud sync foundation

This PR introduces a **pure, non-destructive merge preview** for the existing `Data` model in `src/domain.ts`. It does not write to Firestore, replace AsyncStorage, change the UI, or automatically import guest data.

## Current data
- AsyncStorage key: `smoke-less-v6`
- `profile`: one plan per local installation
- `entries`: cigarette registrations with stable `id`
- `cravings`: cravings with stable `id`
- `checkins`: daily confirmations keyed by `date`

## Merge contract
- Distinct entries/cravings/checkins are combined by stable ID/date.
- Identical duplicates are collapsed.
- Same ID/date with different content, or differing non-null profiles, produces a conflict.
- A preview with conflicts is **not safe to apply**; no caller may persist it without explicit resolution.
- This is not deletion-aware: a deleted record could reappear on another device. **Do not enable automatic two-way sync** until tombstones/revisions and conflict resolution are implemented.

## Next implementation steps
1. Add strict Firestore document schema validation, payload limits, and emulator rule tests before cloud writes. Confirm deployed rules match the repository.
2. Define versioned Firestore layout under `users/{uid}` with individual records and revision/deletion metadata. Never store the whole dataset as one last-write-wins document.
3. Build explicit first-sign-in import: show a preview, obtain user confirmation, upload in batches, and mark completion only after successful acknowledgement. Keep local data intact.
4. Add incremental, resumable offline sync with retry, deduplication, tombstones, and account-switch isolation.
5. Verify on two Android devices, including offline edits, sign-out/sign-in, conflicts, and delete propagation.

The app must continue to work without an account. Do not log personal smoking history or credentials.
