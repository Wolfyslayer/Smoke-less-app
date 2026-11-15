# Fas 16.6 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Pågående i PR #163. 6/8 huvudpunkter (75 %) och 28/32 delpunkter (87,5 %) verifierade på kod-/automatisk test-/dokumentationsnivå med gröna validate/rules på `f4231c3`. Sista bekräftelsefeedbacken inväntar egen CI. Ingen fysisk Android-QA är utförd. Ursprunglig 8×4-checklista är bevarad.

## Första inventering och ändringskontrakt

Tre planlägen finns redan i domänmodellen: direktstopp, automatisk nedtrappning och nedtrappning med valt datum. PlanScreen har takt-/omstartsbekräftelser och datumväljare; SettingsPlanSection ändrar dagsmål direkt. Återanvänd domänfunktionerna och bygg inte en parallell planmodell.

Prioriterat gap: dagsmålsändringar saknar förhandsvisning och uttryckligt val mellan fast datum och automatisk omräkning. `adjustReductionTarget` kan dessutom flytta startAt förbi ett redan passerat plannedQuitAt, vilket strider mot `validateData`. Detta ska rättas och regressionstestas före merge.

Planerad lösning: ren förhandsvisningsfunktion för nytt mål och datumpolicy, uttrycklig bekräftelse/avbryt i befintliga inställningar och kontroll mot profiländring sedan förhandsvisning. Inga registreringar, SOS, avstämningar, baseline eller ursprunglig start får skrivas över. Bevara befintliga kontolagrings-/synkgränser; inga Firestore-regler eller nya profilfält planeras.

Bred fysisk kalender-, tangentbords-, TalkBack-, offline- och tvåenhets-QA överlämnas till fas 25 utan godkännandekryss.

1. [x] **Inventering (4/4)**
   - [x] 1.1 Kartlägg befintliga tre planlägen.
   - [x] 1.2 Kartlägg datum- och målberäkningar.
   - [x] 1.3 Kartlägg synk och historik.
   - [x] 1.4 Undvik dubbel implementation.
2. [x] **Måländring (4/4)**
   - [x] 2.1 Förhandsvisa nytt dagsmål.
   - [x] 2.2 Förhandsvisa ny takt.
   - [x] 2.3 Förhandsvisa stoppdatum.
   - [x] 2.4 Förklara konsekvenser tydligt.
3. [x] **Datumval (4/4)**
   - [x] 3.1 Behåll valt slutdatum vid behov.
   - [x] 3.2 Tillåt automatisk omräkning.
   - [x] 3.3 Hantera passerade datum.
   - [x] 3.4 Hantera lokala kalenderdagar.
4. [x] **Historik (4/4)**
   - [x] 4.1 Bevara cigarettregistreringar.
   - [x] 4.2 Bevara SOS och avstämningar.
   - [x] 4.3 Bevara ursprunglig start.
   - [x] 4.4 Undvik tyst överskrivning.
5. [x] **Kontosynk (4/4)**
   - [x] 5.1 Hantera gästläge.
   - [x] 5.2 Hantera revisionskonflikter.
   - [x] 5.3 Hantera offlineändringar.
   - [x] 5.4 Hantera kontobyte.
6. [ ] **UX (2/4)**
   - [ ] 6.1 Visa begriplig bekräftelse.
   - [ ] 6.2 Erbjud avbryt.
   - [x] 6.3 Visa stödjande texter.
   - [x] 6.4 Granska tillgänglighet.
7. [x] **Tester (4/4)**
   - [x] 7.1 Testa alla planlägen.
   - [x] 7.2 Testa datumgränser.
   - [x] 7.3 Testa konfliktfall.
   - [x] 7.4 Verifiera CI.
8. [ ] **Avslut (2/4)**
   - [x] 8.1 Dokumentera ändringskontrakt.
   - [x] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

## Implementationsmilstolpe

**Verifieringsunderlag:** 2.1 och 2.4 omfattas av målpreview och nya tester; 2.2 återanvänder PlanScreen:s befintliga veckoförhandsvisning för takt; 2.3 återanvänder datumväljarens valda datum före explicit bekräftelse. 3.1–3.4 och 4.1–4.4 testas mot framtida/passerat datum, automatisk policy, lokal dag/DST, ändrad profil och tillkomna historikposter. 5.1/5.3 återanvänder lokala sessionens testade offlineisolering; 5.4 skyddas av UID-nycklad SmokeLessSession och oförändrade kontobytetester. 5.2 är statiskt avstämd mot cloudSync.native:s observerade planversion och transaktionskontroll före revisionsskrivning, plus befintliga automatiska konflikttester. Detta är inte en utförd fysisk tvåenhetskonflikt. 6.3/6.4 är statiskt granskade stödtexter, 48 dp-kontroller, roller, disabled/busy och radbrytning.

**Sista UX-korrigering:** Förhandsvisningen stängs först när renderad profil motsvarar den bekräftade profilen. Om en konkurrerande profiländring nekar sparandet ligger utkastet kvar med konflikttext, så ett avvisat val inte ser sparat ut. Upprepade bekräftelser spärras medan ändringen behandlas. TypeScript och 157 ordinarie tester passerar lokalt; storage 10/10 och migration 6/6 passerade med implementationspaketet. Även denna korrigering ska få egen grön CI.

Dagsmålets plus/minus skapar nu en lokal förhandsvisning med sju kalenderdagars riktvärden och nytt/behållet stoppdatum. Ändring kräver Bekräfta; Avbryt slänger bara utkastet. Vid fast datum väljer användaren uttryckligen mellan att behålla det och automatisk beräkning med sparad takt. Ett passerat fast datum kan inte behållas vid nytt dagsmål. Direktstopp har kvar sitt nollmål och spärrade stegknappar.

`planTargetPreview` återanvänder befintlig domänlogik och sparar förhandsvisningens profil och kalenderdag. Applicering nekar om aktuell profil eller kalenderdag har ändrats. De aktuella historikarrayerna bevaras även om registreringar tillkommit under förhandsvisning. Inga nya profilfält eller regler behövs. `adjustReductionTarget` nekar reankring efter ett passerat fast datum i stället för att skapa en ogiltig profil.

Datumväljaren använder nu strikt framtida kalenderdatum även vid bekräftelse. Inkommande Date jämförs som tidsstämpel så en ny Date-instans från onboarding inte nollställer pågående datumval vid ett klocktick. Kalenderdagens midnatt jämförs med dagens midnatt för att också spärra dagens datum.

Kontobyte remonterar hela `SmokeLessSession` med UID/gäst som React-key; planutkast kan inte följa med till annat konto. Gäst-/konto-/offline-/revisionsskydd använder befintlig lokal session och molnsynk. Befintliga storage-, migrerings- och domäntester körs tillsammans med sju nya preview-/kalenderfall. Fysiska tvåenhetskonflikter och Android-interaktioner är inte utförda och kvarstår i fas 25.

