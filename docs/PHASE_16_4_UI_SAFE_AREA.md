# Fas 16.4 – Helhetsgranskning av UI, Safe Area och Android-enheter

Mål: Enhetlig och användbar Android-layout på alla inventerade skärmar. Bred fysisk Android-, BrowserStack- och TalkBack-QA samlas i fas 25 enligt masterplanen. Riskkritiska fel åtgärdas direkt.

## Fast checklista (8 × 4 = 32)

**Status:** Pågående. 2/8 huvudpunkter, 10/32 verifierade delpunkter (31,25 %). Verifiering avser källkodsgranskning och dokumentation där det uttryckligen anges; fysisk Android-QA är inte genomförd.

1. **Skärmmatris och inventering (4/4)**
   - [x] 1.1 Inventera alla tabbar och underskärmar.
   - [x] 1.2 Inventera onboarding och kontoflöden.
   - [x] 1.3 Inventera modaler, datumväljare, dialoger och formulär.
   - [x] 1.4 Dokumentera testmatris med risker och ägare per vy.
2. **Safe Area och systemfält (1/4)**
   - [x] 2.1 Granska rotlayout och SafeAreaProvider.
   - [ ] 2.2 Granska statusfält, skärmkanter och kamerahål.
   - [ ] 2.3 Granska bottennavigering och gestfält/treknappsnavigering.
   - [ ] 2.4 Åtgärda verifierade överlapp och dubbel padding.
3. **Tangentbord och formulär (0/4)**
   - [ ] 3.1 Granska tangentbordsbeteende i onboarding och konto.
   - [ ] 3.2 Granska formulärscroll, fokus och primärknappar.
   - [ ] 3.3 Granska datumväljare och modalernas tangentbordsbeteende.
   - [ ] 3.4 Åtgärda verifierade klippnings- och fokusproblem.
4. **Responsiv layout (0/4)**
   - [ ] 4.1 Granska små och smala Android-skärmar.
   - [ ] 4.2 Granska större skärmar och bildförhållanden.
   - [ ] 4.3 Granska maximal textstorlek och visningsskalning.
   - [ ] 4.4 Åtgärda verifierad horisontell scroll eller avklippt innehåll.
5. **Tillgänglighet och konsekvens (1/4)**
   - [ ] 5.1 Granska tryckytor (mål minst 48 dp).
   - [ ] 5.2 Granska etiketter, roller och läsordning statiskt.
   - [ ] 5.3 Granska kontrast, fel-, laddnings- och tomlägen.
   - [x] 5.4 Dokumentera TalkBack som uppskjuten fysisk QA i fas 25.
6. **Navigering och delningsvyer (0/4)**
   - [ ] 6.1 Granska kompatibilitet med Android Tillbaka från fas 16.3.
   - [ ] 6.2 Granska modaler och överlägg tillsammans med Safe Area.
   - [ ] 6.3 Granska diagram, statistik och delningsförhandsvisning.
   - [ ] 6.4 Åtgärda verifierade navigations- eller layoutregressioner.
7. **Automatiska kontroller (4/4)**
   - [x] 7.1 Lägg till riktade testfall för identifierade risker.
   - [x] 7.2 Kontrollera TypeScript och ordinarie testsvit.
   - [x] 7.3 Kontrollera Firestore-regel-CI utan onödiga regeländringar.
   - [x] 7.4 Dokumentera testtäckning och kvarstående begränsningar.
8. **Acceptans och avslut (0/4)**
   - [ ] 8.1 Stäm av alla skärmar mot inventeringsmatrisen.
   - [ ] 8.2 Dokumentera uppskjutna enhetstester i fas 25.
   - [ ] 8.3 Verifiera båda CI på senaste commit och native-buildbehov.
   - [ ] 8.4 Merga enbart efter verifierade acceptanskriterier.

## Arbetsregler

En PR för fasen, sammanhängande commits och grön CI innan nästa commit. Efter varje commit rapporteras 8 huvudpunkter och 32 delpunkter samt Android-build JA/NEJ. Ändra inte Firebase-regler eller hemligheter. Utöka inte omfattningen med orelaterad kosmetik.

## Verifieringsnoteringar

- **1.1–1.3 (källkod):** `docs/PHASE_16_4_SCREEN_MATRIX.md` inventerar huvudtabbar, underskärmar, onboarding, konto, modaler, datumväljare och formulär. Inventeringen är inte ett genomfört skärmtest.
- **2.1 (källkod):** `app/_layout.tsx` omsluter appen med `SafeAreaProvider`; `AppSessionView.tsx` läser `useSafeAreaInsets()`. Korrekt beteende på olika enheter omfattas fortfarande av 2.2–2.4.
- **5.4 (dokumentation):** Bred fysisk TalkBack-verifiering är uttryckligen uppskjuten till fas 25. Statisk etikett-/rollgranskning enligt 5.2 återstår.
- **Öppet problem:** Kalenderdagarnas bredd kan bli mindre än 48 dp på smala skärmar. Punkt 5.1 och responsivitetskontrollerna förblir öppna tills detta har åtgärdats och verifierats.
- **7.1–7.3 (automatiska tester):** Tre riktade källkodsbaserade regressionstester lades till i `tests/sessionNavigation.test.cjs` för modalernas Safe Area/scroll, kalendertryckytor och bottennavigering/gemensamma knappar. `Validate Smoke Less 6` kör enligt `.github/workflows/ci.yml` både `npm run typecheck`, `npm run test`, `npm run test:storage` och `npm run test:migration`. Både denna workflow och `Firestore rules emulator` rapporterade `success` på commit `0e3fd27`. Inga Firestore-regler ändrades i fasen. Detta bekräftar inte visuellt beteende på Android.
- **CI-gate:** Varje efterföljande commit måste få egna gröna kontroller innan nästa ändring.

- **1.4 (dokumentation):** `docs/PHASE_16_4_SCREEN_MATRIX.md` anger riskklass, berörda vyer, återstående kontroll och ansvarig för källkod respektive fysisk acceptans. Alla identifierade huvudvyer är grupperade; fysisk testning är inte markerad som genomförd.
- **7.4 (dokumentation):** Samma matris beskriver explicit vad CI:s källkodstester täcker och inte täcker (renderad geometri, tangentbord, TalkBack, smala skärmar). Båda CI-kontrollerna var gröna för dokumentationscommit `f16e820`.
