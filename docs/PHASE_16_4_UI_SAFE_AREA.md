# Fas 16.4 – Helhetsgranskning av UI, Safe Area och Android-enheter

Mål: Enhetlig och användbar Android-layout på alla inventerade skärmar. Bred fysisk Android-, BrowserStack- och TalkBack-QA samlas i fas 25 enligt masterplanen. Riskkritiska fel åtgärdas direkt.

## Fast checklista (8 × 4 = 32)

**Status:** Mergad i PR #161, commit `07ff48c315f7d535da56f3053594f503cfd0bc00`. 8/8 huvudpunkter och 32/32 delpunkter (100 %) verifierade på kod-, automatisk test- och dokumentationsnivå. Fysisk Android-QA är inte genomförd och kvarstår i fas 25.

1. **Skärmmatris och inventering (4/4)**
   - [x] 1.1 Inventera alla tabbar och underskärmar.
   - [x] 1.2 Inventera onboarding och kontoflöden.
   - [x] 1.3 Inventera modaler, datumväljare, dialoger och formulär.
   - [x] 1.4 Dokumentera testmatris med risker och ägare per vy.
2. **Safe Area och systemfält (4/4)**
   - [x] 2.1 Granska rotlayout och SafeAreaProvider.
   - [x] 2.2 Granska statusfält, skärmkanter och kamerahål.
   - [x] 2.3 Granska bottennavigering och gestfält/treknappsnavigering.
   - [x] 2.4 Åtgärda verifierade överlapp och dubbel padding.
3. **Tangentbord och formulär (4/4)**
   - [x] 3.1 Granska tangentbordsbeteende i onboarding och konto.
   - [x] 3.2 Granska formulärscroll, fokus och primärknappar.
   - [x] 3.3 Granska datumväljare och modalernas tangentbordsbeteende.
   - [x] 3.4 Åtgärda verifierade klippnings- och fokusproblem.
4. **Responsiv layout (4/4)**
   - [x] 4.1 Granska små och smala Android-skärmar.
   - [x] 4.2 Granska större skärmar och bildförhållanden.
   - [x] 4.3 Granska maximal textstorlek och visningsskalning.
   - [x] 4.4 Åtgärda verifierad horisontell scroll eller avklippt innehåll.
5. **Tillgänglighet och konsekvens (4/4)**
   - [x] 5.1 Granska tryckytor (mål minst 48 dp).
   - [x] 5.2 Granska etiketter, roller och läsordning statiskt.
   - [x] 5.3 Granska kontrast, fel-, laddnings- och tomlägen.
   - [x] 5.4 Dokumentera TalkBack som uppskjuten fysisk QA i fas 25.
6. **Navigering och delningsvyer (4/4)**
   - [x] 6.1 Granska kompatibilitet med Android Tillbaka från fas 16.3.
   - [x] 6.2 Granska modaler och överlägg tillsammans med Safe Area.
   - [x] 6.3 Granska diagram, statistik och delningsförhandsvisning.
   - [x] 6.4 Åtgärda verifierade navigations- eller layoutregressioner.
7. **Automatiska kontroller (4/4)**
   - [x] 7.1 Lägg till riktade testfall för identifierade risker.
   - [x] 7.2 Kontrollera TypeScript och ordinarie testsvit.
   - [x] 7.3 Kontrollera Firestore-regel-CI utan onödiga regeländringar.
   - [x] 7.4 Dokumentera testtäckning och kvarstående begränsningar.
8. **Acceptans och avslut (4/4)**
   - [x] 8.1 Stäm av alla skärmar mot inventeringsmatrisen.
   - [x] 8.2 Dokumentera uppskjutna enhetstester i fas 25.
   - [x] 8.3 Verifiera båda CI på senaste commit och native-buildbehov.
   - [x] 8.4 Merga enbart efter verifierade acceptanskriterier.

## Arbetsregler

En PR för fasen, sammanhängande commits och grön CI innan nästa commit. Efter varje commit rapporteras 8 huvudpunkter och 32 delpunkter samt Android-build JA/NEJ. Ändra inte Firebase-regler eller hemligheter. Utöka inte omfattningen med orelaterad kosmetik.

## Verifieringsnoteringar

- **Slutacceptans 5.1, 8.3–8.4:** `d19dd36` hade gröna `validate` och `rules`; TypeScript och 159 lokala tester passerade. PR #161 mergades efter denna kontroll, med exakt kontrollerad head-SHA. Debug-keystore-plugin och app.json bevarades identiska med main. Ingen ny native-konfiguration jämfört med main infördes. Äldre väntande CI-noteringar nedan är historiska milstolpar.

