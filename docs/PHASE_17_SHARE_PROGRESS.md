# Fas 17.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Startad från main `1781333`. 0/8 huvudpunkter och 0/32 delpunkter verifierade. Ursprunglig 8×4-checklista från roadmapen är fryst. En PR för fasen; implementation återstår.

## Nästa arbete och avgränsning

Jämför `HomeScreen`, `DashboardOverview`, `DailyProgressShareArtwork`, `DailyProgressShareCard` och `domain/dailyShareCard` innan ändringar. Startsidan visar kvar av dagsmål som huvudvärde och förbrukad procent i en mindre ring. Delningsbild och förhandsvisning ska använda samma presentationsmodell och utseende.

Bevara befintliga export-/integritetsskydd i ProfileScreen: explicit förhandsvisning, användarinitierad delning, skydd mot ändrade värden och gamla asynkrona svar. Exportera bara kortet utan UID, konto, systemfält eller historikdetaljer. Testa nollmål, övertrassering, stora värden och exporttillstånd. Använd befintliga SVG-/kodresurser; inga nya native-beroenden eller Firestore-regler planeras. Faktisk Android-PNG/systemdelning och bred TalkBack-QA ligger i fas 25 och är inte utförda.

1. [ ] **Visuell inventering (0/4)**
   - [ ] 1.1 Jämför startsidans kort och delningskort.
   - [ ] 1.2 Fastställ gemensam layout och färger.
   - [ ] 1.3 Fastställ typografi och ringstorlek.
   - [ ] 1.4 Dokumentera exempeldata.
2. [ ] **Gemensam datamodell (0/4)**
   - [ ] 2.1 Beräkna kvar av mål.
   - [ ] 2.2 Beräkna använd procent.
   - [ ] 2.3 Hantera nollmål.
   - [ ] 2.4 Hantera överskridet mål.
3. [ ] **Bildlayout (0/4)**
   - [ ] 3.1 Matcha startsidans huvudvärde.
   - [ ] 3.2 Matcha mindre ring till höger.
   - [ ] 3.3 Matcha rubrik och stödtext.
   - [ ] 3.4 Behåll delningsytan fristående.
4. [ ] **Export (0/4)**
   - [ ] 4.1 Generera PNG av kortytan.
   - [ ] 4.2 Behåll förhandsvisning.
   - [ ] 4.3 Dela endast på uttrycklig åtgärd.
   - [ ] 4.4 Hantera fel och avbrott.
5. [ ] **Integritet (0/4)**
   - [ ] 5.1 Uteslut kontoidentifierare.
   - [ ] 5.2 Uteslut detaljerad historik.
   - [ ] 5.3 Undvik automatisk uppladdning.
   - [ ] 5.4 Förhindra gammal bild efter dataändring.
6. [ ] **Tillgänglighet (0/4)**
   - [ ] 6.1 Tydliga svenska knapptexter.
   - [ ] 6.2 Förhandsvisning med etiketter.
   - [ ] 6.3 Tillräckliga tryckytor.
   - [ ] 6.4 Hantera stora textstorlekar.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa delad beräkningslogik.
   - [ ] 7.2 Testa nollmål och överskridande.
   - [ ] 7.3 Testa exportens integritetsgränser.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera visuell acceptans.
   - [ ] 8.2 Samla native-delningstest till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

