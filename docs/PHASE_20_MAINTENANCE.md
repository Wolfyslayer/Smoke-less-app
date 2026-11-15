# Fas 20.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Mergad i PR #168 som `7cb70a4`. 8/8 och 32/32 (100 %) verifierade på kod-/test-/dokumentationsnivå. Slutlig head `6861470` grön validate/rules; TypeScript och 198 tester passerade. Faktisk notisleverans och fysisk Android/TalkBack-QA kvarstår i fas 25.

## Ändringskontrakt och acceptans

Återanvänd det frivilliga fasvalet Underhåll från fas 18. När användaren valt det ersätter ett underhållskort cigarettbudgeten på Hem, med bekräftade framsteg, stöd vid registrerad cigarett och frivillig avstämning. Ingen fas eller plan ändras automatiskt. Befintliga SOS-riskplaner och historik återanvänds; gamla rekord raderas inte vid enstaka cigaretter.

Erbjud veckovis påminnelse som alternativ till daglig i befintliga inställningar. Tydlig veckodag, separat aktivering och möjlighet att stänga av. Byte till lägre frekvens ska inte lämna en äldre daglig notis aktiv. Inga nya native-beroenden, profilfält eller Firestore-regler. Testa underhåll med/utan registreringar, saknade avstämningar, bevarad historik och frekvens/veckodag. Fysisk notification-/Android-/TalkBack-QA ligger i fas 25.

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

## Implementation och verifieringsunderlag

Det redan frivilliga fasvalet maintenance aktiverar ett underhållskort i stället för cigarettbudgeten i dashboardens målyta. Vanlig progress-SVG finns kvar som standard och som avsedd delningsyta. Underhåll visar endast bekräftade dagar/längsta följd från samma statistikmodell, aldrig antagen rökfrihet. Registrerad cigarett ger stödtext och SOS-länk utan automatisk planändring, rekordnollställning eller radering. Frivillig avstämning använder befintliga historikfält; riskplanerna från fas 19 återanvänds genom SOS. Byte till annat fasval återställer normal presentation utan profiländring.

Påminnelser kan vara avstängda, dagliga eller veckovisa på måndagar vid vald lokal tid. Lägre frekvens väljs uttryckligen; den gamla notisen avbokas innan det nya valet sparas, och ny schemaläggning kräver separat Aktivera-knapp och behörighet. Frekvensen läses tillsammans med övriga inställningar innan kontrollerna aktiveras. Befintligt saknat värde betyder daglig frekvens för bakåtkompatibilitet. Notisinställningarna är installationslokala, vilket också anges i UI. Weekly-triggerns måndag=2 är verifierat mot installerade Expo Notifications-typer. Faktisk leverans är inte telefonverifierad.

Knappar/radioval har minst 48 dp, checked/disabled, radbrytbara texter och tydlig avstängning. Statisk granskning och tester ersätter inte TalkBack/fysisk layout. TypeScript och 198 lokala tester passerar (182 ordinarie, 10 storage, 6 migration). Nya tester kontrollerar inga uppfunna rökfria dagar, bevarade rekord vid cigarett, oförändrad historik, frekvens/veckodag/tidsgränser och ordningen avbokning före sparande. Fas 25 ska verifiera verklig leverans/avbokning, kallstart, fasbyte, små skärmar, stor text och TalkBack.

Ny Android-build: NEJ. Expo Notifications finns redan; inga nya native-beroenden, konfigurationer, profilfält eller regler tillkommer.

