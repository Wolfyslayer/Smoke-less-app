### Fas 30.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

**Status:** Kodmilstolpe: 2/8 huvudpunkter (25 %), 19/32 delpunkter (59,375 %). Lokal verifiering PASS, senaste CI väntar. Fysisk acceptans och offentlig release är öppna.

1. **Release-inventering och kriterier (4/4)**
   - [x] 1.1 Inventera samtliga användarsynliga skärmar, dialoger, knappar och texter.
   - [x] 1.2 Inventera Preview-/development-specifika funktioner och buildflaggor.
   - [x] 1.3 Identifiera blockerande releaseproblem och fastställ acceptanskriterier.
   - [x] 1.4 Dokumentera vad som ska behållas, döljas, tas bort eller skrivas om.
2. **Texter och språkpolering (3/4)**
   - [x] 2.1 Ersätt debug-, placeholder- och utvecklingstexter med begripliga produkttexter.
   - [x] 2.2 Gör rubriker, hjälptexter och knappetiketter konsekventa och tydliga.
   - [ ] 2.3 Granska svenska formuleringar, stavning och icke-skuldbeläggande ton.
   - [x] 2.4 Granska fel-, tom-, laddnings- och offline-meddelanden.
3. **Knappar, flöden och release-UI (2/4)**
   - [x] 3.1 Ta bort eller villkorsstyr överflödiga test-/debug-knappar i Production.
   - [ ] 3.2 Säkerställ att alla synliga knappar har korrekt, fungerande handling.
   - [x] 3.3 Förbättra bekräftelser, avbrytande och återgång utan datarisk.
   - [ ] 3.4 Kontrollera konsekvent design, teman och tillgängliga tryckytor.
4. **Notiser och påminnelser (3/4)**
   - [x] 4.1 Inventera alla notiser, kanaler, triggers och behörighetsflöden.
   - [x] 4.2 Förbättra notistexter, ton, integritet och användarstyrning.
   - [x] 4.3 Förebygg dubletter och testa schemaläggning, avstängning och tidzoner.
   - [ ] 4.4 Kontrollera notisinteraktion, bakgrund, omstart och relevanta Android-versioner.
5. **Preview/Production-separation (2/4)**
   - [x] 5.1 Verifiera buildprofil, app-ID och OTA-kanal för Production.
   - [x] 5.2 Avgränsa utvecklingsverktyg, tekniska statusfält och testkonfiguration.
   - [ ] 5.3 Kontrollera produktions-Firebase, Google-inloggning och secrets.
   - [ ] 5.4 Kontrollera att inga Preview-data eller interna länkar läcker till Production.
6. **Visuell och funktionell slutpolering (1/4)**
   - [x] 6.1 Granska appnamn, ikon, splash, versionsvisning och branding.
   - [ ] 6.2 Granska navigation, Safe Area, tangentbord och stora textstorlekar.
   - [ ] 6.3 Granska onboarding, konto, synk, SOS, historik, widgets och offline-läge.
   - [ ] 6.4 Granska prestanda, felåterhämtning och begriplig statuskommunikation.
7. **Releasekontroller och dokumentation (4/4)**
   - [x] 7.1 Lägg till tester som upptäcker debug-/Preview-UI i Production.
   - [x] 7.2 Lägg till relevanta notis-, text- och navigationsregressionstester.
   - [x] 7.3 Dokumentera versionering, signering, OTA/native-gräns och rollback.
   - [x] 7.4 Förbered APK-releasechecklista, webbdistribution och installationsunderlag utan publicering.
8. **Verifiering och överlämning (0/4)**
   - [ ] 8.1 Kör TypeScript, relevanta tester och båda obligatoriska CI-kontrollerna.
   - [ ] 8.2 Verifiera fristående Preview och release-liknande Android-build på enhet.
   - [ ] 8.3 Kontrollera kontosäkerhet, databevarande, notiser och tillgänglighet.
   - [ ] 8.4 Slutför fasens PR och dokumentera kvarvarande releasehinder; invänta uttryckligt publiceringsbeslut.

Evidens och kvarstående grindar: PHASE_30_RELEASE_POLISH.md. TypeScript, 342 tester och webbexport PASS. Full språk-/knapp-/enhetsacceptans räknas inte från kodtester.
