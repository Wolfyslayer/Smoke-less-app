# Smoke Less 💚
A privacy-first Swedish smoking cessation companion built with Expo, React Native and TypeScript.

## Start
```bash
npm install
npx expo start
```
Open the QR code in Expo Go with the matching Expo SDK. Android/iOS development builds are recommended for reliable notification testing.

## Included in v0.1
- Smoke-free timer and estimated savings
- SOS breathing exercise and craving journal
- Trigger/intensity logging and non-judgmental lapse tracking
- Editable baseline and local persistence
- Opt-in daily local reminder at 09:00
- EAS development/preview build profiles and CI

## Next
Onboarding, customizable reminder schedule, accessibility audit, i18n, charts, milestones, tests, export/delete data, and validated health guidance.

## Android APK
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
Remote push requires a development/production build, credentials and a server; this app currently schedules local reminders only.

No account, backend, analytics or data transmission is required. Calculated savings are estimates. This app does not replace clinical smoking cessation care.

## Adaptive tapering
After three completed smoking intervals, the app offers an optional +15 minute increase (maximum 180 minutes). The user can accept or dismiss it. No target changes automatically. This is a motivational feature, not medical guidance.

## GitHub Pages web preview
The Expo web export is deployed by GitHub Actions to https://wolfyslayer.github.io/Smoke-less-app/ after each push to main. In repository Settings → Pages, choose **GitHub Actions** as the build and deployment source. This is a browser preview: native notification scheduling is intentionally disabled on web, and local storage is per-browser. Test local notifications on an Android device/development build.
