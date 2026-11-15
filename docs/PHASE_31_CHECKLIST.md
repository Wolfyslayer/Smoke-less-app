### Fas 31.0 – fast checklista (8 × 4 = 32)

**Status:** Förberedelser och snabba regressioner: 2/8 huvudpunkter (25 %), 19/32 delpunkter (59,375 %). Senaste CI väntar; inget Android E2E-flöde kördes.

1. **Teststrategi och riskprioritering (4/4)**
   - [x] 1.1 Inventera testsviter, manuella fall och CI.
   - [x] 1.2 Välj Android E2E-verktyg efter Expo/native-kompatibilitet och kostnad.
   - [x] 1.3 Definiera deterministiska testdata och testkonton.
   - [x] 1.4 Dokumentera minsta releasekritiska flöden.
2. **Reproducerbar testmiljö (3/4)**
   - [x] 2.1 Isolera Firebase-emulator/testprojekt från produktion.
   - [x] 2.2 Definiera stabila installations-/återställningsrutiner.
   - [x] 2.3 Hantera testidentiteter och hemligheter säkert.
   - [ ] 2.4 Förbered APK/Android-testmiljö utan att bygga per commit.
3. **Onboarding och vardagsflöden (0/4)**
   - [ ] 3.1 Automatisera första start och gästläge.
   - [ ] 3.2 Automatisera plan och registrering.
   - [ ] 3.3 Automatisera historik och statistik.
   - [ ] 3.4 Automatisera SOS och återgång.
4. **Konto och dataintegritet (3/4)**
   - [ ] 4.1 Automatisera kontoinloggning med testidentitet där möjligt.
   - [x] 4.2 Testa gästmigrering och synkkonflikter utan produktionsdata.
   - [x] 4.3 Testa kontobyten och omstart.
   - [x] 4.4 Testa raderingsspärr och säkra återförsök i isolerad miljö.
5. **UI och tillgänglighet (3/4)**
   - [x] 5.1 Testa huvudnavigation och Android Tillbaka.
   - [x] 5.2 Testa ljus/mörk/system och sparat tema.
   - [ ] 5.3 Testa stora texter, fokus och grundläggande semantik.
   - [x] 5.4 Definiera manuella TalkBack- och visuella fall som inte kan automatiseras.
6. **Notiser, widget och OTA (4/4)**
   - [x] 6.1 Testa påminnelsekonfiguration och avstängning.
   - [x] 6.2 Testa widgetens opt-in och integritetsgräns.
   - [x] 6.3 Testa Preview-OTA kontra native-runtime-skydd.
   - [x] 6.4 Dokumentera vilka enhetsfall som kräver manuell kontroll.
7. **CI och rapportering (1/4)**
   - [x] 7.1 Kör snabba enhetstester på varje PR.
   - [ ] 7.2 Kör Android E2E vid releasekandidat eller manuellt val.
   - [ ] 7.3 Publicera anonymiserade testresultat och felrapporter.
   - [ ] 7.4 Säkerställ att röda releasekritiska tester blockerar release.
8. **Verifiering och leverans (1/4)**
   - [ ] 8.1 Verifiera testernas stabilitet och felsökningsbarhet.
   - [x] 8.2 Verifiera dataseparation och hemlighetsskydd.
   - [ ] 8.3 Kontrollera båda obligatoriska CI och Android-buildbehov.
   - [ ] 8.4 Slutför PR med dokumenterad täckning och kvarstående manuella fall.

Evidens: PHASE_31_ANDROID_REGRESSION.md. TypeScript, 344 ordinarie + 10 storage + 6 migration PASS lokalt. 4.x/5.x/6.x verifieras av isolerade befintliga kodtester där markerat; ingen Google-/konto-/tema-/widget-/OTA-acceptans på Android påstås. Windows-köraren avvisade fysisk serial före alla ADB-anrop. Maestro och egen runner är inte verifierade.
