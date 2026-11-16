# Firestore security rules – phase 25 review

The Firebase project is `smoke-less-75efa`. Firebase Authentication providers Google and Email/Password must be enabled separately in Firebase Console.

## Apply rules
1. Firebase Console → Firestore Database → Rules.
2. Replace the editor contents with `firestore.rules` from this repository.
3. Click **Publish**. A GitHub merge **does not deploy Firestore rules**.
4. Confirm the rules are active before enabling any cloud writes.

## Expected access
- Unauthenticated clients: **denied** everywhere.
- Signed-in user A: can read the explicitly allowed own collections and write schema-valid, revisioned entry/craving/checkin/plan documents while no deletion lock exists. Parent `users/A`, unknown collections, hard deletes and client control writes are denied.
- Signed-in user A: cannot read/write `users/B` or `users/B/**`.
- Any other root collections: **denied**.

## Important
The repository rules now include document schemas, field limits, revision checks, tombstones and deletion locks. Nine emulator tests passed locally on 2026-11-15. Account data synchronizes through the existing UID-scoped merge workflow; guests stay local unless they explicitly approve copying history. These code/test findings do not verify the deployed production rules. See `PHASE_25_SECURITY_REVIEW.md` for deployment, deletion, backup and two-device release blockers. Never publish test-mode or public rules.
