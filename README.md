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
