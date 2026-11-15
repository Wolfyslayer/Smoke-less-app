# Fas 24.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

## Ändringskontrakt

Behåll fyra steg, alla tre planvägar, gästläge och befintlig frivillig kontoanslutning. Ersätt automatiskt växlande välkomsttext med stabil kort introduktion. Basnivå anges uttryckligen; paketstorlek 20 och pris 0 är öppet redovisade standardvärden i frivillig ekonomidel. Lugn standardtakt med valbar annan takt. Validera fält innan nästa steg; behåll inmatning vid Tillbaka. Ingen befintlig historik får raderas när profil skapas. Kontoval och synkförklaring ska finnas kvar.

Lägg diskreta valbara tips i registrering, SOS, plan och statistik med Läsa/stänga och Visa inte igen. Endast avvisade tips-ID:n sparas lokalt per gäst/konto via befintlig preferenstjänst; aldrig registreringar eller medicinska slutsatser. Fel vid sparning ska vara återförsökbara. Tips ska inte täcka innehåll eller registrera något. Verifiera nollnivå, tomma/ogiltiga tal, datum, data-/kontoisolering, bakåtnavigering och frivillig hjälp. Fysisk TalkBack/tangentbord/Safe Area kvar i fas 25.
**Status:** Lokala kontroller passerar. 1/8 huvudpunkter (12,5 %) och 6/32 delpunkter (18,75 %); kodpunkter inväntar CI.

## Genomförd acceptans

Slutgranskning efter grön CI på `dd68804`: paketstorlek begränsas till 1–200 och pris till 0–100000 kr enligt befintligt Firestore-schema. Gränstester tillagda; reglerna ändras inte. TypeScript och 218 tester passerar även efter korrigeringen. Ny slutlig CI krävs före merge.

Fyra steg och alla planval är kvar. Välkomsttexten roterar inte längre och stor logobild visas bara på första steget. Lugn standardtakt kan ändras via utfällning. Endast basnivå behöver anges; frivillig ekonomidel har öppna standarder (20 per paket, pris 0 utan besparing). Tidigare exempelpris 85 används inte som om det vore användarens eget. Tomma tal och exponent-/hexformat accepteras inte som verkliga uppgifter. Nollnivå och nollpris stöds. Fel före nästa steg visas på svenska; Tillbaka behåller värden. Stegindikator har tillgängligt värde och radioval använder checked.

Profilskapandet har ändrats från ersättning av hela Data med EMPTY till en funktion som bevarar historik och inte ersätter befintlig profil. Konto-/gästval, synkförklaring och samtyckesflöde är kvar. Fyra diskreta utfällbara tips finns i respektive register-/SOS-/plan-/statistikvy. Endast avvisade ID:n sparas per identitet; sparfel visas med återförsök. Inga registreringar eller molnanrop skapas av tips.

TypeScript och 218 tester passerar (202 ordinarie, 10 storage, 6 migration). Testar talgränser, datum, oförändrade historikreferenser, oförändrad befintlig plan, preferensisolering och faktiska knapphanterare för framåt/bakåt. Fysisk TalkBack, stora texter, tangentbord, Safe Area och små skärmar kvarstår i fas 25. Kodgranskning av flexibel layout och 48 dp ersätter inte enhetsprov. Ingen ny Android-build behövs för JS-ändringarna.

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
