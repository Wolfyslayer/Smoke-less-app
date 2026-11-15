# Fas 16.6 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Pågående i PR #163, startad från `main` (`a3c53e8`). 1/8 huvudpunkter (12,5 %) och 6/32 delpunkter (18,75 %) verifierade efter inventeringens gröna CI på `c9ce3d8`. Implementation inväntar egen CI. Ursprunglig 8×4-checklista är fryst.

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
2. [ ] **Måländring (0/4)**
   - [ ] 2.1 Förhandsvisa nytt dagsmål.
   - [ ] 2.2 Förhandsvisa ny takt.
   - [ ] 2.3 Förhandsvisa stoppdatum.
   - [ ] 2.4 Förklara konsekvenser tydligt.
3. [ ] **Datumval (0/4)**
   - [ ] 3.1 Behåll valt slutdatum vid behov.
   - [ ] 3.2 Tillåt automatisk omräkning.
   - [ ] 3.3 Hantera passerade datum.
   - [ ] 3.4 Hantera lokala kalenderdagar.
4. [ ] **Historik (0/4)**
   - [ ] 4.1 Bevara cigarettregistreringar.
   - [ ] 4.2 Bevara SOS och avstämningar.
   - [ ] 4.3 Bevara ursprunglig start.
   - [ ] 4.4 Undvik tyst överskrivning.
5. [ ] **Kontosynk (0/4)**
   - [ ] 5.1 Hantera gästläge.
   - [ ] 5.2 Hantera revisionskonflikter.
   - [ ] 5.3 Hantera offlineändringar.
   - [ ] 5.4 Hantera kontobyte.
6. [ ] **UX (0/4)**
   - [ ] 6.1 Visa begriplig bekräftelse.
   - [ ] 6.2 Erbjud avbryt.
   - [ ] 6.3 Visa stödjande texter.
   - [ ] 6.4 Granska tillgänglighet.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa alla planlägen.
   - [ ] 7.2 Testa datumgränser.
   - [ ] 7.3 Testa konfliktfall.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (2/4)**
   - [x] 8.1 Dokumentera ändringskontrakt.
   - [x] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

## Implementationsmilstolpe

Dagsmålets plus/minus skapar nu en lokal förhandsvisning med sju kalenderdagars riktvärden och nytt/behållet stoppdatum. Ändring kräver Bekräfta; Avbryt slänger bara utkastet. Vid fast datum väljer användaren uttryckligen mellan att behålla det och automatisk beräkning med sparad takt. Ett passerat fast datum kan inte behållas vid nytt dagsmål. Direktstopp har kvar sitt nollmål och spärrade stegknappar.

`planTargetPreview` återanvänder befintlig domänlogik och sparar förhandsvisningens profil och kalenderdag. Applicering nekar om aktuell profil eller kalenderdag har ändrats. De aktuella historikarrayerna bevaras även om registreringar tillkommit under förhandsvisning. Inga nya profilfält eller regler behövs. `adjustReductionTarget` nekar reankring efter ett passerat fast datum i stället för att skapa en ogiltig profil.

Datumväljaren använder nu strikt framtida kalenderdatum även vid bekräftelse. Inkommande Date jämförs som tidsstämpel så en ny Date-instans från onboarding inte nollställer pågående datumval vid ett klocktick. Kalenderdagens midnatt jämförs med dagens midnatt för att också spärra dagens datum.

Kontobyte remonterar hela `SmokeLessSession` med UID/gäst som React-key; planutkast kan inte följa med till annat konto. Gäst-/konto-/offline-/revisionsskydd använder befintlig lokal session och molnsynk. Befintliga storage-, migrerings- och domäntester körs tillsammans med sju nya preview-/kalenderfall. Fysiska tvåenhetskonflikter och Android-interaktioner är inte utförda och kvarstår i fas 25.

