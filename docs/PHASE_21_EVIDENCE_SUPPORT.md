# Fas 21.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Mergad i PR #169 som `70a2295`, head `694b888` med gron validate/rules. 8/8 och 32/32 (100 %) pa kod-/test-/dokumentationsniva; fysisk QA kvar i fas 25.

## Ändringskontrakt och källgräns

## Genomförd acceptans

1177:s rökstopp, läkemedel och graviditet samt Sluta-röka-linjens kontaktväg granskades 2026-11-15. Texterna är korta egna sammanfattningar utan doser eller effektlöften. Förmåners tidigare statiska dag-/vecka-/månadskort togs bort eftersom de inte visade verifierade individuella framsteg. Besparingskortet är bevarat. Ämnesval är tillfälliga och frivilliga; inget hälsofält, lagring, auth- eller synkanrop tillkommer. Källor är bokstavliga HTTPS-adresser utan parametrar. Misslyckat öppnande fångas och adressen går att kopiera. Befintligt kunskapstest uppdaterades och lades till ordinarie CI-svit (det ingick tidigare inte i npm test).

TypeScript och 202 tester (186 ordinarie, 10 storage, 6 migration) passerar lokalt. Källgranskning, datamodell, URL-fel och UI-kontrakt verifierade; fysisk läsordning, maximal text och extern webbläsarhantering är inte utförda och ligger kvar i fas 25. Ingen Android-build krävs för dessa JS-/textändringar.

Granska befintliga kunskapstexter och ersätt/komplettera med korta svenska sammanfattningar om beteendestöd, generella nikotinläkemedel och vårdvägar. Inga personliga doser, preparatval eller medicinska löften. Särskilda situationer (under 18, graviditet/amning) hänvisas till vårdpersonal. Inget hälsotillstånd ska samlas in eller härledas från historik.

Verifiera aktuella primärkällor före textändring: 1177:s Hjälp att sluta röka, Läkemedel för att sluta röka och nikotin/graviditet samt Sluta-röka-linjens egen kontaktsida. Visa källor och kontroll­datum i appen; läsbar innehållskopia fungerar offline, externa länkar öppnas endast av användaren. Testa källkopplingar, whitelist för URL:er, inga personuppgifter i länkar och säkra fel-/tomlägen. Fysisk läsordning/länkhantering granskas i fas 25.

1. [x] **Inventering och avgränsning (4/4)**
   - [x] 1.1 Inventera befintliga funktioner och undvik duplicering.
   - [x] 1.2 Dokumentera användarbehov och begränsningar.
   - [x] 1.3 Fastställ acceptanskriterier.
   - [x] 1.4 Fastställ risker och testmatris.
2. [x] **Datamodell och integritet (4/4)**
   - [x] 2.1 Definiera minsta nödvändiga datamängd.
   - [x] 2.2 Skydda gäst- och kontodata.
   - [x] 2.3 Bevara tidigare historik.
   - [x] 2.4 Verifiera bakåtkompatibilitet.
3. [x] **Grundflöde (4/4)**
   - [x] 3.1 Implementera fasens huvudflöde.
   - [x] 3.2 Hantera tomma och felaktiga värden.
   - [x] 3.3 Hantera avbrott och återstart.
   - [x] 3.4 Säkerställ tydliga användarval.
4. [x] **Personalisering (4/4)**
   - [x] 4.1 Anpassa till användarens uttryckliga val.
   - [x] 4.2 Behåll säkra standardinställningar.
   - [x] 4.3 Undvik skuldbeläggande formuleringar.
   - [x] 4.4 Gör anpassning frivillig och reversibel.
5. [x] **Offline och synk (4/4)**
   - [x] 5.1 Fungera utan nätverk när möjligt.
   - [x] 5.2 Hantera inloggning och utloggning.
   - [x] 5.3 Undvik synkkonflikter och dataförlust.
   - [x] 5.4 Undvik nya kostsamma beroenden.
6. [x] **Tillgänglighet och svenska texter (4/4)**
   - [x] 6.1 Använd tydlig svenska.
   - [x] 6.2 Granska TalkBack och fokus.
   - [x] 6.3 Granska små skärmar och stor text.
   - [x] 6.4 Granska tryckytor och kontrast.
7. [x] **Automatiska tester och CI (4/4)**
   - [x] 7.1 Testa centrala domänfall.
   - [x] 7.2 Testa fel- och avbrottsfall.
   - [x] 7.3 Testa integritet och dataseparering.
   - [x] 7.4 Verifiera obligatorisk CI.
8. [x] **Slutverifiering och merge (4/4)**
   - [x] 8.1 Dokumentera genomförd acceptans.
   - [x] 8.2 Samla kvarstående fysisk enhets-QA i fas 25.
   - [x] 8.3 Verifiera grön CI på slutlig commit.
   - [x] 8.4 Merga fas-PR.

