# Fas 16.7 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Startad från main `525b07b`. 0/8 huvudpunkter och 0/32 delpunkter verifierade. Ursprunglig 8×4-checklista från roadmapen är fryst. Exakt en PR för fasen; implementation återstår.

## Nästa konkreta arbete

Inventera StatsScreen och `getDashboardMetrics` innan nya beräkningar. Bygg rena, testbara kalenderperiodsaggregat för vecka/månad som skiljer saknade registreringar från uttryckligen bekräftade rökfria dagar. Använd registrerad konsumtion som registreringar, inte som säker faktisk konsumtion när dagen inte är avstämd. Jämför likvärdiga perioder och visa tydliga datum/underlag.

Förändra inte historik, planmodell, synk eller Firestore-regler. Återanvänd domänens lokala kalenderdagar och redan befintliga statistikkällor. Testa tom data, ofullständiga perioder, nollmål, framtida poster, sommartid och periodgränser. Bred fysisk Android/TalkBack-QA ligger i fas 25 och är inte utförd. EAS Update ska fortsatt ha en separat senare PR.

1. [ ] **Statistikinventering (0/4)**
   - [ ] 1.1 Kartlägg befintliga diagram.
   - [ ] 1.2 Kartlägg beräkningskällor.
   - [ ] 1.3 Identifiera saknade-data-fall.
   - [ ] 1.4 Fastställ korrekta definitioner.
2. [ ] **Jämförelser (0/4)**
   - [ ] 2.1 Vecka mot vecka.
   - [ ] 2.2 Månad mot månad.
   - [ ] 2.3 Visa planmål mot registreringar.
   - [ ] 2.4 Förklara jämförelseperioder.
3. [ ] **Trender (0/4)**
   - [ ] 3.1 Visa konsumtionstrend.
   - [ ] 3.2 Visa röksugstrend.
   - [ ] 3.3 Visa personliga rekord.
   - [ ] 3.4 Undvik missvisande sviter.
4. [ ] **Datakvalitet (0/4)**
   - [ ] 4.1 Skilj saknad data från noll.
   - [ ] 4.2 Skilj fakta från uppskattning.
   - [ ] 4.3 Hantera ändrade planer.
   - [ ] 4.4 Hantera tidszon och datumgräns.
5. [ ] **Presentation (0/4)**
   - [ ] 5.1 Stöd små skärmar.
   - [ ] 5.2 Stöd stora texter.
   - [ ] 5.3 Gör diagram TalkBack-läsbara.
   - [ ] 5.4 Samordna dashboard.
6. [ ] **Prestanda (0/4)**
   - [ ] 6.1 Beräkna lokalt.
   - [ ] 6.2 Undvik upprepade tunga aggregat.
   - [ ] 6.3 Hantera lång historik.
   - [ ] 6.4 Fungera offline.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa jämförelser.
   - [ ] 7.2 Testa saknade data.
   - [ ] 7.3 Testa datumgränser.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera statistikdefinitioner.
   - [ ] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

