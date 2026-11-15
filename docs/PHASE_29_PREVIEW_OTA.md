# Fas 29 – fristående Preview och OTA

## Beslut och verifierat nuläge

Användaren vill fortsätta kodarbetet genom roadmapen men ordnar Android-build senare. Ingen APK-build, OTA-publicering, versionsmanifest-publicering eller installation är utförd av denna fas. Faserna 25/27/28 behåller öppna native-/releasegrindar och får inte markeras slutgodkända för att fas 29 förbereds.

EAS-kontot är verifierat. Befintligt projekt `@wolfyslayer/smoke-less` är oförändrat; ett separat `@wolfyslayer/smoke-less-preview` skapades och lästes tillbaka. Projekt-ID:n finns i `config/projectIdentity.json`, utan credentials. EAS CLI 27.3.0 och Expo SDK 58 inventerades. `expo-updates` 58.0.22 och SDK-anpassad `expo-application` installerades med Expo CLI.

**Tillfälligt delad Firebase enligt uttryckligt användarbeslut:** Preview använder `smoke-less-75efa` tills ett separat projekt finns. Android-appregistrering för `com.smokeless.app.preview` skapades; den verifierade konfigurationsfilen ligger gitignorerad som `google-services.preview.json`. Production-filen och alla regler/användardata är oförändrade. Preview har en synlig varning vid inloggning om gemensam kontomiljö. Ett ändrat app-ID separerar lokal installation och lokala data, inte kontohistorik i det gemensamma projektet. Använd separata syntetiska testkonton.

Preview-EAS-projektets egna preview-miljö har fått filvariabel för Firebase, offentligt Google Web client ID och APP_VARIANT. Inga befintliga production-variabler eller signeringsnycklar ändrades. Preview har ännu ingen registrerad Android-SHA; Google-inloggning får därför inte rapporteras verifierad.

## Konfiguration och gränser

- `app.config.js` återanvänder app.json och väljer strikt development/preview/production. Preview har eget paket, namn, URI-schema, EAS-projekt och kanal. Felaktigt variantnamn eller fel Firebase-paket/projekt avbryter i stället för att falla tillbaka.
- `eas.json` skiljer development-client från fristående Preview APK och store-/productionprofil. Ingen submit- eller automatisk produktionspublicering finns.
- Runtime-versionering använder fingerprint. Native-ändringar kräver en kompatibel ny build. Preview-OTA-workflow är låst till Preview-projekt/kanal, även om APP_VARIANT råkar vara fel; Production har fjärruppdatering avstängd tills ett separat beslut fattas.
- Main:s debug-keystore-plugin är kvar oförändrad och används för development. Fristående Preview/production väljer EAS release-signering och kör inte den development-specifika debug-injektionen. Inga nycklar genererades eller hämtades i denna fas. Första credentials-setup och reproducerbar native-build återstår.
- Widget-pluginen genererar nu Kotlin-namespace, provider, appetikett och deep link från respektive variant. Mockad prebuild verifierar även Preview; inget Android-projekt eller APK byggs av det testet.
- `.easignore` håller genererade native-kataloger, privata filer, nycklar och loggar borta från arkivet. Native-katalogerna är inte versionshanterade här; EAS/CNG genererar dem från config plugins. Firebase-filen tillförs som filvariabel i EAS, inte via Git.

## Uppdateringsupplevelse

En fristående Preview kontrollerar uppdateringar vid start högst var sjätte timme samt manuellt under Appinställningar → Sök efter uppdateringar. Native app-ID, native buildnummer, native runtime, EAS-projekt och kanal valideras innan klienten kan användas. Gamla development-byggen utan de nya native-modulerna får ingen krasch: adaptern är inaktiv där. Production konstruerar ingen uppdateringsklient.

OTA hämtas bara efter vår egen modal och används vid nästa kalla appstart. Ingen programmatisk reload görs som kan avbryta pågående registrering eller sparning. Offline-/delvisa fel ger generisk återhämtningsbar status; checktimestamp lagras under en egen enhetsnyckel och innehåller inga kontouppgifter.

Native-versioner kommer från en fast manifestadress i samma GitHub-repo på `preview-release/releases/preview.json`. Den grenen/filen skapas först när operatören väljer att publicera ett verifierat befintligt EAS-bygge. Manifestet måste ha rätt Preview-app/projekt/kanal, ett högre heltals-buildnummer, runtime, version och en strikt HTTPS-APK-länk under expo.dev/artifacts/eas. Utgångna länkar, fel appar, äldre byggen, credentials/query i URL och andra värdar nekas. Länken kontrolleras igen vid aktivering. Android ansvarar för installationsgodkännande; appen installerar inget tyst och rensar inga data.

## Manuella GitHub-flöden

`preview-ota.yml` publicerar bara Preview-OTA efter verifierat grön validate/rules på exakt commit, nya tester och validerad separat Preview-Firebasefil. `preview-native-manifest.yml` läser ett redan färdigt EAS-bygge, validerar metadata och skriver enbart manifestfilen på preview-release. Den startar ingen build. Publikationen avvisas om ett lika nytt/nyare eller felaktigt manifest redan finns.

Båda kräver EXPO_TOKEN i GitHub-miljön `preview`. OTA-flödet behöver också `PREVIEW_GOOGLE_SERVICES_JSON_BASE64`. Dessa GitHub-secrets har **inte** skapats eller ändrats. De får inte ersättas med en privat inloggningssession eller skrivas i Git/loggar. Inga publicerings-workflows har körts. Versionsmanifestets faktiska tillgänglighet, EAS-artifaktens livslängd och Android-upplevelsen måste verifieras med en verklig Preview-build.

## Windows – när användaren väljer att bygga/publicera

```powershell
$env:APP_VARIANT='preview'
eas project:info
eas credentials --platform android
# Registrera Preview-signeringens SHA i Firebase innan Google-inloggning provas.
eas build --platform android --profile preview
```

Bygget hämtas från Expo-resultatet/dashboarden och installeras som **Smoke Less Preview**, sida vid sida med ordinarie app. Behåll samma Preview-signering för senare uppgraderingar; avinstallera/rensa inte ordinarie app. Efter en verifierad fristående installation kan kompatibel OTA publiceras med det manuella Preview-workflowet eller:

```powershell
$env:APP_VARIANT='preview'
$env:SMOKELESS_PREVIEW_OTA='true'
eas update --channel preview --environment preview --message 'Godkänd Preview-uppdatering'
```

CLI-publicering kräver samma aktuella gröna CI-grind och manuell kontroll som workflowet. Codex ska inte köra detta som en följd av commit/push. Ingen publicering till production är godkänd. Rollback görs via en ny kompatibel Preview-uppdatering eller Expo:s säkra återgång till inbäddad uppdatering; ta aldrig bort kontoraderingslås eller återställ raderad historik som rollback.

**Ny Android-build: JA** för expo-updates/expo-application, variant och widgetnamespace. Ingen build startas nu. Installation, verklig OTA, Google/SHA, widget och två appars samtidiga dataflöden är fortfarande EJ KÖRDA.

## Tekniska källor

[Expo-varianter](https://docs.expo.dev/build-reference/variants/), [runtime och native-kompatibilitet](https://docs.expo.dev/eas-update/runtime-versions/), [SDK 58 Updates API](https://docs.expo.dev/versions/latest/sdk/updates/) och installerad EAS CLI:s GraphQL-byggmetadata användes vid implementationen. API-/kanal-/signeringsval är förberedda; dessa källor är inte bevis för ett faktiskt fungerande APK-resultat.
