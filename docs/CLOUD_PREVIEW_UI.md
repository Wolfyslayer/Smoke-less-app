# Cloud comparison preview (6.1.3)

The signed-in account screen now offers **Förhandsgranska molndata**. The button reads only the current Firebase user's Firestore documents, checks data shapes, and compares the result with local history. It displays record counts and conflict status.

No Firestore writes, local storage changes, migrations, or automatic merges are performed. The button is hidden from guest users. A tombstone prevents automatic merging even when there are no ordinary ID conflicts. This preview does not yet resolve deletions, support account-scoped local caches, or perform two-way offline sync.

Manual QA: Test on a native Android build with a signed-in Firebase account and deployed rules; confirm guest mode still works, offline read failures are displayed, and no local history changes after preview. Wait for CI checks before merging.
