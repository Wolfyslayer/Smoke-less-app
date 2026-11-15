### Fas 27.0 – fast planerad checklista (8 huvudpunkter × 4 delpunkter = 32)

**Status:** Funktionell temamigrering och kodtester genomförda. 3/8 huvudpunkter (37,5 %), 24/32 delpunkter (75 %) efter grön senaste CI; aktuell push måste verifieras före nästa commit. Åtta fysiska/visuella leveranspunkter är öppna. Se `PHASE_27_QA.md`.

1. [x] **Designgranskning och riktning (4/4)**
   - [x] 1.1 Inventera samtliga skärmar och gemensamma UI-komponenter.
   - [x] 1.2 Identifiera konkreta visuella och användbarhetsmässiga problem.
   - [x] 1.3 Fastställ en sammanhängande premiumdesign med grön identitet som utgångspunkt.
   - [x] 1.4 Dokumentera design-tokens, referensvyer och acceptanskriterier.
2. [ ] **Light/Dark Theme System (3/4)**
   - [x] 2.1 Skapa semantiska färgtokens för ljust och mörkt tema.
   - [x] 2.2 Inför Ljust, Mörkt och System med System som standard.
   - [x] 2.3 Spara och återställ temaval utan att påverka kontodata.
   - [ ] 2.4 Anpassa statusfält, systemnavigation, modaler och diagram till valt tema.
3. [ ] **Startsida och dashboard (3/4)**
   - [x] 3.1 Förbättra progresscirkel och dagens översikt.
   - [x] 3.2 Omstrukturera kort, spacing och informationshierarki.
   - [x] 3.3 Förbättra SOS och snabbregistrering utan extra steg.
   - [ ] 3.4 Verifiera dashboardens båda teman och olika skärmstorlekar.
4. [x] **Navigation och gemensamma komponenter (4/4)**
   - [x] 4.1 Modernisera navigation utan att bryta Android Tillbaka.
   - [x] 4.2 Standardisera knappar, kort, formulär och återkoppling.
   - [x] 4.3 Förbättra dialoger, datumväljare och överlägg.
   - [x] 4.4 Inför konsekvent typografi, ikoner, avstånd och tryckytor.
5. [x] **Övriga skärmar (4/4)**
   - [x] 5.1 Förbättra plan och registrering.
   - [x] 5.2 Förbättra statistik och historik.
   - [x] 5.3 Förbättra profil, inställningar och fördelar.
   - [x] 5.4 Förbättra onboarding och kontoflöden i båda teman.
6. [ ] **Responsivitet och tillgänglighet (0/4)**
   - [ ] 6.1 Kontrollera Safe Area och tangentbordsbeteende.
   - [ ] 6.2 Kontrollera stor text och varierande skärmstorlekar.
   - [ ] 6.3 Kontrollera kontrast och minst 48 dp tryckytor där möjligt.
   - [ ] 6.4 Kontrollera etiketter, roller, läsordning och temaväxling med hjälpmedel.
7. [ ] **Animationer och slutpolering (3/4)**
   - [x] 7.1 Inför diskreta rörelser med respekt för reducerad rörelse.
   - [x] 7.2 Förbättra laddnings-, tom- och fellägen.
   - [x] 7.3 Granska prestanda och undvik onödiga omrenderingar.
   - [ ] 7.4 Kontrollera visuell konsekvens i alla huvudflöden.
8. [ ] **Tester och leverans (3/4)**
   - [x] 8.1 Lägg till tester för temaval, lagring och systemtema.
   - [x] 8.2 Regressionstesta befintliga kärnflöden och dataintegritet.
   - [x] 8.3 Verifiera båda CI-kontrollerna och dokumentera Android-buildbehov.
   - [ ] 8.4 Slutför fasens PR efter verifierade acceptanskriterier.
