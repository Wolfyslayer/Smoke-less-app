# Cloud sync 6.1.3: read-only preview groundwork

This PR adds an authenticated Firestore **read-only** snapshot adapter for native devices, using the existing `previewMerge` conflict detector. It does not enable cloud sync, import data, mutate AsyncStorage, or write to Firestore. The adapter is not wired to the UI yet.

- The authenticated Firebase UID must match the requested UID before and after the read.
- Unknown schemas and invalid record data fail closed.
- Tombstones block `safeToApply` because deletions cannot yet be reconciled.
- Any profile/record conflict remains unresolved and blocks automatic application.
- No guest data is uploaded or silently associated with an account.

## Manual deployment through GitHub Actions

`Deploy Firestore rules (manual)` runs only through **Actions → Run workflow** on the trusted `main` branch. It tests the app and Firestore emulator rules **before** deploying production rules.

Configure GitHub environment `firebase-production` with required reviewers, and two secrets:
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: full workload identity provider resource name
- `GCP_FIREBASE_DEPLOY_SERVICE_ACCOUNT`: deployer service account email

Set up Google Cloud Workload Identity Federation with GitHub OIDC, restricting trust to this exact repository and main branch. Grant the service account only the permissions required for Firestore rules deployment (Firebase Rules administration) in project `smoke-less-75efa`. Avoid JSON service-account keys. Deployment does **not** run automatically on PRs or merges.

If WIF is not configured, the workflow will fail at authentication and will not deploy. The workflow does not create Google Cloud identities or permissions.

## Next
Add account-isolated local snapshots, a user-confirmed import flow, tombstone-aware conflict resolution, and resumable offline sync. Test on Android before enabling writes.
