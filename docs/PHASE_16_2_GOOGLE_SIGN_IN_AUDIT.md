# Fas 16.2 – Google-inloggning: inventering och säkerhetsgränser

Status: **påbörjad, inventering pågår**. Fast 8×4-checklista finns i `docs/MASTER_ROADMAP.md`. Ingen Google-inloggning är aktiverad eller testad i denna commit.

## Verifierat i repository vid fasstart
- `app.json` anger Android package `com.smokeless.app`, Expo SDK 58 och native `@react-native-firebase/app` samt `@react-native-firebase/auth` som config plugins.
- `package.json` har `@react-native-firebase/auth` men inget separat Google Sign-In-paket. Val av kompatibelt native bibliotek kräver särskild kontroll innan installation.
- `src/components/AccountSettingsRoutes.tsx` kopplar konto-UI till befintlig sessionsmodell; e-post/lösenord och gästläge ska förbli fungerande.
- Firebase-projektets faktiska provider-inställning, OAuth-klienter, SHA-1/SHA-256 och signeringscertifikat **kan inte verifieras från app.json**. Detta måste kontrolleras i Firebase/Google-konfigurationen innan Google-inloggning kan fungera.

## Obligatoriska skydd före implementation
1. Befintlig inloggad e-postanvändare får inte bytas till ett annat Firebase UID automatiskt. Länkning kräver verifiering av befintligt konto och uttryckligt samtycke.
2. Vid `account-exists-with-different-credential` ska flödet stoppa, förklara läget och kräva säker inloggning/länkning. Ingen automatisk ny identitet, historiköverföring eller molnöverskrivning.
3. Avbruten Google-dialog, saknade Play-tjänster, offline och felkonfiguration ska lämna befintlig session och lokal data oförändrade.
4. Bevara existerande e-postinloggning, gästläge, kontoradering och synkgränser. Inga klienthemligheter eller tjänstkonton i Git.
5. Native-build körs **endast manuellt** vid behov; ingen ny automatisk Android-build per commit. Fysisk Android-acceptans samlas i fas 25 enligt roadmapen.

## Nästa inventeringssteg
- Spåra exakt hur Firebase Auth hanteras i sessionsmodellen och hur kontobyten påverkar lokal lagring och Firestore.
- Fastställ kompatibel Google Sign-In-integration för aktuell Expo/RN-version och dokumentera konfiguration av Firebase provider, Android OAuth och SHA-certifikat.
- Implementera först efter att dataförlust- och dubbelkonto-risker har täckts av tester.

**Checklista vid fasstart: 0/32 verifierade.** Detta dokument är en påbörjad inventering, inte ett påstående om färdig delpunkt.


## Spårad sessions- och synkarkitektur (inventeringscommit 2)
- `src/hooks/useSmokeLessSessionModel.ts` sammanför `useAccountFlow`, `useLocalSession` och `useCloudSync`; en Google-åtgärd ska därför kopplas in via den befintliga kontomodellen, inte genom en parallell auth-state eller separat lagringsväg.
- `src/hooks/useAccountFlow.ts` hanterar e-postinloggning, registrering, återställning, utloggning, gästhistoriköverföring och manuell molnimport. Vid e-postinloggning sätts `setLoginOrigin(origin)` och återställs vid fel. Ett nytt Google-flöde måste bevara samma ursprungskontrakt och återställa det vid avbrott.
- `src/hooks/useLocalSession.ts` använder lagringsnyckeln `account:<uid>` respektive `guest`; vid identitetsbyte blockeras sparning/synk tills korrekt session laddats och widgetens integritetsdata rensats. Google-länkning får inte byta UID eller kringgå denna spärr.
- `src/hooks/useCloudSync.ts` kontrollerar `verifyCurrentUid()` före/efter asynkrona anrop och tar lokal backup före sammanslagning. Denna UID-gräns måste bibehållas för Google-inloggning och kontobyte.
- `src/screens/AccountScreen.tsx` visar i dag endast e-post/lösenord och gästalternativ. Google-knappen behöver vara tydligt frivillig, inaktiverad medan auth pågår och kopplad till kontomodellens felhantering.
- `src/authService.ts` är en icke-native fallback som avsiktligt kastar för kontoåtgärder. Den verkliga Android-implementationen måste identifieras och ändras utan att web-/Expo Go-fallback bryts.

## Säker implementationsordning
1. Identifiera Android-auth-implementation och onboardingens login-origin innan ändringar i autentiseringsflödet.
2. Inför testbar Google-credential-hantering och felklassificering: avbrott och konfigurationsfel lämnar aktiv UID orörd.
3. För befintlig e-postanvändare: använd uttrycklig länkning mot samma Firebase UID med säker återautentisering; aldrig tyst `signInWithCredential` som byter identitet.
4. För gästläge: bevara gästdata lokalt tills användaren uttryckligen godkänner befintligt migreringsflöde.
5. Kräv gröna tester för kontobyte, avbruten dialog, credential-konflikt och synkisolering före merge.

