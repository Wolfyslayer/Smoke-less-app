# Fas 23.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

## Ändringskontrakt

Visa valt dagskort först, följt av två tydliga åtgärder: Registrera och SOS. Ta bort duplicerade plan-/loggkort; destinationerna finns kvar i navigationen och i fördjupningen. Behåll dashboardens sparade val och ordning för övriga kort i en valbar utfällning. Dagskortet visas först när det är valt; dolt val respekteras. Anpassningsreglaget och övriga kort behöver inte fylla första skärmen. En kort stödtext och avstämning är kvar; resestöd, längre coach och återfallsstöd samlas bakom tydlig utfällning. Rökfri underhållsvy ersätter dagskort och ska inte dubblera avstämningen.

Ingen historik, plan, auth eller lagringsmodell ändras. Granska nollmål, ny användare, över mål, ofullständig avstämning och underhållsläge. Fysisk skrollängd, maximal text och TalkBack verifieras i fas 25; kod- och renderstruktur provas nu. Inga native-beroenden.
**Status:** Lokala kontroller passerar. 1/8 huvudpunkter (12,5 %) och 6/32 delpunkter (18,75 %); kodpunkter inväntar CI.

## Genomförd acceptans

Valt dagskort eller underhållskort visas före Registrera och SOS. Min plan/Min logg har tagits bort som duplicerade snabbkort men destinationerna finns kvar. Dashboardens övriga kort och editor finns bakom en 48 dp-utfällning; sparad ordning bevaras där, liksom dolt dagskort. Långa resestöd-/coach-/återfallstexter och statistiklänk finns bakom Stöd och fördjupning. Kort uppmuntran och avstämning finns kvar utan dubblering i underhållsläge. Ofullständig avstämning förblir möjlig att bekräfta. Framtida röksug samma dag utesluts också från coachen. Kontoidentitet återställer öppet fördjupningsläge.

Faktiska React-renderingar med plattformsadapter verifierar ordning, kollapsade detaljer, noll/över mål, dolt dagskort, ofullständig avstämning och underhåll utan dubbel avstämning. TypeScript och 212 tester passerar (196 ordinarie, 10 storage, 6 migration). Ingen ändring av plan, historik, auth, synk eller nya beroenden. Native Android-build behövs inte. Flexibla radbredder, brytande text och dynamisk SVG granskas statiskt; fysisk skrollängd, liten skärm, TalkBack och maximal text ligger kvar i fas 25. Renderstrukturtest ersätter inte dessa enhetsprov.

1. [x] **Inventering och användarmål (4/4)**
   - [x] 1.1 Kartlägg befintliga skärmar och flöden.
   - [x] 1.2 Identifiera information som konkurrerar om uppmärksamhet.
   - [x] 1.3 Definiera tre viktigaste förstagångsuppgifter.
   - [x] 1.4 Fastställ acceptanskriterier och avgränsning.
2. [ ] **Informationshierarki (0/4)**
   - [ ] 2.1 Definiera tydligt huvudfokus.
   - [ ] 2.2 Flytta sekundär information till rätt vy.
   - [ ] 2.3 Ta bort duplicerade navigationsvägar.
   - [ ] 2.4 Behåll åtkomst till fördjupning.
3. [ ] **Primära användarflöden (0/4)**
   - [ ] 3.1 Gör registrering tydlig.
   - [ ] 3.2 Gör SOS lätt att hitta.
   - [ ] 3.3 Gör planval lätt att förstå.
   - [ ] 3.4 Visa nästa relevanta steg.
4. [ ] **Tillstånd och innehåll (0/4)**
   - [ ] 4.1 Hantera helt ny användare.
   - [ ] 4.2 Hantera tom historik och nollmål.
   - [ ] 4.3 Hantera svår dag utan skuldbeläggning.
   - [ ] 4.4 Använd korta begripliga svenska texter.
5. [ ] **Visuell design (0/4)**
   - [ ] 5.1 Använd konsekvent typografi.
   - [ ] 5.2 Behåll tydlig knapphierarki.
   - [ ] 5.3 Begränsa skroll och visuell täthet.
   - [ ] 5.4 Granska olika skärmstorlekar.
6. [ ] **Tillgänglighet och kontroll (0/4)**
   - [ ] 6.1 Granska TalkBack-ordning.
   - [ ] 6.2 Granska stora textstorlekar.
   - [ ] 6.3 Granska tryckytor och kontrast.
   - [ ] 6.4 Gör hjälp och tips frivilliga.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa huvudflöden och tillstånd.
   - [ ] 7.2 Testa databevarande och gästläge.
   - [ ] 7.3 Testa navigering och avbrott.
   - [ ] 7.4 Verifiera CI på aktuell commit.
8. [ ] **Avslut (2/4)**
   - [x] 8.1 Dokumentera genomförd acceptans.
   - [x] 8.2 Flytta bred fysisk enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.
