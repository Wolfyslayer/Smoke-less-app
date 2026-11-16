# Isolerad Android-acceptans för kontoradering

Den publika raderingsflaggan förblir avstängd. För att kunna testa Android-klienten utan att aktivera radering mot den delade Firebase-miljön finns en separat disponibel debug-app: `com.smokeless.app.deletionqa`. Den använder endast `demo-smokeless-qa` i lokala Auth-, Firestore- och Functions-emulatorer. Ingen riktig Google-konfiguration, EAS-identitet, stabil privat signeringsnyckel eller OTA-kanal kopieras till den. Den ersätter inte Preview eller ordinarie app.

`scripts/prepare-deletion-qa.cjs` körs bara i en färsk disponibel utcheckning av fas 25, utan befintlig `app.config.js` eller `android`. Den skapar en syntetisk Firebase-konfiguration i `.expo` och en lokal config-wrapper. Ingen befintlig fil skrivs över. EAS/OTA och påslagen publik raderingsflagga avvisas. Debug-nyckeln skapas av Androids vanliga debugflöde och är inte appens stabila Preview-nyckel.

Vid native start valideras exakt QA-paket, demo-projekt från den faktiska Firebase-appen och `__DEV__`. Fel identitet eller release-build avbryter före emulator-/kontobearbetning. Auth och Firestore kopplas till fasta Android-emulatoradresser före auth-observern. Radering går till samma lokala Functions-emulator. Ingen fri värd/URL och ingen fallback till det driftsatta projektet finns i QA-läget. Webben får ingen QA-aktivering. Vanliga byggen fortsätter med sin befintliga konfiguration.

Förberedelser i disponibel utcheckning:

```powershell
node scripts/prepare-deletion-qa.cjs
npx expo prebuild --platform android --no-install
# Bygg endast debug, aldrig release för denna QA-app.
./android/gradlew.bat -p android :app:assembleDebug -PreactNativeArchitectures=x86_64
```

Kör Firebase-emulatorerna från den granskade källan med `--project demo-smokeless-qa`. Installera enbart med explicit `adb -s emulator-5556`; välj aldrig telefon automatiskt. Metro behövs för debug-appen. Använd nya lokala syntetiska konton, inte de två kontona i den delade Firebase-miljön. Emulatorlösenord får inte checkas in eller skrivas i chatt/loggar.

Verifierat automatiskt vid införandet: TypeScript och 307 ordinarie tester, inklusive avvisat riktigt projekt, fel paket, release-build, EAS/OTA och kontroll av att båda emulatorerna väljs före klientoperationer. Native radering, cache-/widgetstädning, omstart och det andra kontots bevarande är ännu inte verifierade av detta dokument. Tidigare blockerad produktionsansluten QA-build upprepas inte; denna testväg saknar produktionsuppgifter och använder enbart lokal demo-data. Inga fasta acceptanspunkter markeras klara av testinfrastrukturen ensam.
