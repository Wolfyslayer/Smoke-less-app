# Fas 18.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Pågående i PR #166. 1/8 huvudpunkter (12,5 %) och 6/32 delpunkter (18,75 %) verifierade genom startinventering/kontrakt på `e9e9df3`, båda CI gröna. Implementationen inväntar egen CI. Ursprungliga 8×4-ID är bevarade.

## Ändringskontrakt och riskmatris

Frivilligt lokalt fasval: förberedelse, nedtrappning, stoppdag, tidig rökfrihet eller underhåll. Ingen fas väljs som bevis på hälsotillstånd; användaren väljer själv och kan återgå till ingen anpassning. Valet ändrar inte profil, plan eller historik. Visa kort nästa steg och dagens avstämningsstatus på Hem och i SOS. Befintlig coach, plan och registrering återanvänds.

Lagra bara fas-ID separat per UID/gäst, utan ny molnsynk. Återanvänd säker princip för identitetsnyckel, skrivkö, generation och felmeddelanden. Testa snabba val, kontobyte, skadad lagring och noll/få registreringar. Offline är standard; inga externa tjänster eller beroenden behövs. Riskkritisk historik-/kontoisolering testas automatiskt; fysisk skärm-, TalkBack- och offlineacceptans kvarstår i fas 25.

1. [x] **Inventering och avgränsning (4/4)**
   - [x] 1.1 Inventera befintliga funktioner och undvik duplicering.
   - [x] 1.2 Dokumentera användarbehov och begränsningar.
   - [x] 1.3 Fastställ acceptanskriterier.
   - [x] 1.4 Fastställ risker och testmatris.
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
8. [ ] **Slutverifiering och merge (2/4)**
   - [x] 8.1 Dokumentera genomförd acceptans.
   - [x] 8.2 Samla kvarstående fysisk enhets-QA i fas 25.
   - [ ] 8.3 Verifiera grön CI på slutlig commit.
   - [ ] 8.4 Merga fas-PR.

## Implementation och verifieringsunderlag

`personalJourney` normaliserar endast version och ett frivilligt fas-ID. Standard är ingen fasanpassning; användaren kan välja eller återställa utan ändrad profil, plan, historik eller bekräftelse på ett hälsotillstånd. Fem val täcker förberedelse, nedtrappning, stoppdag, tidig rökfrihet och underhåll. Stödtexten ger nästa konkreta steg (plan, SOS eller avstämning); vid registrerad cigarett i rökfri fas erbjuds stöd utan nollställning eller skuldbeläggning.

`PersonalJourney` finns på Hem och SOS. Radioval har checked/disabled, knappar minst 48 dp, läsordning följer källordning och text är radbrytbar. Valredigeringen är hopfälld tills användaren öppnar den. Dagens avstämning återanvänder befintlig funktion men räknar aktuella registreringar i den funktionella uppdateringen, inte en gammal fångad räknare. Befintlig plan, coach, andning och registrering bevaras.

`createLocalPreferences` och `useLocalPreferences` ger lokal lagring med namespace och separata gäst-/UID-nycklar, skrivköer, inaktuell-läsning-skydd och återförsök. Skadad lagring återgår till säkert standardval utan automatisk överskrivning; läsfel spärrar ändringar, skrivfel visas. Sessionen är redan UID-nycklad; varken utkast eller ett sent fel får följa till annat konto. Inget nätverk, nya tjänster eller profilfält tillkommer.

TypeScript och 189 lokala tester passerar (173 ordinarie, 10 storage, 6 migration). Sex nya tester kör faktisk fas-/lagringskod för opt-in, normalisering, anpassning, namespace/kontoisolering, ordning, avbrott och lagringsfel; hook/UI har kompletterande källkodskontrakt. Detta är inte fysisk Android- eller TalkBack-verifiering. Fas 25 testar kontobyten, kallstart/offline, alla fasval och återställning, avstämning under snabba registreringar, fokus, små skärmar och maximal textstorlek.

Ny Android-build: NEJ, endast TypeScript, testscript och dokumentation. Inga native-beroenden, konfigurationer eller Firestore-regler ändras.

