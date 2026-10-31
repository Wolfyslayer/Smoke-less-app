# Native Firebase SDK — Smoke Less

Project: `smoke-less-75efa`; Android application ID: `com.smokeless.app`.

## Prerequisites
- Firebase Authentication: Google and Email/Password enabled.
- Firestore created in production mode with the owner-only rules from `firestore.rules` **published** in Firebase Console.
- Place the downloaded Android client configuration at the repository root, named exactly `google-services.json`. It is gitignored and must be present on the machine performing native prebuild/EAS build. Do not upload a Firebase Admin SDK service-account JSON.

## Native Android development build
```bash
npm install
npx expo install --check
npx expo prebuild --platform android
npx expo run:android
npx expo start --dev-client
```

On Windows, `expo run:android` requires Android Studio/SDK, JDK and a configured Android device or emulator. Alternatively use EAS development builds; provide `google-services.json` securely to the build environment before prebuild.

**Important:** This SDK requires a native development build; Expo Go cannot load these native modules. Rebuild when adding or changing native packages/plugins, not for ordinary JS/TS/UI changes.

## Scope and safety
This change installs native SDK packages and configures Android Google Services for prebuild. It does **not** call Firebase APIs at runtime, create accounts, migrate AsyncStorage data, or write to Firestore. Keep all existing local data unchanged. Authentication UI, SHA-1/SHA-256 registration, Google Sign-In, emulator rules tests, and conflict-safe sync follow in separate PRs. Do not assume Google Sign-In works until the build's signing certificate fingerprints are registered in Firebase.

## CI
Web export and unit tests do not initialize native Firebase modules. `npm install` resolves the added packages and refreshes the lockfile; commit the resulting `package-lock.json` before relying on `npm ci` or reproducible EAS builds.