**Inventeringsresultat:** Kopplingspunkterna ovan är verifierade i källkod. Google-provider, SHA-certifikat och faktisk native-körning är fortfarande overifierade. Detta är inte en färdig Google-inloggning.


## Native Firebase Auth och onboarding-origin – verifierat i källkod
- Android använder `src/authService.native.ts` (plattformsspecifik React Native-resolver). Där finns `getAuth`, `onAuthStateChanged`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, lösenordsåterställning och verifieringsmejl. `src/authService.ts` är avsiktligt fallback för miljöer utan native auth.
- `observeUser` publicerar `uid`, `email` och `emailVerified` till sessionsmodellen; ingen provider-specifik identitet får ersätta Firebase UID som datanyckel.
- `src/loginOrigin.ts` håller `profile | onboarding` tillfälligt mellan inloggning och sessionsbyte, med `setLoginOrigin`/`consumeLoginOrigin`. Google-flödet ska återanvända detta och rensa pending origin vid avbrott/fel.
- `src/hooks/useAccountFlow.ts` äger `accountBusy` och befintliga kontofelmeddelanden. Lägg inte en parallell Google-knapp som kringgår busy-låset, kontosessionen eller UID-gränserna.

### Konfigurationsgrind före native Google-inloggning
- Firebase Console: kontrollera att Google är aktiverad under Authentication > Sign-in method.
- Kontrollera Android-appen `com.smokeless.app` i Firebase-projektet och registrera SHA-1/SHA-256 för de signeringsnycklar som faktiskt används (debug och senare release).
- Verifiera aktuell `google-services.json` och tillhörande OAuth-klienter lokalt; exponera inga privata nycklar i Git eller PR-loggar. Filen ska inte kopieras in i dokumentationen.
- Välj en Google Sign-In-lösning som är kompatibel med Expo SDK 58 / React Native 0.88.1 och dess config-plugin/prebuild. Google OAuth-klientens web client ID kan behövas för Firebase ID-token; härled den från korrekt projektkonfiguration, inte ett påhittat värde.
- Planera ny fristående Android-build när native beroenden eller config plugins ändras. Inga manuella Android-testresultat finns ännu.

**Beslut:** Nästa kodcommit ska först ge en isolerad, testbar credential-/felhanteringsgräns och säker koppling till befintlig kontomodell. Slå inte på Google-inloggning i UI förrän konfigurations- och säkerhetskraven kan uppfyllas.


## Praktisk Firebase- och Android-konfiguration (utan hemligheter)
**Denna guide är instruktioner, inte en bekräftelse på att Firebase Console är konfigurerad.** Inga SHA-fingeravtryck eller OAuth-ID har verifierats i denna PR.

1. Öppna Firebase Console för rätt projekt → Authentication → Sign-in method → Google → Enable. Kontrollera support-e-post och spara. Google-provider kan endast aktiveras av projektets behöriga administratör.
2. Öppna Project settings → Your apps → Android-appen med package name `com.smokeless.app`. Kontrollera att paketnamnet är exakt lika med `expo.android.package` i `app.json`.
3. Registrera **SHA-1 och SHA-256** för varje relevant signeringscertifikat. För lokal debug-build kan du använda `cd android && ./gradlew signingReport` (Windows PowerShell: `cd android; .\gradlew.bat signingReport`). Om `android/` genereras med Expo prebuild, gör detta efter en kontrollerad prebuild. För GitHub Actions/EAS/Google Play måste fingeravtrycken komma från respektive **faktiska** signeringsnyckel; debug-fingeravtrycket täcker inte release.
4. Ladda ned den uppdaterade `google-services.json` för **samma Firebase-projekt och Android-app** efter ändringarna. Kontrollera att den konfigurerade lokala filen motsvarar rätt app; lägg inte filinnehåll, tokens eller privata nycklar i PR-text eller testloggar.
5. Kontrollera OAuth-klienterna i Google Cloud/Firebase och att eventuell web client ID som används för ID-token till Firebase verkligen hör till samma projekt. Android-klienten ska vara kopplad till korrekt package ID och SHA-1. **Gissa aldrig klient-ID eller SHA-värden.**
6. Innan native Google Sign-In aktiveras: välj och versionslås kompatibelt bibliotek för Expo SDK 58/RN 0.88.1, verifiera dess config plugin/prebuild, och kontrollera att Firebase tar emot en verifierad Google ID-token genom `GoogleAuthProvider.credential`/Firebase Auth. Undvik egna tokens i appens lagring.
7. Efter ändringar i native bibliotek/config: bygg en ny fristående Android-app. Testa först på riktig enhet med Play-tjänster och rätt SHA-konfiguration; verifiera även avbrott, offline, kontokonflikt och att UID/historik förblir korrekt. Dokumentera manuella resultat först när de faktiskt utförts.

**Säkerhetsgrind:** Inloggningsknappen ska inte aktiveras i produktion innan steg 1–6 är verifierade och riskerna kring befintliga e-postkonton och gästdata är testade. För blockerande kontosäkerhet krävs riktade tester under fas 16.2, även om bred manuell Android-regression görs i fas 25.
