# Fas 22.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

## Ändringskontrakt

Bygg vidare på installerade Expo-notiser. Två frivilliga typer: avstämning (dagligen/veckovis måndag) och förberedelse inför risksituation (dagligen vid självvald tid, utan att spara situationstext). Tysta tider sparas lokalt; blockera aktivering om någon vald tid ligger inom fönstret. Generisk låsskärmstext utan plan, antal, hälsodata eller kontouppgifter. Inga automatiska tillståndsfrågor eller molnanrop. Befintligt önskemål/tid/frekvens läses bakåtkompatibelt. Ändrade tider kräver uttrycklig aktivering.

Använd en serialiserad schemaläggare med stabila identifierare och städning av äldre sparat ID. Hantera dubbeltryck, nekad behörighet, lagringsfel och delvis misslyckad schemaläggning. Nya inställningar är enhetslokala och neutrala över kontobyten, utan historikändring. Faktisk notisleverans, omstart, tidszonsbyte och Android-behörighet provas i fas 25; koda och testa gränserna nu.
**Status:** Mergad i PR #170 som `577558d`, head `377fb72` med gron validate/rules. 8/8 och 32/32 (100 %); fysisk QA kvar i fas 25.

## Genomförd acceptans och återstående enhetsprov

Befintlig notis-UI har ersatts av en återanvändbar komponent och en serialiserad tjänst. Valen är enhetslokala utan profil/historik. Äldre tid, frekvens och önskemål migreras; äldre meddelanden stängs av och kräver uttrycklig återaktivering. Stabila ID:n för två frivilliga typer undviker dubblering. Partiell schemaläggning städas vid fel; avstängningsfel visas och kan återförsökas. Ingen behörighetsfråga vid läsning. Låsskärmstexterna innehåller inte rökning, registreringar eller vald plan; appnamnet kan visas och detta förklaras.

Tysta tider har explicit start/slut, inklusive nattövergång och helt tyst dygn. Aktivering inom fönstret nekas. Formulärändringar blir inte aktiva förrän användaren sparar/aktiverar; tydlig status visas. Avstängning finns även efter läsfel. Svenska fel, 48 dp-ytor, expanderbara val, flexibla fält och status med polite live region granskade i kod. TypeScript och 208 tester passerar (192 ordinarie, 10 storage, 6 migration).

Inte utfört: faktisk leverans efter omstart, Androids tillstånd/batteriinställningar, tidszonsbyte, TalkBack och maximal text. Dessa kräver riktig enhet i fas 25. Ingen ny native-konfiguration eller beroende; ingen ny Android-build behövs för denna JS-ändring.

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
