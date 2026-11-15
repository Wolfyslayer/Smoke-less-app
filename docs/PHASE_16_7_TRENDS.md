# Fas 16.7 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Mergad i PR #164 som `1781333a1689ae7c163a0b7bf484bee01b3d5338`. 8/8 huvudpunkter och 32/32 delpunkter (100 %) verifierade på kod-/automatisk test-/dokumentationsnivå. Slutlig head `34055f4` hade grön validate/rules. Ursprunglig 8×4-checklista är bevarad; fysisk Android/TalkBack-QA är inte utförd och kvarstår i fas 25.

## Nästa konkreta arbete

Inventera StatsScreen och `getDashboardMetrics` innan nya beräkningar. Bygg rena, testbara kalenderperiodsaggregat för vecka/månad som skiljer saknade registreringar från uttryckligen bekräftade rökfria dagar. Använd registrerad konsumtion som registreringar, inte som säker faktisk konsumtion när dagen inte är avstämd. Jämför likvärdiga perioder och visa tydliga datum/underlag.

Förändra inte historik, planmodell, synk eller Firestore-regler. Återanvänd domänens lokala kalenderdagar och redan befintliga statistikkällor. Testa tom data, ofullständiga perioder, nollmål, framtida poster, sommartid och periodgränser. Bred fysisk Android/TalkBack-QA ligger i fas 25 och är inte utförd. EAS Update ska fortsatt ha en separat senare PR.

1. [x] **Statistikinventering (4/4)**
   - [x] 1.1 Kartlägg befintliga diagram.
   - [x] 1.2 Kartlägg beräkningskällor.
   - [x] 1.3 Identifiera saknade-data-fall.
   - [x] 1.4 Fastställ korrekta definitioner.
2. [x] **Jämförelser (4/4)**
   - [x] 2.1 Vecka mot vecka.
   - [x] 2.2 Månad mot månad.
   - [x] 2.3 Visa planmål mot registreringar.
   - [x] 2.4 Förklara jämförelseperioder.
3. [x] **Trender (4/4)**
   - [x] 3.1 Visa konsumtionstrend.
   - [x] 3.2 Visa röksugstrend.
   - [x] 3.3 Visa personliga rekord.
   - [x] 3.4 Undvik missvisande sviter.
4. [x] **Datakvalitet (4/4)**
   - [x] 4.1 Skilj saknad data från noll.
   - [x] 4.2 Skilj fakta från uppskattning.
   - [x] 4.3 Hantera ändrade planer.
   - [x] 4.4 Hantera tidszon och datumgräns.
5. [x] **Presentation (4/4)**
   - [x] 5.1 Stöd små skärmar.
   - [x] 5.2 Stöd stora texter.
   - [x] 5.3 Gör diagram TalkBack-läsbara.
   - [x] 5.4 Samordna dashboard.
6. [x] **Prestanda (4/4)**
   - [x] 6.1 Beräkna lokalt.
   - [x] 6.2 Undvik upprepade tunga aggregat.
   - [x] 6.3 Hantera lång historik.
   - [x] 6.4 Fungera offline.
7. [x] **Tester (4/4)**
   - [x] 7.1 Testa jämförelser.
   - [x] 7.2 Testa saknade data.
   - [x] 7.3 Testa datumgränser.
   - [x] 7.4 Verifiera CI.
8. [x] **Avslut (4/4)**
   - [x] 8.1 Dokumentera statistikdefinitioner.
   - [x] 8.2 Samla enhets-QA till fas 25.
   - [x] 8.3 Verifiera slutlig grön CI.
   - [x] 8.4 Merga fas-PR.

## Inventering, definitioner och genomförande

**Slutacceptans:** TypeScript och 182 lokala tester passerade (166 ordinarie inklusive nio trendfall, 10 storage, 6 migration). Samma kontroller körs i validate; rules är grön utan ändrade Firestore-regler. Funktionerna är testade med verklig domänkod och kontrollerade datum/indata. Layout, läsordning och offlineberoenden är statiskt granskade; testerna simulerar inte en fysisk telefon eller TalkBack. Fasens återstående fysiska kontroller är redovisade nedan och flyttade till fas 25. Ingen native-build behövs: inga nya beroenden/native-inställningar, endast testscript och TypeScript/dokumentation.

StatsScreen har redan sjudagarsstaplar, valda rullande perioder, besparingsuppskattningar, milstolpar och SOS-sammanställningar. `getDashboardMetrics` försörjer startsidans dagsmål/antal/vecka från samma sessionsdata. Ny statistik använder rena `buildPersonalTrends`, utan ändrad datamodell eller nätverksberoende.

- **Vecka:** senast helt avslutade måndag–söndag jämförs med veckan före. Pågående vecka ingår inte. **Månad:** föregående kalender­månad jämförs med månaden dessförinnan. Datumgränser och dagantal visas; dessa jämförelser är oberoende av den äldre Idag/7 dagar/30 dagar-väljaren.
- **Registrerat snitt:** antal giltiga registreringar / kalenderdagar. Saknad avstämning förblir saknad även vid noll registreringar. Konsumtionsjämförelsen visas först när båda periodernas samtliga dagar är avstämda; den är fortfarande självrapporterad, inte uppmätt konsumtion. Röksug visas som registrerade tillfällen och skillnad per kalenderdag, inte som säker faktisk förekomst.
- **Rökfri dag:** complete och smokeFree måste vara sanna och dagens antal cigarettregistreringar noll. Motstridiga dubbla avstämningar eller en rökfri avstämning med cigarettposter godtas inte. Ogiltiga datum och framtida poster räknas inte.
- **Rekord:** längsta obrutna följd av uttryckligen bekräftade rökfria lokala kalenderdagar. Luckor bryter följden. Aktuell följd anges med slutdatum: idag om idag är bekräftat rökfri, annars till och med igår. Ett tidigare rekord raderas inte av en ofärdig dag eller planbyte. StatsScreen:s äldre milstolpar använder samma beräkning.
- **Planmål:** endast dagar från senaste planstart får mål från aktuell profil. Äldre mål visas som saknade eftersom ingen versionshistorik finns. Historik, ursprunglig start och molnsynk ändras inte. Framtida poster finns kvar i Historik men exkluderas ur dashboardens aktuella antal och senaste cigarett.
- **Prestanda:** en genomgång av indata bygger dagsindex. Periodsummeringarna går över högst två veckor och två månader; rekord sorterar bara bekräftade dagar. Aggregat och dashboardmått memoiseras per dataändring/minut, medan SOS och appens klocka fortsätter som tidigare. Nya registreringar ger omedelbar omberäkning.
- **Presentation:** datum, dagantal, täckning och underlag visas i radbrytbara textkort; inga fasta bredder/höjder. Dagrader och periodgrupper är tillgängliga textgrupper och rubriker har header-roll. Faktisk TalkBack-läsning och Android-layout återstår i fas 25.

Tester täcker tomma perioder, full/ofullständig täckning, olika månadslängder, framtida/ogiltiga poster, luckor och motsägelser, ändrad plan/nollmål, båda svenska DST-gränserna, årsskifte, 20 000 poster och samstämmighet med dashboarden. TypeScript och lokala tester ska passera före push. Bred fysisk Android-, TalkBack-, offline- och långhistorik-QA dokumenteras till fas 25 utan godkännandekryss.

