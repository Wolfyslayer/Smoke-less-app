# Firestore security rules (Phase 6.1)

The Firebase project is `smoke-less-75efa`. Firebase Authentication providers Google and Email/Password must be enabled separately in Firebase Console.

## Apply rules
1. Firebase Console → Firestore Database → Rules.
2. Replace the editor contents with `firestore.rules` from this repository.
3. Click **Publish**. A GitHub merge **does not deploy Firestore rules**.
4. Confirm the rules are active before enabling any cloud writes.

## Expected access
- Unauthenticated clients: **denied** everywhere.
- Signed-in user A: can read/write `users/A` and documents in `users/A/**`.
- Signed-in user A: cannot read/write `users/B` or `users/B/**`.
- Any other root collections: **denied**.

## Important
These are ownership rules, not data-schema validation. Before enabling sync, introduce document-level schema validation, size limits, safe merging of offline entries, and emulator tests. The app must not blindly overwrite a cloud document when signing in on a second device. The existing AsyncStorage data remains local until migration is implemented. Do not publish test-mode or public rules.
