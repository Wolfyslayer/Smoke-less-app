# Fas 16.3 – Android-tillbakaknapp och navigations-UX

Mål: Systemets Tillbaka-knapp/gest ska i första hand stänga översta modalen, därefter navigera till föregående interna vy och endast från startsidan erbjuda en tillgänglig avslutsbekräftelse. Bevara formulärdata och befintliga funktioner.

## Fast checklista (8 huvudpunkter × 4 delpunkter = 32)

**Status:** Pågår. 3/8 huvudpunkter helt färdiga, 21/32 delpunkter markerade färdiga (66 % avrundat). Ytterligare 8 av 9 manuella Android-testfall godkända; TalkBack ej testat. Automatiska regressionstester och slutgranskning återstår.

1. **Inventering (2/4)**
   - [x] 1.1 Kartlägg nuvarande tabbar och navigationshistorik.
   - [ ] 1.2 Kartlägg alla modaler och deras stängningsprioritet.
   - [ ] 1.3 Kartlägg formulär med osparade ändringar.
   - [x] 1.4 Granska Expo Router och Android BackHandler.
2. **Navigationsmodell (4/4, Android-QA återstår)**
   - [x] 2.1 Inför en enda central hanterare för Android Tillbaka.
   - [x] 2.2 Bevara intern navigationshistorik utan dubbletter.
   - [x] 2.3 Navigera ett steg bakåt före avslut.
   - [x] 2.4 Undvik dubbla listeners och stale callbacks.
3. **Modaler (4/4)**
   - [x] 3.1 Stäng översta modal före tabbyte.
   - [x] 3.2 Hantera datumväljare och formulär.
   - [x] 3.3 Hantera SOS-övningar säkert.
   - [x] 3.4 Bevara avbryt- och bekräftelseflöden.
4. **Avslut från startsidan (4/4, Android-QA genomförd)**
   - [x] 4.1 Visa tillgänglig avslutsdialog på startsidan.
   - [x] 4.2 Avbryt ska behålla appen öppen.
   - [x] 4.3 Avsluta endast efter bekräftelse.
   - [x] 4.4 Undvik avslut från annan intern vy.
5. **Datasäkerhet (3/4)**
   - [x] 5.1 Skydda osparade formulärändringar.
   - [x] 5.2 Behåll registreringar och historik.
   - [x] 5.3 Behåll konto- och synkflöden.
   - [ ] 5.4 Bevara lokal Android/Google-konfiguration.
6. **UI och tillgänglighet (2/4)**
   - [x] 6.1 Enhetliga tillbaka- och avbrytknappar.
   - [ ] 6.2 Tryckytor och skärmläsaretiketter.
   - [x] 6.3 Safe area och små skärmar.
   - [ ] 6.4 Stor text verifierad på Android. TalkBack flyttas till samlad tillgänglighets-QA i senare fas och är inte godkänt ännu.
7. **Automatiska tester (0/4)**
   - [ ] 7.1 Testa navigationshistorik.
   - [ ] 7.2 Testa modalprioritet.
   - [ ] 7.3 Testa avslutsbekräftelse.
   - [ ] 7.4 Testa regressionsskydd och CI.
8. **Android-acceptans och avslut (2/4)**
   - [x] 8.1 Testa hårdvaru-/systemknapp och gest på telefon.
   - [x] 8.2 Testa bakgrund/återupptagning och osparade ändringar.
   - [ ] 8.3 Kontrollera båda CI och behov av native-build.
   - [ ] 8.4 Merga fas-PR efter verifiering.

## Arbetsregler

En PR för hela fasen, flera små commits. Efter varje commit kontrolleras båda CI-arbetsflödena innan nästa steg. Uppdatera checklistans verkliga status och procent. Inga otestade punkter markeras som färdiga. Inga ändringar i signeringsnycklar eller `google-services.json` committas. Fysisk Android-testning krävs innan merge.

## Verifiering hittills

- Båda GitHub CI-arbetsflödena är gröna till och med `7c0e0ca` (Validate Smoke Less 6 och Firestore rules emulator).
- Systemets tillbaka-händelse fångas av en central listener; inbyggda React Native-modaler hanterar `onRequestClose` separat.
- Registreringsmodalens bekräftelse och återställning är verifierade på fysisk Android-enhet med tillbaka-gest och kryss.
- SOS städar upp timer och andningsövning vid navigering bort från vyn; efter sparad SOS-registrering rensas navigeringshistoriken.
- Onboardingens e-postflöde varnar vid osparad e-post eller lösenord. Den synliga tillbaka-knappen och Android Tillbaka använder samma skydd.
- Navigeringshistoriken rensas när en slutförd SOS-registrering återgår till startsidan, och tom historik ger inte en ny historikpost.
- Android-telefon: navigering Statistik → Historik → tillbaka, avslutsdialog, registrering, SOS-återställning, konto- och onboarding-inloggning verifierade. Onboardingens inloggning använder appens egen bekräftelse och rensar uppgifter vid bekräftat avbrott.
- Ny Android-testrapport: datumväljare, planändringar, övriga modaler, bakgrund/återupptagning, historik/registreringar, kontosynkronisering, stor text och skärmstorlek fungerar (8/9 godkända). TalkBack ej testat.
- TalkBack skjuts enligt beslut upp till samlad tillgänglighets-QA i senare fas; markeras inte som testat eller godkänt och blockerar inte ensam fas 16.3.
- Återstår i fas 16.3: verifiering av lokal Android/Google-konfiguration, automatiska regressionstester, native-buildbedömning och slutgranskning före merge.
