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

## Phase 7.0 – Beta testing, quality assurance and launch

The release process is tracked in the phase 7.0 pull request. Before distributing a beta:

- [ ] Confirm both pull-request CI workflows pass on the latest commit.
- [ ] Run the **Native Android build (manual)** workflow with the configured Firebase secret and verify the generated debug APK installs and starts.
- [ ] Test login, guest mode, profile, reminders, backup export and restore on a physical Android device.
- [ ] Test small-screen layout, larger system font sizes, keyboard interaction and TalkBack navigation.
- [ ] Check privacy notices, permissions and data-handling claims against actual app behavior.
- [ ] Record any beta defects and fix blockers before declaring a release candidate.

A successful TypeScript/web CI run is **not** equivalent to a tested Android release. Do not mark physical-device checks as completed without evidence.

## Phase 7.0 – Validation coverage audit (2026-11-01)

The pull-request workflow `.github/workflows/ci.yml` uses Node.js 22 and executes TypeScript checking, domain tests, local storage tests, account migration tests and web export. The separate `.github/workflows/firestore-rules.yml` runs the Firestore rules emulator tests. The native Android workflow `.github/workflows/native-android.yml` is **manual**: it needs the repository secret `GOOGLE_SERVICES_JSON_BASE64`, runs Expo prebuild and Gradle debug assembly, then uploads an APK artifact retained for seven days. These checks do not establish that the APK launches correctly or that notifications, Firebase authentication, backup restore and accessibility work on a real Android device. The latter are outstanding acceptance-test gates.

## Android beta acceptance procedure

1. In GitHub Actions, select **Native Android build (manual)** and run it against the current phase branch. This requires the configured `GOOGLE_SERVICES_JSON_BASE64` repository secret.
2. Confirm that the Gradle build and APK validation steps pass and download the `smoke-less-android-debug` artifact before its seven-day retention expires.
3. Install the APK on a physical Android device. Verify app launch, sign-in, guest mode, data persistence, reminders, backup/restore, and accessibility.
4. Record Android version, device model, tested commit, outcomes, and reproducible defects in the pull request. Do not mark the native acceptance gate complete without this evidence.

This debug APK is for testing, not a signed Google Play production release.
