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

## Första native-provet och belagt omstartsfel

Debug-APK från 6eee38e byggdes lokalt och installerades enbart i SmokeLess_QA (Android 17/x86_64). aapt verifierade det separata QA-paketet, debuggable och demo-Firebase. Preview/ordinarie app lämnades kvar. Firebase-emulatorerna använder hostens Node 24; obligatorisk CI verifierade serverintegrationerna med Node 22. Två nya lokala syntetiska konton skapades; lösenord och gammal token lagras enbart privat med Windows DPAPI. Inga riktiga eller delade Firebase-konton användes.

PASS i det avgränsade provet: gästplan med en post; B-inloggning och separat molnpost; utloggning och A-inloggning; avböjd gästkopiering; appens egen raderingsmodal och Avbryt utan Auth-radering; därefter bekräftad radering via Android. A:s Auth-konto och fyra historiksamlingar togs bort, completed-lås kvar. B:s Auth finns och dess fyra samlingar matchar exakt den kanoniska före-snapshoten. A:s gamla token nekas Firestore-skrivning med HTTP 403 och inget nytt dokument skapas.

Native RKStorage tillbakalästes utan att skriva ut värden: A:s aktiva kontocache borttagen, B:s aktiva cache och gästens cache exakt oförändrade, A:s tombstone kvar. En syntetisk PNG med delningsbildens namn rensades medan en orelaterad kontrollfil behölls. Detta är ett cachefilprov, inte en verifierad export. Full launcher-/widget- och tvåenhetsmatris återstår.

FAIL: Auth-utloggningen monterade en ny gästsession som anropade finishDeletionCacheReset i samma process. Omstartsspärren försvann och gästens hemvy visades trots terminerad Firestore-instans. BackHandler.exitApp avslutar bara Activity och garanterar inte heller ny process. Detta är ett verkligt blockerande native-fynd; hela raderingsacceptansen är inte godkänd från ovanstående delresultat.

Korrigering under verifiering: native livscykelmodul håller en processbunden spärr över React-/kontobyten och JavaScript-omladdning. Den markeras före Firestore-terminering. Ny gästsession visar en blockerande omstartsvy utan att tömma resetflaggan. Knappen Stäng appen avslutar task/process endast när en sådan spärr finns. Först en ny process får verifiera och tömma SDK-cacheflaggan före synk. Saknad native-modul avvisas tydligt. Ny Android-build krävs; ingen OTA kan lägga till modulen. Regressionstester täcker samma-process-spärr, ny gästsession, återstart och saknad native-modul; nytt native-prov återstår.
