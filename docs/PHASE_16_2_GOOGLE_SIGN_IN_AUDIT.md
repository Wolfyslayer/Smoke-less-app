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
