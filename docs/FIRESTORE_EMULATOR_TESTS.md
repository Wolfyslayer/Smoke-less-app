# Firestore rules CI tests

A dedicated GitHub Actions workflow runs the Firestore emulator and Node's test runner. It checks guest denial, owner access, cross-account isolation, malformed writes, revisions, tombstones, and denied hard deletes.

To run locally with Node 22 and Java 21:

```sh
npm install
npm install --no-save --package-lock=false @firebase/rules-unit-testing firebase
npx firebase-tools emulators:exec --only firestore --project smokeless-rules-test "node --test tests/firestore.rules.test.cjs"
```

Do not publish `firestore.rules` to Firebase Console until this workflow succeeds and the current deployed rules have been compared. This PR only adds tests and local emulator configuration; it does not enable cloud writes or alter guest data.
