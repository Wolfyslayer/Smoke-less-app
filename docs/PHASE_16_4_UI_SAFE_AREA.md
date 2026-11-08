# Fas 16.4 – Helhetsgranskning av UI, Safe Area och Android-enheter

Mål: Enhetlig och användbar Android-layout på alla inventerade skärmar. Bred fysisk Android-, BrowserStack- och TalkBack-QA samlas i fas 25 enligt masterplanen. Riskkritiska fel åtgärdas direkt.

## Fast checklista (8 × 4 = 32)

**Status:** Startad. 0/8 huvudpunkter, 0/32 verifierade delpunkter (0 %).

1. **Skärmmatris och inventering (0/4)**
   - [ ] 1.1 Inventera alla tabbar och underskärmar.
   - [ ] 1.2 Inventera onboarding och kontoflöden.
   - [ ] 1.3 Inventera modaler, datumväljare, dialoger och formulär.
   - [ ] 1.4 Dokumentera testmatris med risker och ägare per vy.
2. **Safe Area och systemfält (0/4)**
   - [ ] 2.1 Granska rotlayout och SafeAreaProvider.
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
5. **Tillgänglighet och konsekvens (0/4)**
   - [ ] 5.1 Granska tryckytor (mål minst 48 dp).
   - [ ] 5.2 Granska etiketter, roller och läsordning statiskt.
   - [ ] 5.3 Granska kontrast, fel-, laddnings- och tomlägen.
   - [ ] 5.4 Dokumentera TalkBack som uppskjuten fysisk QA i fas 25.
6. **Navigering och delningsvyer (0/4)**
   - [ ] 6.1 Granska kompatibilitet med Android Tillbaka från fas 16.3.
   - [ ] 6.2 Granska modaler och överlägg tillsammans med Safe Area.
   - [ ] 6.3 Granska diagram, statistik och delningsförhandsvisning.
   - [ ] 6.4 Åtgärda verifierade navigations- eller layoutregressioner.
7. **Automatiska kontroller (0/4)**
   - [ ] 7.1 Lägg till riktade testfall för identifierade risker.
   - [ ] 7.2 Kontrollera TypeScript och ordinarie testsvit.
   - [ ] 7.3 Kontrollera Firestore-regel-CI utan onödiga regeländringar.
   - [ ] 7.4 Dokumentera testtäckning och kvarstående begränsningar.
8. **Acceptans och avslut (0/4)**
   - [ ] 8.1 Stäm av alla skärmar mot inventeringsmatrisen.
   - [ ] 8.2 Dokumentera uppskjutna enhetstester i fas 25.
   - [ ] 8.3 Verifiera båda CI på senaste commit och native-buildbehov.
   - [ ] 8.4 Merga enbart efter verifierade acceptanskriterier.

## Arbetsregler

En PR för fasen, sammanhängande commits och grön CI innan nästa commit. Efter varje commit rapporteras 8 huvudpunkter och 32 delpunkter samt Android-build JA/NEJ. Ändra inte Firebase-regler eller hemligheter. Utöka inte omfattningen med orelaterad kosmetik.
