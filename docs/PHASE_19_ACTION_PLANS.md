# Fas 19.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Mergad i PR #167 som `9d0505e`. 8/8 och 32/32 (100 %) verifierade på kod-/test-/dokumentationsnivå. Slutlig head `e460027` grön validate/rules; TypeScript och 195 tester passerade. Fysisk Android/TalkBack-QA kvarstår i fas 25.

## Ändringskontrakt och acceptans

Återanvänd befintliga åtta SOS-strategier och fem situationer. Användaren kan välja högst tre steg per situation, ordna dem, använda ett steg direkt i befintligt SOS och rensa planen. Ett valt tips kan sparas i planen genom uttrycklig knapp. Ingen automatisk loggning eller betal-AI; uppföljning via befintligt Spara röksug är frivillig.

Persistens lagrar endast stabila strategi-ID:n per situation, lokalt per gäst/UID i eget namespace. Återanvänd fas 18:s skrivkö, fel-/avbrottsskydd och identitetsguard. Ingen profil, historik, Firestore-regel eller synkmodell ändras. Testa normalisering, max tre steg, ordning, återställning, gamla/okända strategi-ID:n och kontoseparering. Fysisk TalkBack-, offline- och SOS-regression samlas i fas 25 utan påstådda resultat.

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

Åtta befintliga SOS-tips har stabila ID:n, utan ändrade texter eller loggfält. `actionPlans` normaliserar endast version, kända situationer och högst tre unika giltiga steg i användarens ordning. Normalisering hanterar gammalt/skadat format och okända ID:n neutralt. Val, flytt och rensning är immutabla och påverkar bara vald situations preferens.

`PersonalActionPlan` visar sparade steg och situationer i SOS. Användaren kan välja/ordna steg, spara valt tips, använda ett tips eller rensa planen. Att använda ett steg anropar endast befintlig onSelectTip; ingen craving-post eller hjälpsamhetsmarkering sparas automatiskt. Befintlig frivillig uppföljning med Spara röksug bevaras. Det går att lämna utan att logga varje händelse. Läsfel, skrivfel och återförsök hanteras via samma lokala preferenslager som fas 18, i separat namespace per UID/gäst. Ingen profil- eller historikmutation, molnsynk eller extern tjänst tillkommer.

Källkodsgranskning: checkbox/radio/knappar har etiketter och tillstånd, minst 48 dp, radbrytbar text och flex-wrap för små skärmar. Valda tips har synlig och tillgänglig markering. Ingen ny tangentbords- eller fokusfälla. Fysisk TalkBack och skärmgeometri är inte verifierade och testas i fas 25.

TypeScript och 195 lokala tester passerar (179 ordinarie, 10 storage, 6 migration). Fem nya tester täcker normalisering, maxgräns, ordning, reset, idempotent tipsminne, kontoseparering och frånvaro av automatisk loggning. Befintliga preferenstester täcker väntande skrivningar, läs-/skrivfel och identitetsövergång. Fas 25 ska prova kallstart/offline, kontobyten, avbrutna/snabba val, valda tips och frivillig uppföljning på Android. Ny Android-build: NEJ, endast TypeScript/testscript/dokumentation.

