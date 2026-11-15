### Fas 28.0 – fast planerad checklista (8 huvudpunkter × 4 delpunkter = 32)

**Status:** Kod och automatiska tester verifierade lokalt. 6/8 huvudpunkter (75 %), 29/32 delpunkter (90,625 %) efter grön senaste CI. 7.3, 7.4 och 8.4 är öppna; fysisk Android-/slutacceptans är inte verifierad. Se `PHASE_28_PROFILE_SETTINGS.md`.

1. [x] **Inventering och informationsarkitektur (4/4)**
   - [x] 1.1 Inventera Profil, Inställningar, kontovyer och navigationsvägar.
   - [x] 1.2 Kartlägg varje befintlig inställning, genväg och åtgärd till rätt kategori.
   - [x] 1.3 Identifiera dubbleringar, otydliga etiketter och överflödig scroll.
   - [x] 1.4 Dokumentera målnavigation och acceptanskriterier.
2. [x] **Profilöversikt (4/4)**
   - [x] 2.1 Skapa tydlig profilöversikt med kontostatus.
   - [x] 2.2 Gruppera huvudkategorier med begriplig ordning.
   - [x] 2.3 Bevara viktiga genvägar utan att överbelasta profilen.
   - [x] 2.4 Verifiera gästläge och inloggat läge.
3. [x] **Mitt konto (4/4)**
   - [x] 3.1 Samla inloggning och kontoinformation.
   - [x] 3.2 Samla säkerhets- och kontohanteringsåtgärder.
   - [x] 3.3 Säkerställ korrekt återgång och tydliga bekräftelser.
   - [x] 3.4 Regressionstesta kontoflöden utan att ändra autentiseringslogik.
4. [x] **Appinställningar (4/4)**
   - [x] 4.1 Samla tema, påminnelser och Android-widget.
   - [x] 4.2 Flytta planrelaterade inställningar till relevant planvy.
   - [x] 4.3 Strukturera övriga appövergripande inställningar utan dubblering.
   - [x] 4.4 Verifiera att inställningarna sparas och återställs korrekt.
5. [x] **Data, synk och integritet (4/4)**
   - [x] 5.1 Samla molnstatus och synkinformation.
   - [x] 5.2 Placera gästdata och datahantering med rätt förklaringar.
   - [x] 5.3 Säkerställ tydlig väg till integritet och kontoradering där det finns stöd.
   - [x] 5.4 Regressionstesta dataflöden och skydd mot oavsiktlig radering.
6. [x] **Min resa, hjälp och delning (4/4)**
   - [x] 6.1 Ordna plan, historik och framsteg efter användarens uppgift.
   - [x] 6.2 Säkerställ lätt åtkomst till SOS och stöd.
   - [x] 6.3 Placera delningsfunktioner i relevant sammanhang.
   - [x] 6.4 Samla appinformation, version och hjälp på ett logiskt ställe.
7. [ ] **Visuell konsekvens och tillgänglighet (2/4)**
   - [x] 7.1 Återanvänd fas 27:s designkomponenter och temastöd.
   - [x] 7.2 Kontrollera läsordning, rubriker, roller och tryckytor.
   - [ ] 7.3 Kontrollera Safe Area, stor text och små skärmar.
   - [ ] 7.4 Kontrollera Android Tillbaka och navigering mellan kategorier.
8. [ ] **Tester och leverans (3/4)**
   - [x] 8.1 Lägg till tester för navigation och kategoriindelning.
   - [x] 8.2 Verifiera konto-, synk-, inställnings- och gästregressioner.
   - [x] 8.3 Kontrollera båda CI-kontrollerna och Android-buildbehov.
   - [ ] 8.4 Merga fasens enda PR först efter verifierad acceptans.