- **2.4, 4.1–4.4, 5.2–5.3, 6.2, 6.4, 8.1 (statisk avstämning och CI):** Skärmmatrisens sammanfattning omfattar samtliga inventerade appvyer, systeminsets, flex/wrap, textskalning, roller, kontrastpar, statuslägen och modalernas tillbaka-flöde. Identifierade fel har korrigerats och TypeScript/tester samt båda CI är gröna på `da974ab`. Statisk granskning är avslutad för dessa punkter; renderad geometri, visningsskalning, fokus/TalkBack, systemdelning och riktiga systemfält är fortsatt fysisk QA i fas 25. Ingen ny blockerande data-/auth-risk har identifierats. Punkt 5.1 inväntar de sista 48 dp-korrigeringarna i onboarding/tekniska detaljer och deras CI.

- **3.1–3.4 (kod och automatiska kontrakt):** Tangentbordsgranskningen i skärmmatrisen och korrigeringarna är verifierade med TypeScript/tester och båda CI gröna på `92073b6`. Fält saknar fördröjd auto-focus; sessionsscroll accepterar knappar vid öppet tangentbord och auth-modal använder Android `height`. Fysisk fokus-/tangentbordsgeometri testas i fas 25.
- **6.1, 6.3 (statisk granskning):** Navigationen prioriterar auth, dialog och registreringsmodal före skärmbyte/avslut. Native Modal använder onRequestClose; SOS stoppas i `useSmokeLessSessionModel` vid navigation/back och timer/animation städar i sina hooks. Statistik har datum-/antalsbeskrivningar och tomlägen. Profilens delningsförhandsvisning använder SVG med skalbar aspektkvot och skydd mot ändrade värden under export. Fysisk delning, TalkBack och den separata visuella omarbetningen av delningskortet ingår i senare faser.
- **8.2 (dokumentation):** Skärmmatrisens risker, ägare och återstående enhetskontroller är uttryckligen överlämnade till fas 25. De är inte godkända tester.

- **2.2–2.3 (statisk granskning):** Systemfältsgranskningen och sessionskanterna i skärmmatrisen är avstämda mot `bf234a7`, med gröna `validate` och `rules`. Bottennavigationen är ett syskon till scrollen och äger huvudinnehållets botteninset. Login och onboardinglänk skyddas separat. Fysisk verifiering av kamerahål och båda navigeringslägena kvarstår i fas 25; dessa kryss avser granskning av koden, inte enhetsgodkännande.

- **1.1–1.3 (källkod):** `docs/PHASE_16_4_SCREEN_MATRIX.md` inventerar huvudtabbar, underskärmar, onboarding, konto, modaler, datumväljare och formulär. Inventeringen är inte ett genomfört skärmtest.
- **2.1 (källkod):** `app/_layout.tsx` omsluter appen med `SafeAreaProvider`; `AppSessionView.tsx` läser `useSafeAreaInsets()`. Korrekt beteende på olika enheter omfattas fortfarande av 2.2–2.4.
- **5.4 (dokumentation):** Bred fysisk TalkBack-verifiering är uttryckligen uppskjuten till fas 25. Statisk etikett-/rollgranskning enligt 5.2 återstår.
- **Tidigare kalenderproblem åtgärdat i `92073b6`:** Smal kalender och stor text växlar till fullbreddsrader i stället för datumceller under 48 dp. CI är grön. Fysisk geometri ska fortsatt verifieras i fas 25.
- **7.1–7.3 (automatiska tester):** Tre riktade källkodsbaserade regressionstester lades till i `tests/sessionNavigation.test.cjs` för modalernas Safe Area/scroll, kalendertryckytor och bottennavigering/gemensamma knappar. `Validate Smoke Less 6` kör enligt `.github/workflows/ci.yml` både `npm run typecheck`, `npm run test`, `npm run test:storage` och `npm run test:migration`. Både denna workflow och `Firestore rules emulator` rapporterade `success` på commit `0e3fd27`. Inga Firestore-regler ändrades i fasen. Detta bekräftar inte visuellt beteende på Android.
- **CI-gate:** Varje efterföljande commit måste få egna gröna kontroller innan nästa ändring.

- **1.4 (dokumentation):** `docs/PHASE_16_4_SCREEN_MATRIX.md` anger riskklass, berörda vyer, återstående kontroll och ansvarig för källkod respektive fysisk acceptans. Alla identifierade huvudvyer är grupperade; fysisk testning är inte markerad som genomförd.
- **7.4 (dokumentation):** Samma matris beskriver explicit vad CI:s källkodstester täcker och inte täcker (renderad geometri, tangentbord, TalkBack, smala skärmar). Båda CI-kontrollerna var gröna för dokumentationscommit `f16e820`.
