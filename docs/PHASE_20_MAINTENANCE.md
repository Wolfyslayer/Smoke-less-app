# Fas 20.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Startad från main `9d0505e`. 0/8 och 0/32 verifierade (0 %). Ursprungliga 8×4-ID är frysta. En PR för fasen.

## Ändringskontrakt och acceptans

Återanvänd det frivilliga fasvalet Underhåll från fas 18. När användaren valt det ersätter ett underhållskort cigarettbudgeten på Hem, med bekräftade framsteg, stöd vid registrerad cigarett och frivillig avstämning. Ingen fas eller plan ändras automatiskt. Befintliga SOS-riskplaner och historik återanvänds; gamla rekord raderas inte vid enstaka cigaretter.

Erbjud veckovis påminnelse som alternativ till daglig i befintliga inställningar. Tydlig veckodag, separat aktivering och möjlighet att stänga av. Byte till lägre frekvens ska inte lämna en äldre daglig notis aktiv. Inga nya native-beroenden, profilfält eller Firestore-regler. Testa underhåll med/utan registreringar, saknade avstämningar, bevarad historik och frekvens/veckodag. Fysisk notification-/Android-/TalkBack-QA ligger i fas 25.

1. [ ] **Inventering och avgränsning (0/4)**
   - [ ] 1.1 Inventera befintliga funktioner och undvik duplicering.
   - [ ] 1.2 Dokumentera användarbehov och begränsningar.
   - [ ] 1.3 Fastställ acceptanskriterier.
   - [ ] 1.4 Fastställ risker och testmatris.
2. [ ] **Datamodell och integritet (0/4)**
   - [ ] 2.1 Definiera minsta nödvändiga datamängd.
   - [ ] 2.2 Skydda gäst- och kontodata.
   - [ ] 2.3 Bevara tidigare historik.
   - [ ] 2.4 Verifiera bakåtkompatibilitet.
3. [ ] **Grundflöde (0/4)**
   - [ ] 3.1 Implementera fasens huvudflöde.
   - [ ] 3.2 Hantera tomma och felaktiga värden.
   - [ ] 3.3 Hantera avbrott och återstart.
   - [ ] 3.4 Säkerställ tydliga användarval.
4. [ ] **Personalisering (0/4)**
   - [ ] 4.1 Anpassa till användarens uttryckliga val.
   - [ ] 4.2 Behåll säkra standardinställningar.
   - [ ] 4.3 Undvik skuldbeläggande formuleringar.
   - [ ] 4.4 Gör anpassning frivillig och reversibel.
5. [ ] **Offline och synk (0/4)**
   - [ ] 5.1 Fungera utan nätverk när möjligt.
   - [ ] 5.2 Hantera inloggning och utloggning.
   - [ ] 5.3 Undvik synkkonflikter och dataförlust.
   - [ ] 5.4 Undvik nya kostsamma beroenden.
6. [ ] **Tillgänglighet och svenska texter (0/4)**
   - [ ] 6.1 Använd tydlig svenska.
   - [ ] 6.2 Granska TalkBack och fokus.
   - [ ] 6.3 Granska små skärmar och stor text.
   - [ ] 6.4 Granska tryckytor och kontrast.
7. [ ] **Automatiska tester och CI (0/4)**
   - [ ] 7.1 Testa centrala domänfall.
   - [ ] 7.2 Testa fel- och avbrottsfall.
   - [ ] 7.3 Testa integritet och dataseparering.
   - [ ] 7.4 Verifiera obligatorisk CI.
8. [ ] **Slutverifiering och merge (0/4)**
   - [ ] 8.1 Dokumentera genomförd acceptans.
   - [ ] 8.2 Samla kvarstående fysisk enhets-QA i fas 25.
   - [ ] 8.3 Verifiera grön CI på slutlig commit.
   - [ ] 8.4 Merga fas-PR.

