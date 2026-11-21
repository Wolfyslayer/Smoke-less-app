#!/usr/bin/env bash
set -euo pipefail
# Disposable certificate for fresh QA installs only. Never a Play upload key.
test -n "${RUNNER_TEMP:-}" && test -n "${GITHUB_ENV:-}"
key_path="$RUNNER_TEMP/smokeless-ci-test.keystore"
keytool -genkeypair -noprompt -storetype JKS -keystore "$key_path" \
  -storepass android -keypass android -alias androiddebugkey \
  -keyalg RSA -keysize 2048 -validity 30 -dname "CN=Smoke Less disposable CI QA"
{
  printf 'SMOKELESS_KEYSTORE_PATH=%s\n' "$key_path"
  printf 'SMOKELESS_KEYSTORE_PASSWORD=android\n'
  printf 'SMOKELESS_KEY_ALIAS=androiddebugkey\n'
  printf 'SMOKELESS_KEY_PASSWORD=android\n'
} >> "$GITHUB_ENV"
echo 'QA certificate created. Do not publish this APK or uninstall an existing app to replace its certificate.'
