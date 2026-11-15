# Fas 16.5 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Startad 2026-11-15 från `main` (`07ff48c`). 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklistans ursprungliga ID och omfattning från masterplanen är frysta. En PR för fasen; verifiera båda CI innan nästa commit.

## Inventering och avgränsning

Befintlig `HomeScreen` har dagens framsteg, uppmuntran, coach, återfallsstöd, snabbval, tid sedan senaste cigaretten, veckodiagram, besparingar/mål och daglig avstämning. Data kommer från sessionsmodellen och befintlig domänlogik. Registrering och SOS ska fortsatt vara direkt åtkomliga oberoende av kortval.

Anpassning ska gälla en begränsad uppsättning översiktskort: dagens mål, tid sedan senaste cigaretten/delmål, besparingar, röksug och veckoframsteg. Val och ordning sparas lokalt separat för gäst och varje konto. Ingen molnsynk eller ändring av profil-/Firestore-modell behövs i denna fas. Återställning påverkar endast layoutval. Inga externa tjänster eller native-beroenden tillkommer.

Först verifieras normalisering, ordning, återställning och lagringsisolering. Sedan kopplas tillgängliga visa/dölj- och flytta-knappar till startsidan. Bred fysisk QA dokumenteras för fas 25.

1. [ ] **Dashboardinventering (0/4)**
   - [ ] 1.1 Kartlägg befintliga kort.
   - [ ] 1.2 Identifiera datakällor.
   - [ ] 1.3 Fastställ standardlayout.
   - [ ] 1.4 Fastställ integritetsgränser.
2. [ ] **Anpassning (0/4)**
   - [ ] 2.1 Välj synliga kort.
   - [ ] 2.2 Ändra kortordning.
   - [ ] 2.3 Återställ standard.
   - [ ] 2.4 Hantera saknade värden.
3. [ ] **Kortinnehåll (0/4)**
   - [ ] 3.1 Dagens mål.
   - [ ] 3.2 Rökfri tid och delmål.
   - [ ] 3.3 Besparingar.
   - [ ] 3.4 Röksug och framsteg.
4. [ ] **Persistens (0/4)**
   - [ ] 4.1 Spara lokala val.
   - [ ] 4.2 Hantera gästläge.
   - [ ] 4.3 Synka endast när säkert.
   - [ ] 4.4 Hantera kontobyte.
5. [ ] **Layout (0/4)**
   - [ ] 5.1 Behåll överblick utan onödig scroll.
   - [ ] 5.2 Stöd stora textstorlekar.
   - [ ] 5.3 Stöd små skärmar.
   - [ ] 5.4 Granska tillgänglighet.
6. [ ] **Prestanda (0/4)**
   - [ ] 6.1 Undvik onödiga omrenderingar.
   - [ ] 6.2 Beräkna aggregat effektivt.
   - [ ] 6.3 Hantera offline.
   - [ ] 6.4 Hantera snabba registreringar.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa val och ordning.
   - [ ] 7.2 Testa återställning.
   - [ ] 7.3 Testa dataseparering.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera standardval.
   - [ ] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

