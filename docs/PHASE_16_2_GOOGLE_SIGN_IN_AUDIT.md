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
