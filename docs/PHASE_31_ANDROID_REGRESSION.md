# Fas 31 – automatiserade Android-flöden

## Val och miljö

Maestro CLI väljs för ett litet plattformsnära röktest av en befintlig fristående APK, utan ny appdependency eller native-build per commit. Lokal CLI kräver ingen vald molntesttjänst. Verktygsval och kommandon stöds av [officiell CLI-dokumentation](https://docs.maestro.dev/maestro-cli) och [launchApp](https://docs.maestro.dev/reference/commands-available/launchapp). Ingen Maestro-installation eller Android-körning är gjord här. Runneretiketten `smokeless-qa` är ett krav på framtida egen testmiljö, inte en skapad GitHub-runner.

Den versionshanterade gästsviten finns i `.maestro/guest-smoke.yaml`. Den förbereder tio cigaretter/dag utan ekonomi eller konto, avbryter en registrering, sparar en syntetisk registrering, öppnar historik/statistik, provar SOS/Android Tillbaka och byter tema före omstart. Exakta tider och bildpixlar används inte som assertions. Flödet måste justeras mot faktisk release-UI om en selector är tvetydig; automatiserade källkontrakt är inte bevis för ett godkänt Maestro-flöde.

## Skydd före installation och återställning

`scripts/run-android-e2e.ps1` kräver:

1. Explicit emulatorserial, lokal APK och verifierad SHA-256.
2. Verktygen adb, aapt, Maestro samt AVD med exakt namn `SmokeLess_QA` och `ro.kernel.qemu=1`.
3. APK-paket `com.smokeless.app.preview`, kontrollerat med aapt före installation.
4. Avstängd wifi och mobildata före installation/start. Gästsviten använder inga serverkonton.

Först därefter installeras APK med `-r` och **endast Preview-appens data på den disponibla emulatorn** återställs. Ingen fysisk telefon, ordinarie app eller verklig historik får användas. Köraren återaktiverar inte nätverket efteråt. AVD:n är avsedd att kunna kasseras, inte användas som personlig telefon. Om signering inte tillåter uppgradering stoppar installationen; köraren avinstallerar inte som genväg.

```powershell
# Förbered först disponibel AVD SmokeLess_QA, standalone Preview-APK och CLI-verktyg.
$apkHash=(Get-FileHash -LiteralPath 'C:\QA\preview.apk' -Algorithm SHA256).Hash
./scripts/run-android-e2e.ps1 -Serial emulator-5554 -ApkPath 'C:\QA\preview.apk' -ApkSha256 $apkHash -ReportDirectory 'C:\QA\results'
```

APK och verktyg ska vara betrodda och versionsdokumenterade. CLI måste finnas i samma kommandoruntime; om installationen kräver WSL, konfigurera och verifiera verktygsanslutningen där först. Kopiera inte blint dessa kommandon till en personlig enhet. Rapportera appcommit, APK-hash, native build/runtime, Android/API, Maestro-version och resultat för varje riktig körning.

## CI och täckning

`android-release-smoke.yml` är manuellt och kräver en redan förberedd egen QA-runner, APK-sökväg i `SMOKELESS_QA_APK_PATH`, emulator och verktyg. Det kräver grön validate/rules på exakt commit. JUnit och felsökningsartefakter från den syntetiska offline-emulatorn sparas i sju dagar; inga kontoidentiteter ska finnas i dem. Inget APK laddas ned från godtycklig URL och ingen build eller publicering startas. Workflowet har inte körts och runner finns inte verifierad. Ett rött verkligt röktest är en releaseblockerare, inte ett skäl att hoppa över det.

Snabba Node-tester går fortsatt på varje PR. Isolerade Auth/Firestore/Functions-emulatorfall, migrations-/konflikttester, kontobytes-/raderingsspärrtester samt reminder-/widget-/OTA-tester kompletterar gästsviten. De är inte Android E2E för konto eller Google. Använd inte det gemensamma produktions-Firebase som automatiskt kontotestprojekt. Konto-E2E kräver senare separat verifierad testkonfiguration; tidigare lokala emulatorer använder `smokeless-rules-test`.

## Kvarstående manuell och verklig acceptans

Ingen Maestro-assertion är körd. Onboarding, plan, registrering, historik, SOS, tema och omstart är förberedda, inte avprickade. Upprepa verkligt röktest minst tre gånger och kontrollera att felrapporterna är användbara innan stabilitet rapporteras. Native Google, kontobyte, tvåenhetssynk, bortkoppling/återanslutning, radering och sena återförsök kräver isolerade kontotestflöden och acceptans.

TalkBack ska manuellt kontrollera läsordning, modal fokus/återgång, flikens valda tillstånd, fältetiketter och felmeddelanden. Stor text 1,8–2,0, liten skärm, mörkt/ljust/system och tangentbord/Safe Area ska granskas visuellt. Notisleverans/tryck/DST/bakgrund/omstart, launcher-widget och verklig OTA/native-uppgradering kräver verklig Android-körning. Följ fas 25 och 29:s data-/signeringsgrindar.

Ingen Android-build behövs för testfiler och test-ID:n. Tidigare native-buildbehov kvarstår. Inga tester körs på användarens telefon och ingen build startas enligt användarens beslut.
