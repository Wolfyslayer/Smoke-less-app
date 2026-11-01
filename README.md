# Smoke Less 6.0

Android-first smoking reduction and cessation tracker built with **React Native and Expo SDK 58**. Firebase Auth/Firestore use native React Native Firebase modules; guest mode works without an account.

## Native Android development

Use Node.js 22, JDK 17 and the Android SDK. Add the Android Firebase configuration file as `google-services.json` at the repository root (it is gitignored). Its package name must match `com.smokeless.app`.

```sh
npm ci
npx expo prebuild --platform android
npx expo run:android
```

This app requires a **development build**, not Expo Go, for native Firebase. No EAS Build is required.

## Native Android CI (manual)

The `Native Android build (manual)` workflow generates the Android project with Expo Prebuild and runs Gradle `assembleDebug`. To use it, add repository Actions secret `GOOGLE_SERVICES_JSON_BASE64` containing the **base64-encoded full contents** of your Android `google-services.json`, then run the workflow from the Actions tab. The workflow verifies that the Firebase configuration contains `com.smokeless.app` and uploads the debug APK as a temporary artifact. Never commit the Firebase file or upload signing credentials.

The existing pull-request CI checks TypeScript, unit tests and web export. **Web export does not validate native Android builds.** A green PR alone is not proof of Android compatibility; run the native workflow and test the APK on an Android device.

## Privacy and data safety

History is stored locally first. Guest-to-account migration requires explicit consent; account-isolated storage modules are still being integrated into the UI. Cloud import is read-only until explicitly approved and cloud writes are not yet enabled.

Smoke Less is a wellness tracker, not medical advice.

## Phase 6.7 – Automatic synchronization

**Scope:** Implement automatic, account-isolated synchronization after login, on app open when signed in, and after local history changes. Preserve guest history locally and show a clear warning that guest data is not cloud-backed. Never silently upload guest history to an account; explicit migration consent remains mandatory.

**Implementation gates:**

1. Audit current session, Firebase auth, local history persistence and read-only cloud import paths.
2. Define signed-in sync triggers and ensure they do not run in guest mode.
3. Add safe debouncing and duplicate-run prevention for history-triggered sync.
4. Handle offline and permission failures without dropping local records.
5. Add tests for sign-in, app start, history changes, sign-out and guest isolation.
6. Keep two-way conflict resolution as a separate phase 6.8 task; do not enable unsafe writes before the data contract is validated.

**Status:** Phase 6.7 started; implementation and tests pending. CI passing is required for each subsequent commit.
