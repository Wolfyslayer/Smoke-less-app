# Firebase Android foundation — Smoke Less

Firebase project ID: `smoke-less-75efa`  
Android package ID: `com.smokeless.app`

## Local setup
1. In Firebase Console, register Android app `com.smokeless.app`.
2. Download `google-services.json` and save it in the repository root as `google-services.json` (not `google-services (1).json`). It is ignored by Git.
3. Enable **Authentication → Sign-in method → Email/Password** and **Google** in Firebase Console.
4. Create Cloud Firestore in **production mode** (deny-by-default) and **do not open rules** until per-user rules are ready.
5. When configuring native Google sign-in, register the actual SHA-1 and SHA-256 signing certificate fingerprints for the development build; re-download the config if needed.

## Scope of this PR
Sets the stable Android package identifier and documents secure Firebase setup. Does **not** enable Firebase SDK, auth UI, or Firestore sync yet. Existing offline data in AsyncStorage is unchanged. Future changes must include user-scoped Firestore rules, explicit local-data migration and conflict handling, and a native development build before Google sign-in can be tested.

## Safety
Never commit service-account private keys. `google-services.json` is client config rather than an admin credential, but is kept out of this repository until native integration is wired. Do not deploy permissive Firestore rules to production.
