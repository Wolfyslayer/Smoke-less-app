# Fas 18.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Startad från main `0fdd4b1`. 0/8 huvudpunkter och 0/32 delpunkter verifierade. Ursprungliga 8×4-ID är frysta. En PR för fasen.

## Ändringskontrakt och riskmatris

Frivilligt lokalt fasval: förberedelse, nedtrappning, stoppdag, tidig rökfrihet eller underhåll. Ingen fas väljs som bevis på hälsotillstånd; användaren väljer själv och kan återgå till ingen anpassning. Valet ändrar inte profil, plan eller historik. Visa kort nästa steg och dagens avstämningsstatus på Hem och i SOS. Befintlig coach, plan och registrering återanvänds.

Lagra bara fas-ID separat per UID/gäst, utan ny molnsynk. Återanvänd säker princip för identitetsnyckel, skrivkö, generation och felmeddelanden. Testa snabba val, kontobyte, skadad lagring och noll/få registreringar. Offline är standard; inga externa tjänster eller beroenden behövs. Riskkritisk historik-/kontoisolering testas automatiskt; fysisk skärm-, TalkBack- och offlineacceptans kvarstår i fas 25.

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

