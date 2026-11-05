# Smoke Less – masterplan för utveckling och lansering

**Syfte:** Denna fil är projektets långsiktiga, versionshanterade facit för vad vi har beslutat att bygga, vad som återstår och vad som är klart. Läs den tillsammans med `AI_WORKFLOW.md` före varje AI-arbetspass. En fas = en PR. Den aktiva PR:ns fasta huvudchecklista och aktuella CI-resultat styr exakt färdigstatus; markera inte en fas klar i denna fil förrän den är mergad och verifierad.

## Teststrategi beslutad 2026-11-04
- Samla omfattande manuell Android-acceptans, BrowserStack, skärmstorlekar, maximal text, TalkBack, tillgänglighet och full regression i **fas 25.0:s slutliga QA-grind före Google Play-lansering**. Tidigare ej utförda testpunkter förs dit och markeras inte som godkända.
- Under varje funktionsfas krävs fortsatt automatiska relevanta tester och gröna obligatoriska CI-kontroller på slutlig commit. Utför begränsade riktade manuella tester när en ny funktion eller datarisk motiverar det; inga påhittade testresultat.
- Skjut aldrig upp blockerande säkerhetsbrister, dataförlust, kontoöverskrivning eller trasig kärnfunktion till slutfasen. Åtgärda sådant innan fasen mergas.
- En fas = en PR, inklusive dokumentationsändringar för fasen. Undvik separata PR:er enbart för testpolicy.

## Projektets principer
- Android först (Expo/React Native); professionellt, lugnt svenskt gränssnitt, liten scrollmängd, stora textstorlekar och god tillgänglighet.
- Stöd både rökminskning och fullständigt rökstopp. Ingen skuldbeläggning, inga påhittade hälsolöften; evidensbaserat stöd och tydlig skillnad mellan mål och verklig konsumtion.
- Gästläge med tydlig varning för dataförlust vid enhetsbyte; frivilligt konto med Firebase Authentication och Firestore-synk. Ingen manuell JSON-säkerhetskopiering/återställning.
- Bevara historik när plan ändras. Säkerställ korrekt användaridentitet, bakåtkompatibla profiler, säker molnsynk och skydd mot konflikter.
- Prioritera gratis/låga driftskostnader, minimera onödiga tjänster och håll AI-funktioner frivilliga tills kostnad och integritet utretts.
- Vid varje commit: följ `AI_WORKFLOW.md`, kontrollera CI och rapportera om ny Android-build behövs.

## Policy för Firestore-regler och snabb CI
- Samla **alla icke-nödvändiga ändringar** av `firestore.rules` och tillhörande regeltester i en gemensam **avslutande säkerhetsfas före Google Play-lansering**, efter funktionsfaserna. För in varje identifierat behov i fasplanen utan att ändra reglerna i vanliga funktions-PR:er.
- **Undantag:** Om en aktuell fas kräver ändrade regler för att funktionen ska fungera korrekt och säkert, gör en **separat, avgränsad PR mot `main`** med regler och tester. Verifiera Firestore-CI och merga den innan den beroende funktionen godkänns.
- Behåll säkerhetstester och ändringsdetektion. Skjut aldrig upp en regeländring som krävs för åtkomstkontroll, integritet eller säker dataseparering bara för att spara CI-tid.
- **Fas 17, slutlig regelgranskning före release:** samla uppskjutna regelbehov, granska läs-/skrivrättigheter och kontoägarskap, testa med emulator (även nekade anrop), verifiera synk och kontoradering och merga den separata säkerhets-PR:en före publicering. Denna policy gäller även efter fas 8.

## Statusöversikt

| Fas | Namn | Status | PR / referens |
| --- | --- | --- | --- |
| 7.0 | Intern Android-beta, kvalitet och förberedelser | Klar, mergad | #138 |
| 8.0 | Personal Quit Plan 2.0 | Mergad; bred manuell regression flyttad till slutfas | #140 |
| 9.0 | SOS och röksug 2.0 | Mergad; bred manuell QA i fas 17 | #149 |
| 10.0 | Statistik och beteendeinsikter | Mergad; bred manuell QA i fas 17 | #150 |
| 11.0 | Motivation, milstolpar, ekonomi och hälsa | Mergad; bred manuell QA i fas 17 | #151 |
| 12.0 | Återfallsprevention och långsiktigt stöd | Mergad; bred manuell QA i fas 17 | #152 |
| 13.0 | Kunskapsbank och svenskt stöd | Mergad; bred manuell QA i fas 17 | #153 |
| 14.0 | Smart coach och personligt stöd | Mergad; manuell QA i fas 17 | #154 |
| 15.0 | Frivilligt socialt stöd | Mergad; manuell Android-QA i fas 17 | #155 |
| 16.0 | Slutpolering, prestanda, tillgänglighet och språk | Mergad; Android-verifiering återstår i fas 17 | #156 |
| 16.1 | Android-hemskärmswidgets | Planerad | — |
| 16.2 | Google-inloggning med Firebase | Planerad | — |
| 16.3 | Android-tillbakaknapp och navigations-UX | Planerad | — |
| 16.4 | Helhetsgranskning av UI, Safe Area och Android-enheter | Planerad | — |
| 16.5 | Personlig dashboard och anpassningsbar startsida | Planerad | — |
| 16.6 | Flexiblare planering och långsiktig målanpassning | Planerad | — |
| 16.7 | Fördjupad statistik och personliga trender | Planerad | — |
| 17.0 | Delningsbild som matchar dagens framsteg | Planerad | — |
| 18.0 | Personlig rökstoppsresa och rätt stöd i rätt fas | Planerad | — |
| 19.0 | Röksug i stunden och personliga handlingsplaner | Planerad | — |
| 20.0 | Långsiktigt rökfri och återfallsprevention | Planerad | — |
| 21.0 | Evidensbaserat stöd, nikotinläkemedel och vårdvägar | Planerad | — |
| 22.0 | Varsamma påminnelser och tillgänglig motivation | Planerad | — |
| 23.0 | Förenklad startsida och tydlig informationshierarki | Planerad | — |
| 24.0 | Lättbegriplig onboarding och vägledd användning | Planerad | — |
| 25.0 | Slutlig Android-QA, säkerhet och Google Play-lansering | Planerad | — |
| 26.0 | Uppföljning och förbättringar efter lansering | Planerad | — |


**Statuskorrigering 2026-11-05:** Fas 16.0 mergades i PR #156 (squash-commit `593d6c2`). Äldre inventerings- och checklistesektioner längre ned är historiska ögonblicksbilder, inte aktuell fasstatus. Androids PNG-export/systemdelning, Safe Area på olika enheter och bred manuell regression är inte enhetsverifierade och ingår i fas 25. En särskild visuell korrigering av delningskortet planeras i fas 17.

Tidigare arbete och detaljer finns i git-historiken, PR #138 och projektets övriga dokument. Fas 7.0 var **intern beta**, inte offentlig Play Store-lansering.

## Fas 8.0 – Personal Quit Plan 2.0 (MERGAD, PR #140)

**Mål:** En personlig, begriplig och ändringsbar rökstoppsplan utan förlorad historik.

**Fast huvudchecklista – exakt åtta huvudpunkter, fyra delpunkter per huvudpunkt (32 totalt):**

Status nedan är en konservativ arbetsbedömning utifrån implementerad funktionalitet. `[x]` betyder verifierat färdig delpunkt, `[ ]` betyder återstår att verifiera eller färdigställa. Behåll samma ID och antal under fasen. När CI är väntande räknas nya ändringar inte som verifierade. Rapportera både huvudpunkter och delpunkter i varje chattuppdatering.

1. [x] **Inventering och kompatibilitet (4/4)**
   - [x] 1.1 Inventera planmodell och sparade profilfält.
   - [x] 1.2 Inventera befintliga skärmar och planflöden.
   - [x] 1.3 Inventera befintliga tester och molnsynk.
   - [x] 1.4 Dokumentera risker och kompatibilitetskontrakt i `docs/PHASE_8_TECHNICAL_AUDIT.md`.
2. [x] **Tre vägar till rökstopp (4/4)**
   - [x] 2.1 Sluta direkt med nollmål.
   - [x] 2.2 Gradvis nedtrappning med valbar takt.
   - [x] 2.3 Nedtrappning mot valt stoppdatum.
   - [x] 2.4 Validera och spara metodval i onboarding/profil.
3. [x] **Personliga mål och progression (4/4)**
   - [x] 3.1 Utgå från användarens individuella dagsmål.
   - [x] 3.2 Beräkna framtida mål och delmål per kalenderdag.
   - [x] 3.3 Bevara historik och ursprunglig start vid planändring.
   - [x] 3.4 Testa mållogik för stoppdatum, nedtrappning och återstart.
4. [x] **Planöversikt och enkla justeringar (4/4)**
   - [x] 4.1 Visa dagens mål, nästa delmål och veckosammanfattning.
   - [x] 4.2 Erbjud ändring av takt och stoppdatum med bekräftelse.
   - [x] 4.3 Verifiera sju dagars förhandsvisning för båda ändringstyperna med grönt TypeScript-CI.
   - [x] 4.4 Visa tre närmaste dagar som standard med expanderbara 14 dagar; konsekvent förhandsvisning och avbryt för planjusteringar (kod implementerad, slutlig Android-verifiering i 7.4/8.1).
5. [x] **Missade mål, omplanering och omstart (4/4)**
   - [x] 5.1 Visa icke-skuldbeläggande stöd vid missat mål.
   - [x] 5.2 Erbjud omstart med bibehållen registreringshistorik.
   - [x] 5.3 Verifiera ändrat stoppdatum, passerat datum, eget dagsmål och strikt datumval med automatiska domäntester (slutlig Android-acceptans återstår).
   - [x] 5.4 Testa upprepade datumändringar och omstart med bibehållna registreringar, röksug, avstämningar och besparingsstart.
6. [x] **Migration, offline, gäst och kontosynk (4/4)**
   - [x] 6.1 Behåll bakåtkompatibla valfria profilfält.
   - [x] 6.2 Automatiska sessionstester verifierar lokalt sparade gästplaner utan nätverk, bevarad historik och isolering från inloggade konton (manuellt Android-test återstår i 8.2).
   - [x] 6.3 Automatiska tester verifierar konfliktförhandsvisning, observerad planversion och transaktionskontroll mot konkurrerande ändringar (verifiering på två riktiga enheter återstår i 8.2).
   - [x] 6.4 Automatiska sessionstester verifierar utloggning till gäst, kontobyten, köade skrivningar och fel vid kontoladdning utan att annan användares plan skrivs över (Android-acceptans återstår i 8.2).
7. [ ] **Tester och tillgänglighet (2/4)**
   - [x] 7.1 Lägg till automatiska domäntester för planberäkningar.
   - [x] 7.2 Regressionstester täcker omplanering med additiv historik och konflikter i både plan och registreringar, utan tysta överskrivningar (CI-verifiering krävs).
   - [ ] 7.3 Verifiera TalkBack, etiketter och tryckytor.
   - [ ] 7.4 Verifiera små skärmar och maximal systemtextstorlek på Android.
8. [ ] **Acceptans, CI och merge (1/4)**
   - [x] 8.1 Genomför funktionellt acceptanstest av alla tre metoderna (bekräftat på Android: metodbyte, sparande och korrekt mål efter omstart).
   - [ ] 8.2 Genomför regressionstest av historik, gästläge och molnsynk.
   - [ ] 8.3 Verifiera gröna obligatoriska CI-kontroller på slutlig commit.
   - [ ] 8.4 Squash-merga PR #140 till `main` efter godkänd acceptans.

**Framsteg vid införandet:** 6/8 huvudpunkter (75 %); 26/32 delpunkter (81,25 %). Delpunktsstatus är en initial bedömning och ska justeras efter verifiering, aldrig automatiskt vid commit.

**Tekniska nyckelkrav:** Valfritt `plannedQuitAt` får inte förväxlas med `startAt`/`originalStartAt`. Lokala kalenderdagar ska fungera över sommartid. Ändringar får inte skriva om cigaretter, röksug eller avstämningar. Firestore-profiluppdateringar kräver uttrycklig konflikt-/revisionshantering: nuvarande additiva synk uppdaterar inte befintlig fjärrprofil. Läs `docs/PHASE_8_TECHNICAL_AUDIT.md`.

**Acceptans:** Nya och befintliga användare kan förstå och justera sin plan; historik bevaras; gäst- och kontoläge fungerar; CI och relevanta Android-tester är verifierade.

## Fas 9.0 – SOS och röksug 2.0
- Utveckla SOS-knappen och den befintliga andningsövningen (4 sek in, 2 håll, 6 ut; haptik, utan röstljud).
- Erbjud flera korta, konkreta strategier för akuta röksug och möjligheten att välja det som fungerar bäst.
- Registrera intensitet, situation/trigger och resultat utan att göra stödet tungrott.
- Visa användarens egna återkommande triggers och fungerande strategier med respekt för integritet.
- Testa offline, tillgänglighet och avbrott mitt i en övning.

## Fas 10.0 – Statistik och beteendeinsikter
- Visa tydliga trender över cigaretter, rökfria dagar, planmål, röksug och framsteg.
- Skilj mellan registrerade fakta, uppskattningar och dagar utan uppgifter.
- Visa mönster över tid och möjlig koppling mellan triggers, tidpunkter och konsumtion.
- Gör diagram lättlästa på små skärmar och med skärmläsare.
- Säkerställ att statistik inte förvanskas när användaren ändrar sin plan.

## Fas 11.0 – Motivation, milstolpar, besparingar och hälsa
- Personliga milstolpar, uppmuntran och långsiktig överblick utan skuldbeläggning.
- Besparingar baserade på användarens egna paketpris, storlek och registrerade konsumtion.
- Tydlig skillnad mellan beräknade och faktiska besparingar.
- Hälsotidslinje med försiktigt formulerade, källbelagda generella hälsoeffekter; inga individuella medicinska garantier.
- Möjlighet att anpassa motiverande innehåll utan att skapa notisöverflöd.

## Fas 12.0 – Återfallsprevention och långsiktigt stöd
- Hjälp för svåra dagar och återfall utan att historik eller tidigare framsteg raderas.
- Möjlighet att återuppta, omplanera eller starta en ny period med bibehållen tidigare historik.
- Personliga strategier för högrisklägen och långsiktig uppföljning efter stoppdatum.
- Valbara, respektfulla påminnelser och möjlighet att stänga av dem.
- Testa att användaren aldrig tvingas börja om efter en enskild cigarett.

## Fas 13.0 – Kunskapsbank och svenskt stöd
- Kort, begripligt och evidensbaserat material om nikotinberoende, abstinens, vanor och återhämtning.
- Tydliga svenska hänvisningar till relevanta vård- och stödresurser; kontrollera att kontaktuppgifter och länkar är aktuella.
- Ange källor, uppdateringsdatum och medicinska begränsningar.
- Gör innehållet sökbart och tillgängligt även för användare som inte har konto.

## Fas 14.0 – Smart coach
- Börja med en transparent, regelbaserad coach som utgår från användarens mål, registreringar och val.
- Ge praktiska, personliga förslag utan att utge sig för att vara vårdpersonal.
- Utred eventuell AI-integration separat: frivilligt deltagande, kostnadstak, dataminimering, samtycke och säkerhet.
- Ingen extern betald AI-tjänst får bli ett krav för appens grundfunktioner.

## Fas 15.0 – Frivilligt socialt stöd (villkorad)
- Utvärdera om stödperson, frivillig delning eller community verkligen förbättrar användarupplevelsen.
- Inför inte öppna sociala funktioner utan tydliga planer för moderering, anmälningar, säkerhet och integritet.
- Användaren ska kunna nyttja hela kärnappen utan community.
- Fasens omfattning får minskas eller skjutas upp om modereringskostnad eller risk blir för hög; dokumentera beslutet.

## Fas 16.0 – Slutpolering, prestanda, tillgänglighet och språk
- Sammanhållen professionell design för alla skärmar, konsekventa modaler och komponenter.
- Minimal onödig scroll, korrekt safe area, olika Android-skärmstorlekar och maximala systemtextstorlekar.
- Skärmläsarstöd, kontrast, tryckytor, tydliga felmeddelanden och robust navigering.
- Prestanda, uppstart, offlinehantering, stabilitet och regressionskontroller.
- Förbered språkstöd och utöka språk först när svensk grundupplevelse är kvalitetssäkrad.

## Fas 16.3 – Android-tillbakaknapp och navigations-UX
**Mål:** Förutsägbar Android-navigering utan att appen stängs av misstag, med sammanhållen UI-polering.
- Androids systemknapp/gest för Tillbaka ska gå tillbaka i appens faktiska navigationshistorik, inte stänga appen när det finns en föregående vy.
- Öppna modaler, formulär, datumväljare och SOS-övningar ska stängas eller avbrytas säkert före sidbyte; osparade ändringar ska hanteras begripligt.
- På startsidan, när ingen modal eller annan intern vy är öppen, ska Tillbaka visa en tillgänglig bekräftelsedialog med **Avbryt** och **Avsluta appen**; avsluta bara efter uttrycklig bekräftelse.
- Säkerställ korrekt samspel med Androids gestnavigering, hårdvaruknapp, Expo Router/navigationsstack och återupptagning efter bakgrundsläge. Undvik dubbelregistreringar och oavsiktligt tappad formulärdata.
- Samla mindre UI/UX-fixar som konsekventa knappar, tillbakaindikatorer, modaler, tryckytor, safe area, små skärmar och stora textstorlekar. Behåll större visuell helhetsöversyn i fas 16.0.
- Testa på fysisk Android-enhet med flera skärmstorlekar och TalkBack. Bedöm behovet av ny native-build när implementationen är klar.
**Acceptans:** Tillbaka navigerar ett steg bakåt eller stänger översta modalen; från startsidan visas avslutsfrågan; Avbryt behåller appen öppen; inga oavsiktliga avslut eller förlorade registreringar.

## Fas 16.1 – Android-hemskärmswidgets
**Mål:** Användbara och snygga widgets på Android-hemskärmen utan att behöva öppna appen.
- Utred lämplig native/Expo-kompatibel widgetlösning, underhåll, Android-versioner och behov av ny utvecklings-/releasebuild innan implementation.
- Skapa minst en kompakt widget med dagens mål, registrerat antal och begriplig progressindikator; erbjud vid behov en större variant med kommande delmål, rökfri tid eller besparingar.
- Utred säkra snabbåtgärder för att registrera en cigarett eller öppna SOS; undvik oavsiktliga dubbelregistreringar och se till att gästläge fungerar.
- Håll widgeten uppdaterad vid lokala registreringar, omstart, datumbyte och rimliga bakgrundsuppdateringar utan onödig batteriförbrukning.
- Skydda känsliga uppgifter på hemskärmen; låt användaren välja vad som visas och hantera saknad data, utloggning och kontobyte.
- Testa storleksändring, ljus/mörkt tema där relevant, olika Android-versioner, tillgänglighet och verklig enhet.
**Acceptans:** Widgets kan läggas till och tas bort via Android, visar korrekta mål och registreringar, fungerar säkert utan nätverk och påverkar inte appens historik.

## Fas 16.2 – Google-inloggning med Firebase
**Mål:** Erbjud "Fortsätt med Google" som frivilligt alternativ till befintlig e-post/lösenord och gästläge.
- Kontrollera befintlig Firebase Authentication-implementation, appens Android package ID, SHA-1/SHA-256, OAuth-konfiguration och kompatibilitet med Expo/native-build innan kodändring.
- Aktivera Google som provider i Firebase och implementera Android Google Sign-In med tydliga avbrotts- och felmeddelanden.
- Hantera kontolänkning: användare med befintligt e-postkonto ska inte av misstag få ett separat konto eller förlora historik; kräv säker identitetsverifiering vid länkning.
- Säkerställ samma säkra Firestore-synk, behörigheter, utloggning, kontobyte och kontoradering som för övriga inloggningsmetoder.
- Behåll e-post/lösenord och gästläge som fullt fungerande alternativ; Google-inloggning får inte krävas.
- Testa på riktig Android-enhet, inklusive ny användare, återkommande användare, avbrutet flöde, saknade Google Play-tjänster, offline och felaktig konfiguration.
**Acceptans:** Google-inloggning fungerar på Android utan dubbla konton eller dataförlust, och övriga inloggningssätt fortsätter fungera.

## Fas 16.4 – Helhetsgranskning av UI, Safe Area och Android-enheter
**Mål:** Hela appen ska vara användbar och visuellt sammanhållen på olika Android-telefoner, oavsett skärmstorlek, systemfält, tangentbord och tillgänglighetsinställningar.
- Inventera **samtliga skärmar, flikar, onboardingsteg, modaler, formulär, dialogs, bottennavigering, diagram och delningsförhandsvisningar** i en fast testmatris innan kodändringar.
- Använd konsekvent Safe Area-hantering (t.ex. `react-native-safe-area-context`) för statusfält, kamerahål/notch, skärmkanter, Androids gestfält och treknappsnavigering. Undvik dubbel padding och innehåll bakom systemfält.
- Verifiera tangentbordets öppning/stängning, fokus, scroll till aktiva fält, datumväljare och modaler utan att primära knappar döljs.
- Säkerställ att små och smala skärmar, större telefoner, olika bildförhållanden, rotering där appen stöder det, maximal systemtext och display scaling inte klipper text, siffror, knappar eller kort.
- Granska minst 48 dp tryckytor, kontrast, TalkBack-ordning/etiketter, felmeddelanden, laddningslägen och konsekventa tomlägen. Undvik oavsiktlig horisontell scroll och onödig vertikal scroll.
- Samordna med fas 16.3: Androids Tillbaka-gest, systemnavigering och stängning av modaler ska fungera ihop med Safe Area utan dubbla hanterare.
- Lägg till riktade automatiska tester där möjligt. Dokumentera skärmmatris och kvarstående enhetstester; utför slutlig fysisk Android-/BrowserStack-verifiering i fas 25.
**Avgränsning:** Detta är en **samlad granskning med tydlig slutpunkt**, inte en öppen serie kosmetiska småändringar. Endast blockerande problem eller avvikelser från den fastställda matrisen får utöka omfattningen. En PR för fasen, samlade ändringar och tester.
**Acceptans:** Alla inventerade vyer har granskats och kända Safe Area-/tangentbords-/klippningsproblem åtgärdats eller dokumenterats för slutlig Android-QA. Inga genomförda manuella tester påstås utan faktiskt resultat.

## Fas 16.5 – Personlig dashboard och anpassningsbar startsida
**Mål:** Visa relevant framsteg utan överbelastning.
- Låt användaren välja och ordna ett begränsat antal startsideskort, t.ex. dagens mål, röksug, rökfri tid, besparingar och kommande delmål.
- Erbjud användbara standardval, återställning till standard och enkel hantering av saknade värden.
- Spara val lokalt och synka bara om det passar befintlig profilmodell och integritetspolicy; undvik nya externa tjänster.
- Behåll tillgänglighet, god prestanda och minimal scroll även med maximal textstorlek.
**Acceptans:** Kort kan väljas och ordnas, sparas korrekt, och återställas utan att påverka historik eller plan.

## Fas 16.6 – Flexiblare planering och långsiktig målanpassning
**Mål:** Ge fler tydliga sätt att justera en plan utan att tidigare framsteg försvinner.
- Granska befintliga lägen för gradvis minskning, direktstopp och eget datum; undvik att duplicera redan färdiga funktioner.
- Förbättra förhandsvisning av måländringar och förklara hur takt, slutdatum och dagens riktvärde påverkas.
- Ge användaren val att behålla ett eget slutdatum eller låta planen räkna om datumet vid ändrade förutsättningar.
- Bevara registreringar, historik och säkra synk-/konfliktregler vid varje ändring.
**Acceptans:** Ändringar är begripliga, reversibla där möjligt och testade mot historik, datumgränser och synk.

## Fas 16.7 – Fördjupad statistik och personliga trender
**Mål:** Ge mer långsiktig överblick utan missvisande jämförelser.
- Utöka med jämförelser vecka mot vecka och månad mot månad, personliga rekord och relevanta trender för konsumtion, röksug och mål.
- Skilj på dagar utan registrering, uppskattade värden och verifierade registreringar; visa inga falska rökfria sviter.
- Anpassa diagram till små skärmar, stora texter, TalkBack och användarens valda dashboardkort.
- Håll beräkningarna lokala och effektiva, med automatiska regressionstester för planändringar och datumgränser.
**Acceptans:** Trender är begripliga och korrekta även vid saknade data och ändrade planer.

## Fas 17.0 – Delningsbild som matchar dagens framsteg
**Mål:** PNG-delningen ska återge samma visuella information och utseende som kortet ”Dagens framsteg” på startsidan, inte en separat grafisk tolkning.
- Använd samma framstegsberäkning, ordval, färgpalett, typografi, kortlayout och ringindikator som startsidan; håll en gemensam presentationsmodell så vyerna inte glider isär.
- Visa antal **kvar av dagsmål** som huvudvärde, förbrukad procent i en mindre ring och samma situationsanpassade stödtext. Nollmål, övertrasserat mål och stora värden ska hanteras begripligt.
- Exportera endast den avsedda kortytan som PNG utan appens systemfält, navigering, profilnamn, konto- eller historikuppgifter.
- Behåll uttrycklig förhandsvisning och användarinitierad delning; inga automatiska uppladdningar. Testa avbrott, upprepade tryck och uppdaterade registreringar medan förhandsvisningen är öppen.
- Lägg till automatiska regressionstester för gemensam presentationsmodell, känslig data, bildexport och tillståndsbyte; slutligt verkligt Android-delningstest sker i fas 25.
**Acceptans:** Förhandsvisning och PNG har samma utseende som startsidans framstegskort, med identiska värden för samma dagsdata. Ingen privat data läcker och ingen delning sker utan godkännande.

## Fas 18.0 – Personlig rökstoppsresa och rätt stöd i rätt fas
**Mål:** Stödet anpassas efter förberedelse, nedtrappning, stoppdag, tidig rökfrihet och långsiktigt underhåll utan att appen påstår sig veta mer än användaren registrerat.
- Definiera tydliga frivilliga faser utan att skriva över befintliga planer.
- Visa nästa konkreta steg, kort daglig avstämning och begriplig väg framåt.
- Låt användaren byta fas eller plan utan att förlora historik.
- Anpassa coach, startskärm och SOS efter användarens val och faktiska registreringar.
**Acceptans:** Funktionen är frivillig, fungerar offline där möjligt, bevarar historik och har automatiska tester samt tillgängliga svenska texter.

## Fas 19.0 – Röksug i stunden och personliga handlingsplaner
**Mål:** Gör SOS mer praktiskt och situationsanpassat, inte beroende av betald AI.
- Skapa valbara korta handlingsplaner för personliga triggers och riskstunder.
- Låt användaren spara vad som hjälpte och återanvända fungerande strategier.
- Erbjud ett diskret, lättillgängligt SOS-flöde som fungerar helt offline.
- Ge möjlighet att följa upp röksug utan krav på att registrera varje händelse.
**Acceptans:** Funktionen är frivillig, fungerar offline där möjligt, bevarar historik och har automatiska tester samt tillgängliga svenska texter.

## Fas 20.0 – Långsiktigt rökfri och återfallsprevention
**Mål:** Appen förblir användbar även när användaren inte längre röker.
- Skapa ett underhållsläge som fokuserar på rökfrihet i stället för cigarettbudget.
- Erbjud stöd vid enstaka cigaretter utan skuldbeläggning eller automatisk nollställning.
- Skapa frivilliga planer för risksituationer och långsiktig uppföljning.
- Låt användaren välja lägre notisfrekvens och behålla framsteg och historik.
**Acceptans:** Funktionen är frivillig, fungerar offline där möjligt, bevarar historik och har automatiska tester samt tillgängliga svenska texter.

## Fas 21.0 – Evidensbaserat stöd, nikotinläkemedel och vårdvägar
**Mål:** Gör det lättare att hitta välgrundade stödmetoder och professionell hjälp utan individuella medicinska löften.
- Granska och källbelägg innehåll mot aktuella svenska vård- och folkhälsokällor.
- Förklara generella alternativ som nikotinläkemedel och beteendestöd utan personlig doseringsrådgivning.
- Ge tydliga hänvisningar till svensk vård och stödlinjer, med verifierade länkar.
- Visa källor, uppdateringsdatum och när användaren bör kontakta vårdpersonal.
**Acceptans:** Funktionen är frivillig, fungerar offline där möjligt, bevarar historik och har automatiska tester samt tillgängliga svenska texter.

## Fas 22.0 – Varsamma påminnelser och tillgänglig motivation
**Mål:** Hjälp användaren att hålla fast vid sin plan utan stress eller notisöverflöd.
- Låt användaren välja vilka stödjande påminnelser som ska skickas och när.
- Erbjud frivilliga påminnelser inför egna identifierade risksituationer.
- Respektera tysta tider, avstängda notiser och användarens integritet.
- Verifiera att innehåll inte skuldbelägger, misstolkar saknade registreringar eller uppmuntrar övervakning.
**Acceptans:** Funktionen är frivillig, fungerar offline där möjligt, bevarar historik och har automatiska tester samt tillgängliga svenska texter.

## Fas 23.0 – Förenklad startsida och tydlig informationshierarki
**Mål:** En ny användare ska på några sekunder förstå dagens läge, kunna registrera och hitta SOS utan att överväldigas.
- Gör dagens framsteg till den enda dominerande informationsytan på startsidan; behåll en tydlig primär registreringsåtgärd och lättåtkomlig SOS.
- Minska duplicerade navigationskort när samma destination redan finns i bottennavigeringen. Flytta detaljerad statistik, längre coachtexter, historik och fördjupade kort till respektive vy eller valbar fördjupning.
- Behåll personlig motivation kort, relevant och frivilligt expanderbar. Visa inte långa stödtexter eller flera konkurrerande uppmaningar samtidigt.
- Hantera nollmål, överskridna mål, helt ny användare, tom historik och rökfri fas utan missvisande siffror eller skuldbeläggande budskap.
- Ge startsidan en tydlig visuell hierarki, rimlig skrollängd och konsekventa knappar. Samordna med den valbara dashboarden i fas 16.5 utan att duplicera implementation.
**Acceptans:** En ny användare kan identifiera dagens läge, registrera och öppna SOS utan instruktion; övrig information nås enkelt utan att fylla första skärmen.

## Fas 24.0 – Lättbegriplig onboarding och vägledd användning
**Mål:** Minska kognitiv belastning vid första starten och låta användaren komma igång med minsta nödvändiga information.
- Inventera befintlig onboarding och ta bort onödiga beslut, repetitiva förklaringar och långa texter utan att förlora väsentliga samtycken eller planval.
- Använd tydliga standardval och visa avancerade inställningar först när de behövs; förklara gradvis minskning, direktstopp och eget datum i vardagsspråk.
- Behåll gästläge och frivillig inloggning, med tydlig men kortfattad information om synk och risk för dataförlust.
- Lägg till diskreta, frivilliga förstagångstips för registrering, SOS, plan och statistik; de ska kunna stängas och inte återkomma störande.
- Kontrollera framåt-/bakåtnavigering, bevarande av inmatning, stora texter, TalkBack, tangentbord och Safe Area.
**Acceptans:** En förstagångsanvändare kan slutföra onboarding och göra sin första registrering utan att behöva förstå alla appens funktioner. Ingen kontoregistrering krävs.

## Fas 25.0 – Slutlig QA, säkerhet, integritet och Google Play-lansering
- Genomför uppskjutna manuella tester från tidigare faser, inklusive `docs/PHASE_8_ANDROID_ACCEPTANCE.md` (7.4, 8.1, 8.1a, 8.2), på riktiga Android-enheter och BrowserStack. Dokumentera PASS/FAIL, enhet, Android-version och testad commit.
- Verifiera full regression: onboarding, planer, SOS, historik, offline, gästläge, kontobyten, tvåenhetssynk och konflikter, notiser, tillgänglighet, TalkBack, stor text och små skärmar.
- Säkerställ gröna CI, native releasebygge och blockeringsfri slutacceptans innan publicering.
- Säker kontohantering, verifierad radering av konto och tillhörande data samt tydliga användarflöden.
- Granska Firebase-regler, serverfunktioner, datalagring, behörigheter och loggning.
- Färdigställ integritetspolicy, Google Play Data safety, butikstexter, skärmbilder och supportkontakt.
- Bygg och testa signerad release; verifiera riktiga Android-enheter, notifieringar och inloggning.
- Säkerställ aktuell Google Play-policy och obligatoriska kontroller före offentlig lansering.
- Plan för uppföljning, buggrapportering och underhåll efter publicering.

## Fas 26.0 – Uppföljning och förbättringar efter lansering
- Etablera kostnadsmedveten hantering av buggrapporter, krascher och supportärenden utan onödig insamling av personuppgifter.
- Prioritera korrigeringar efter faktisk användarfeedback och Android-/Play-policyändringar; håll regressionstester och beroenden uppdaterade.
- Utvärdera frivilliga förbättringar av widgets, statistik, dashboard och språkstöd först efter stabil lansering.
- Varje ny större funktion får en avgränsad fas, fast checklista och egen PR enligt `AI_WORKFLOW.md`.

## Fasta checklistor för kommande faser

### Fas 16.1 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Inventering (0/4)**
   - [ ] 1.1 Verifiera Expo-/Android-kompatibel widgetlösning.
   - [ ] 1.2 Kartlägg datakällor och offlinekrav.
   - [ ] 1.3 Fastställ privacy-by-default för hemskärmen.
   - [ ] 1.4 Dokumentera native-build och testmatris.
2. [ ] **Widgetvyer (0/4)**
   - [ ] 2.1 Skapa kompakt dagens-mål-widget.
   - [ ] 2.2 Skapa större variant med valda värden.
   - [ ] 2.3 Hantera tomma värden och nollmål.
   - [ ] 2.4 Anpassa storlekar och tema.
3. [ ] **Datauppdatering (0/4)**
   - [ ] 3.1 Uppdatera efter registrering.
   - [ ] 3.2 Uppdatera vid datumbyte.
   - [ ] 3.3 Hantera omstart och bakgrund.
   - [ ] 3.4 Begränsa batteriförbrukning.
4. [ ] **Snabbåtgärder (0/4)**
   - [ ] 4.1 Öppna rätt vy från widget.
   - [ ] 4.2 Skydda mot dubbelregistrering.
   - [ ] 4.3 Hantera gästläge säkert.
   - [ ] 4.4 Verifiera navigationsvägar.
5. [ ] **Integritet (0/4)**
   - [ ] 5.1 Låt användaren välja synlig information.
   - [ ] 5.2 Hantera utloggning och kontobyte.
   - [ ] 5.3 Undvik personuppgifter som standard.
   - [ ] 5.4 Verifiera lokal dataseparering.
6. [ ] **Tillgänglighet (0/4)**
   - [ ] 6.1 Granska textskalning.
   - [ ] 6.2 Granska kontrast och tryckytor.
   - [ ] 6.3 Hantera olika widgetstorlekar.
   - [ ] 6.4 Dokumentera enhetstestfall.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa målberäkning.
   - [ ] 7.2 Testa uppdateringssignaler.
   - [ ] 7.3 Testa offline och kontobyte.
   - [ ] 7.4 Verifiera native-build och CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera implementation.
   - [ ] 8.2 Samla kvarvarande enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 16.2 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Inventering (0/4)**
   - [ ] 1.1 Kartlägg Firebase Authentication.
   - [ ] 1.2 Kontrollera package ID och SHA-certifikat.
   - [ ] 1.3 Dokumentera OAuth-beroenden.
   - [ ] 1.4 Identifiera risker för befintliga konton.
2. [ ] **Konfiguration (0/4)**
   - [ ] 2.1 Aktivera Google-provider.
   - [ ] 2.2 Konfigurera Android-inloggning.
   - [ ] 2.3 Skydda konfigurationsvärden.
   - [ ] 2.4 Verifiera native-beroenden.
3. [ ] **Inloggningsflöde (0/4)**
   - [ ] 3.1 Lägg till Google-val.
   - [ ] 3.2 Hantera avbruten inloggning.
   - [ ] 3.3 Visa begripliga svenska fel.
   - [ ] 3.4 Hantera saknade Play-tjänster.
4. [ ] **Kontolänkning (0/4)**
   - [ ] 4.1 Identifiera befintligt e-postkonto.
   - [ ] 4.2 Kräv säker identitetsverifiering.
   - [ ] 4.3 Undvik dubbla användaridentiteter.
   - [ ] 4.4 Bevara befintlig historik.
5. [ ] **Datasäkerhet (0/4)**
   - [ ] 5.1 Återanvänd säker Firestore-synk.
   - [ ] 5.2 Verifiera utloggning och kontobyte.
   - [ ] 5.3 Verifiera kontoradering.
   - [ ] 5.4 Behåll gästläge oförändrat.
6. [ ] **UX och tillgänglighet (0/4)**
   - [ ] 6.1 Granska onboarding och profil.
   - [ ] 6.2 Granska laddning och felstatus.
   - [ ] 6.3 Granska TalkBack och tryckytor.
   - [ ] 6.4 Behåll e-postinloggning som alternativ.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa nya och återkommande konton.
   - [ ] 7.2 Testa avbrutna flöden.
   - [ ] 7.3 Testa offline och felkonfiguration.
   - [ ] 7.4 Verifiera CI och Android-build.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera Firebase-inställningar utan hemligheter.
   - [ ] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 16.3 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Navigationsinventering (0/4)**
   - [ ] 1.1 Kartlägg Expo Router-stack.
   - [ ] 1.2 Kartlägg flikar och interna vyer.
   - [ ] 1.3 Kartlägg modaler och datumväljare.
   - [ ] 1.4 Dokumentera navigationskontrakt.
2. [ ] **System-Tillbaka (0/4)**
   - [ ] 2.1 Navigera bakåt i historiken.
   - [ ] 2.2 Stäng översta modal först.
   - [ ] 2.3 Undvik dubbelhanterare.
   - [ ] 2.4 Hantera Android-gestnavigering.
3. [ ] **Avsluta appen (0/4)**
   - [ ] 3.1 Visa bekräftelse på startsidan.
   - [ ] 3.2 Erbjud Avbryt.
   - [ ] 3.3 Avsluta endast efter bekräftelse.
   - [ ] 3.4 Gör dialogen tillgänglig.
4. [ ] **Formulärsäkerhet (0/4)**
   - [ ] 4.1 Skydda osparade ändringar.
   - [ ] 4.2 Hantera tangentbord och fokus.
   - [ ] 4.3 Avbryt SOS säkert.
   - [ ] 4.4 Bevara registreringar.
5. [ ] **Konsekvent UX (0/4)**
   - [ ] 5.1 Enhetliga tillbakaindikatorer.
   - [ ] 5.2 Samordna navigering och Safe Area.
   - [ ] 5.3 Granska modalers stängning.
   - [ ] 5.4 Granska återupptagning efter bakgrund.
6. [ ] **Tillgänglighet (0/4)**
   - [ ] 6.1 Verifiera fokusordning.
   - [ ] 6.2 Verifiera tillgängliga etiketter.
   - [ ] 6.3 Verifiera stora textstorlekar.
   - [ ] 6.4 Dokumentera gesttester.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa historikflöden.
   - [ ] 7.2 Testa modalprioritet.
   - [ ] 7.3 Testa avslutsdialog.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera navigationsbeslut.
   - [ ] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 16.4 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Fast skärminventering (0/4)**
   - [ ] 1.1 Lista samtliga skärmar och flikar.
   - [ ] 1.2 Lista modaler och formulär.
   - [ ] 1.3 Lista onboarding och delningsvyer.
   - [ ] 1.4 Fastställ skärm- och testmatris.
2. [ ] **Safe Area (0/4)**
   - [ ] 2.1 Hantera statusfält och kamerahål.
   - [ ] 2.2 Hantera gestfält och treknappsnavigering.
   - [ ] 2.3 Undvik dubbel insets-padding.
   - [ ] 2.4 Hantera bottennavigering konsekvent.
3. [ ] **Tangentbord och formulär (0/4)**
   - [ ] 3.1 Behåll aktiva fält synliga.
   - [ ] 3.2 Undvik knappar bakom tangentbord.
   - [ ] 3.3 Hantera datumväljare och modaler.
   - [ ] 3.4 Verifiera fokus vid öppning och stängning.
4. [ ] **Responsiv layout (0/4)**
   - [ ] 4.1 Granska smala skärmar.
   - [ ] 4.2 Granska stora skärmar och bildförhållanden.
   - [ ] 4.3 Granska maximal text- och skärmskalning.
   - [ ] 4.4 Undvik klippning och horisontell scroll.
5. [ ] **Tillgänglighet (0/4)**
   - [ ] 5.1 Granska 48 dp tryckytor.
   - [ ] 5.2 Granska TalkBack-etiketter och fokus.
   - [ ] 5.3 Granska kontrast och rubriker.
   - [ ] 5.4 Granska laddning och felstatus.
6. [ ] **Visuell konsekvens (0/4)**
   - [ ] 6.1 Samordna kort och knappar.
   - [ ] 6.2 Samordna spacing och typografi.
   - [ ] 6.3 Samordna tomlägen och modaler.
   - [ ] 6.4 Begränsa onödig scroll.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Automatisera relevanta layoutkontrakt.
   - [ ] 7.2 Dokumentera Android-testmatris.
   - [ ] 7.3 Verifiera relevanta komponenttester.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Åtgärda inventerade blockerande avvikelser.
   - [ ] 8.2 Flytta fysisk enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR utan kosmetisk scope creep.

### Fas 16.5 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

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

### Fas 16.6 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Inventering (0/4)**
   - [ ] 1.1 Kartlägg befintliga tre planlägen.
   - [ ] 1.2 Kartlägg datum- och målberäkningar.
   - [ ] 1.3 Kartlägg synk och historik.
   - [ ] 1.4 Undvik dubbel implementation.
2. [ ] **Måländring (0/4)**
   - [ ] 2.1 Förhandsvisa nytt dagsmål.
   - [ ] 2.2 Förhandsvisa ny takt.
   - [ ] 2.3 Förhandsvisa stoppdatum.
   - [ ] 2.4 Förklara konsekvenser tydligt.
3. [ ] **Datumval (0/4)**
   - [ ] 3.1 Behåll valt slutdatum vid behov.
   - [ ] 3.2 Tillåt automatisk omräkning.
   - [ ] 3.3 Hantera passerade datum.
   - [ ] 3.4 Hantera lokala kalenderdagar.
4. [ ] **Historik (0/4)**
   - [ ] 4.1 Bevara cigarettregistreringar.
   - [ ] 4.2 Bevara SOS och avstämningar.
   - [ ] 4.3 Bevara ursprunglig start.
   - [ ] 4.4 Undvik tyst överskrivning.
5. [ ] **Kontosynk (0/4)**
   - [ ] 5.1 Hantera gästläge.
   - [ ] 5.2 Hantera revisionskonflikter.
   - [ ] 5.3 Hantera offlineändringar.
   - [ ] 5.4 Hantera kontobyte.
6. [ ] **UX (0/4)**
   - [ ] 6.1 Visa begriplig bekräftelse.
   - [ ] 6.2 Erbjud avbryt.
   - [ ] 6.3 Visa stödjande texter.
   - [ ] 6.4 Granska tillgänglighet.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa alla planlägen.
   - [ ] 7.2 Testa datumgränser.
   - [ ] 7.3 Testa konfliktfall.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera ändringskontrakt.
   - [ ] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 16.7 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

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

### Fas 17.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

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

### Fas 18.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Anpassa detaljer före fasstart, inte genom löpande scope creep.

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

### Fas 19.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Anpassa detaljer före fasstart, inte genom löpande scope creep.

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

### Fas 20.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Anpassa detaljer före fasstart, inte genom löpande scope creep.

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

### Fas 21.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Anpassa detaljer före fasstart, inte genom löpande scope creep.

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

### Fas 22.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Anpassa detaljer före fasstart, inte genom löpande scope creep.

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

### Fas 23.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade.

1. [ ] **Inventering och användarmål (0/4)**
   - [ ] 1.1 Kartlägg befintliga skärmar och flöden.
   - [ ] 1.2 Identifiera information som konkurrerar om uppmärksamhet.
   - [ ] 1.3 Definiera tre viktigaste förstagångsuppgifter.
   - [ ] 1.4 Fastställ acceptanskriterier och avgränsning.
2. [ ] **Informationshierarki (0/4)**
   - [ ] 2.1 Definiera tydligt huvudfokus.
   - [ ] 2.2 Flytta sekundär information till rätt vy.
   - [ ] 2.3 Ta bort duplicerade navigationsvägar.
   - [ ] 2.4 Behåll åtkomst till fördjupning.
3. [ ] **Primära användarflöden (0/4)**
   - [ ] 3.1 Gör registrering tydlig.
   - [ ] 3.2 Gör SOS lätt att hitta.
   - [ ] 3.3 Gör planval lätt att förstå.
   - [ ] 3.4 Visa nästa relevanta steg.
4. [ ] **Tillstånd och innehåll (0/4)**
   - [ ] 4.1 Hantera helt ny användare.
   - [ ] 4.2 Hantera tom historik och nollmål.
   - [ ] 4.3 Hantera svår dag utan skuldbeläggning.
   - [ ] 4.4 Använd korta begripliga svenska texter.
5. [ ] **Visuell design (0/4)**
   - [ ] 5.1 Använd konsekvent typografi.
   - [ ] 5.2 Behåll tydlig knapphierarki.
   - [ ] 5.3 Begränsa skroll och visuell täthet.
   - [ ] 5.4 Granska olika skärmstorlekar.
6. [ ] **Tillgänglighet och kontroll (0/4)**
   - [ ] 6.1 Granska TalkBack-ordning.
   - [ ] 6.2 Granska stora textstorlekar.
   - [ ] 6.3 Granska tryckytor och kontrast.
   - [ ] 6.4 Gör hjälp och tips frivilliga.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa huvudflöden och tillstånd.
   - [ ] 7.2 Testa databevarande och gästläge.
   - [ ] 7.3 Testa navigering och avbrott.
   - [ ] 7.4 Verifiera CI på aktuell commit.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera genomförd acceptans.
   - [ ] 8.2 Flytta bred fysisk enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 24.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade.

1. [ ] **Inventering och användarmål (0/4)**
   - [ ] 1.1 Kartlägg befintliga skärmar och flöden.
   - [ ] 1.2 Identifiera information som konkurrerar om uppmärksamhet.
   - [ ] 1.3 Definiera tre viktigaste förstagångsuppgifter.
   - [ ] 1.4 Fastställ acceptanskriterier och avgränsning.
2. [ ] **Informationshierarki (0/4)**
   - [ ] 2.1 Definiera tydligt huvudfokus.
   - [ ] 2.2 Flytta sekundär information till rätt vy.
   - [ ] 2.3 Ta bort duplicerade navigationsvägar.
   - [ ] 2.4 Behåll åtkomst till fördjupning.
3. [ ] **Primära användarflöden (0/4)**
   - [ ] 3.1 Gör registrering tydlig.
   - [ ] 3.2 Gör SOS lätt att hitta.
   - [ ] 3.3 Gör planval lätt att förstå.
   - [ ] 3.4 Visa nästa relevanta steg.
4. [ ] **Tillstånd och innehåll (0/4)**
   - [ ] 4.1 Hantera helt ny användare.
   - [ ] 4.2 Hantera tom historik och nollmål.
   - [ ] 4.3 Hantera svår dag utan skuldbeläggning.
   - [ ] 4.4 Använd korta begripliga svenska texter.
5. [ ] **Visuell design (0/4)**
   - [ ] 5.1 Använd konsekvent typografi.
   - [ ] 5.2 Behåll tydlig knapphierarki.
   - [ ] 5.3 Begränsa skroll och visuell täthet.
   - [ ] 5.4 Granska olika skärmstorlekar.
6. [ ] **Tillgänglighet och kontroll (0/4)**
   - [ ] 6.1 Granska TalkBack-ordning.
   - [ ] 6.2 Granska stora textstorlekar.
   - [ ] 6.3 Granska tryckytor och kontrast.
   - [ ] 6.4 Gör hjälp och tips frivilliga.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa huvudflöden och tillstånd.
   - [ ] 7.2 Testa databevarande och gästläge.
   - [ ] 7.3 Testa navigering och avbrott.
   - [ ] 7.4 Verifiera CI på aktuell commit.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera genomförd acceptans.
   - [ ] 8.2 Flytta bred fysisk enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

### Fas 25.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Testplan (0/4)**
   - [ ] 1.1 Samla uppskjutna testfall från faser 8–17.
   - [ ] 1.2 Fastställ enhetsmatris.
   - [ ] 1.3 Dokumentera PASS/FAIL och testad commit.
   - [ ] 1.4 Prioritera blockerande fel.
2. [ ] **Android-regression (0/4)**
   - [ ] 2.1 Testa onboarding och planer.
   - [ ] 2.2 Testa SOS, historik och statistik.
   - [ ] 2.3 Testa PNG-delning och widgets.
   - [ ] 2.4 Testa Google-inloggning och notiser.
3. [ ] **Enheter och tillgänglighet (0/4)**
   - [ ] 3.1 Testa Safe Area och systemfält.
   - [ ] 3.2 Testa små/stora skärmar och text.
   - [ ] 3.3 Testa TalkBack och tangentbord.
   - [ ] 3.4 Testa navigering och avslutsdialog.
4. [ ] **Synk och integritet (0/4)**
   - [ ] 4.1 Testa offline och gästläge.
   - [ ] 4.2 Testa tvåenhetssynk och konflikter.
   - [ ] 4.3 Testa kontobyten.
   - [ ] 4.4 Testa kontoradering.
5. [ ] **Säkerhet (0/4)**
   - [ ] 5.1 Granska Firestore-regler.
   - [ ] 5.2 Verifiera negativa behörighetstester.
   - [ ] 5.3 Granska datalagring och loggar.
   - [ ] 5.4 Åtgärda blockerande säkerhetsfel.
6. [ ] **Play Store (0/4)**
   - [ ] 6.1 Färdigställ integritetspolicy.
   - [ ] 6.2 Färdigställ Data safety.
   - [ ] 6.3 Färdigställ butikstexter och skärmbilder.
   - [ ] 6.4 Verifiera aktuell Play-policy.
7. [ ] **Release (0/4)**
   - [ ] 7.1 Bygg signerad release.
   - [ ] 7.2 Verifiera release på Android.
   - [ ] 7.3 Verifiera alla obligatoriska CI.
   - [ ] 7.4 Säkerställ support och återställningsplan.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera slutacceptans.
   - [ ] 8.2 Åtgärda blockerande regressioner.
   - [ ] 8.3 Verifiera godkända releasegrindar.
   - [ ] 8.4 Publicera först efter uttryckligt lanseringsbeslut.

### Fas 26.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Planerad, 0/8 huvudpunkter och 0/32 delpunkter verifierade. Checklista fryses vid fasstart; nya idéer läggs i backlog i stället för att förlänga en aktiv fas.

1. [ ] **Driftinventering (0/4)**
   - [ ] 1.1 Samla feedbackkanaler.
   - [ ] 1.2 Fastställ supportansvar.
   - [ ] 1.3 Fastställ kostnadsgränser.
   - [ ] 1.4 Fastställ integritetspolicy för felrapporter.
2. [ ] **Stabilitet (0/4)**
   - [ ] 2.1 Prioritera reproducerbara buggar.
   - [ ] 2.2 Följ upp krascher integritetssäkert.
   - [ ] 2.3 Verifiera regressioner.
   - [ ] 2.4 Håll releasekanal uppdaterad.
3. [ ] **Användarfeedback (0/4)**
   - [ ] 3.1 Samla förbättringsförslag.
   - [ ] 3.2 Prioritera tillgänglighet.
   - [ ] 3.3 Prioritera verkliga användarproblem.
   - [ ] 3.4 Undvik onödiga notiser.
4. [ ] **Androidunderhåll (0/4)**
   - [ ] 4.1 Uppdatera beroenden säkert.
   - [ ] 4.2 Följ Android-policy.
   - [ ] 4.3 Följ Play Store-policy.
   - [ ] 4.4 Verifiera ny releasebuild.
5. [ ] **Framtida funktioner (0/4)**
   - [ ] 5.1 Utvärdera widgetförbättringar.
   - [ ] 5.2 Utvärdera dashboard.
   - [ ] 5.3 Utvärdera språkstöd.
   - [ ] 5.4 Utred AI endast med kostnads-/integritetsbeslut.
6. [ ] **Dataskydd (0/4)**
   - [ ] 6.1 Granska loggning.
   - [ ] 6.2 Granska kontoradering.
   - [ ] 6.3 Granska synk.
   - [ ] 6.4 Verifiera dataminimering.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Kör regression per release.
   - [ ] 7.2 Verifiera CI.
   - [ ] 7.3 Verifiera relevanta enheter.
   - [ ] 7.4 Dokumentera release notes.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Sammanfatta första underhållscykeln.
   - [ ] 8.2 Prioritera nästa roadmap.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

## Princip för kommande faser
- Fasordning: 16.1 → 16.2 → 16.3 → 16.4 → 16.5 → 16.6 → 16.7 → 17.0 (delningskort) → 18.0–22.0 (beteendestöd och långsiktig rökfrihet) → 23.0 (förenklad startsida) → 24.0 (vägledd onboarding) → 25.0 (slutlig QA/Play) → 26.0 (efter lansering).
- En fas = en PR med **fast åttapunktschecklista och fyra fasta delpunkter per huvudpunkt** (32 totalt). Räkna bara verifierat klart efter relevanta tester och CI.
- Ändra inte fasens mål eller nämnare under arbetet utan uttryckligt beslut. Nya önskemål läggs i kommande fas eller backlog. Samla relaterade förbättringar i meningsfulla commits; undvik en PR per småfix.
- Fas 25 är den slutliga manuella Android-/BrowserStack-/TalkBack-/Safe Area- och säkerhetsgrinden. Blockerande säkerhets- och datafel får aldrig skjutas upp.
- Förbered gärna faser i en samlad roadmap-PR, men påbörja inte flera parallella funktions-PR:er.

## Hur AI ska använda denna fil
1. Läs `AI_WORKFLOW.md` och denna masterplan, kontrollera aktiv PR, senaste commit och CI.
2. Fortsätt **enbart i den aktiva fasens PR**. Följ dess fasta checklista och dokumentera commits.
3. Efter användarens bekräftelse om grönt CI: gör nästa relevanta commit **innan** du rapporterar ny checklista.
4. Uppdatera fasstatus här först när fasen är klar, verifierad och mergad. För ändringar i omfattning: dokumentera beslut och skäl i git.
5. Behåll denna fil i repot även när chattar byts ut, så att nästa AI kan fortsätta utan att gissa.

### Fas 13.0 – inventering av befintligt stöd

- `src/screens/BenefitsScreen.tsx`: sparade pengar och generella milstolpar, men ingen faktabaserad kunskapsbank eller källhänvisning ännu.
- `src/screens/SOSScreen.tsx` och `src/data/sosIdeas.ts`: korta, praktiska råd om röksug och vanor; dessa ska återanvändas utan att skapa motstridiga instruktioner.
- `src/screens/HomeScreen.tsx` och `src/screens/PlanScreen.tsx`: stöd efter svåra dagar och anpassning av nedtrappning finns redan.
- Nästa steg: skapa en tydlig svensk kunskapsdel med sakliga, källbelagda texter och separata, verifierade stödresurser. Undvik medicinska löften, kontokrav och extern spårning.

### Fas 13.0 – slutgranskning

- Kunskap om nikotinberoende, röksug, abstinens och svåra dagar finns i befintliga fördelar-skärmen.
- 1177 och Sluta-röka-linjen nås via externa HTTPS-länkar; inga individuella registreringar ingår i länkarnas URL:er.
- Informationen är allmän och innehåller en tydlig medicinsk begränsning; externa uppgifter och öppettider bör kontrolleras vid behov.
- Inget konto, nya behörigheter eller nya native-paket krävs för att läsa innehållet.
- Automatiska tester för innehåll, länkar, tillgänglighet och kontofri åtkomst finns i `tests/knowledgeContent.test.cjs`.
- CI var grön för `e0124d7`; denna dokumentationsändring kräver ny grön CI före merge. Bred manuell Android-QA kvarstår i fas 25.

### Fas 14.0 – inventering av befintlig coach

- `src/screens/HomeScreen.tsx`: dagsberoende uppmuntran, stöd vid överskridet mål, historikbevarande råd och sammanställning av självrapporterade röksugstriggers. Råden bygger redan på lokala uppgifter, men triggeranalysen visas bara vid en svår dag.
- `src/screens/SOSScreen.tsx` och `src/data/sosIdeas.ts`: praktiska tips för stress, måltider, sociala situationer och vanor samt stöd för att utvärdera hur hjälpsam en strategi var.
- `src/screens/PlanScreen.tsx`: stöd för att ändra takt, fortsätta eller starta om en nedtrappning utan att förlora historik.
- `src/screens/BenefitsScreen.tsx`: allmän kunskap och svenska stödresurser, inte personliga behandlingsråd.
- Nästa steg: samla begränsad, transparent lokal coachlogik som kan använda tidigare självrapporterade röksug och hjälpsamma strategier utan att göra medicinska förutsägelser. Behåll generiska råd när data saknas och undvik att upprepa känslig information i notiser.

### Fas 15.0 – inventering och integritetsgränser

- `src/screens/ProfileScreen.tsx` visar kontostatus och lokal resa; inga offentliga profiler eller sociala flöden finns i den granskade skärmen.
- `src/screens/SettingsScreen.tsx` hanterar lokala påminnelser och planinställningar, inte social delning.
- Befintlig molnsynk och konto är för personlig data, inte ett socialt nätverk. Ny delning får aldrig utgå från att inloggning innebär samtycke till publicering.
- Välj en kontofri, frivillig funktion först: användaren kan själv skapa en neutral stödtext och uttryckligen dela den via telefonens delningsfunktion, utan automatiskt infogade rökregistreringar, mål, datum, kontoidentifierare eller historik.
- Undvik serverlagring, kontakter, nya molnregler, sociala flöden och pushmeddelanden till tredje part i denna fas. Granska text, avbrytbarhet, tillgänglighet och regressionstester innan merge.
- En äldre profilgenväg nämner fortfarande JSON-kopia; detta är en separat konsekvens av tidigare beslut att inte använda JSON-backup och bör rättas i lämpligt UI-steg.

### Fas 15.0 – beslut: säker och frivillig delning

1. **Ingen automatisk delning.** Endast ett uttryckligt tryck på knappen `Dela ett stödmeddelande` får öppna telefonens vanliga delningsdialog. Ingen kontakt eller mottagare väljs av appen.
2. **Förvald text utan persondata.** Texten ska vara generell och positiv, utan namn, e-post, rökvanor, antal cigaretter, datum, mål, SOS-historik eller andra användaruppgifter. Texten får granskas i systemets delningsdialog innan mottagaren väljs.
3. **Kontofri och frivillig.** Funktionen ska vara tillgänglig i gästläge, utan Firebase-inloggning, kontakter-behörighet eller ny backend. Avbrytande får inte ändra appens data.
4. **Ingen spårning.** Inga analytics-händelser, delningsloggar, nya push-notiser eller externa AI-tjänster. Appen ska inte kunna se vem som tar emot meddelandet.
5. **Tydlig avsändare och gräns.** Gränssnittet ska förklara att användaren väljer mottagare och att meddelandet lämnar appen först efter användarens eget val. Delningsappen kan ha egna integritetsvillkor.
6. **Testkrav.** Automatiska tester ska säkerställa att den förvalda texten är statisk, att den inte interpolerar användardata och att funktionen inte kräver konto. Androids delningsdialog testas manuellt i fas 25.

### Fas 16.0 – första gränssnittsinventering

- `src/screens/ProfileScreen.tsx`: profilens snabbåtkomst visar fortfarande `Säkerhetskopiering`, `Molnstatus och JSON-kopia` och `Exportera och skydda din historik`, trots beslutet att inte använda JSON-export som säkerhetskopia. Detta ska rättas så att genvägen beskriver kontosynk, inte export.
- `src/screens/ProfileScreen.tsx`: den nya frivilliga delningsfunktionen har explicit tryckhändelse, skärmläsaretikett och informativ text; kontrollera layout med stor text i fas 25.
- `src/screens/SettingsScreen.tsx`: påminnelseinställningar hanterar sparad tid, behörighet och schemalagd notis. Vid polering ska asynkrona statusuppdateringar och feltexter kontrolleras utan att ändra schemaläggningens logik.
- `src/screens/HomeScreen.tsx`: hemvyn innehåller dagsprogression och personliga coachråd. Kontrollera beräkningskostnad/omrendering innan optimering; undvik prestandaändringar utan belägg.
- Nästa konkreta åtgärd: rätta den föråldrade profilgenvägen, därefter skärmläsar-/textstorleksgranskning och riktade tester.

### Fas 16.0 – uppdaterat delningsmål (användarönskemål)

- Ersätt den generiska uppmuntringsdelningen med **frivillig delning av dagens framsteg som en snygg bild, liknande en skärmbild**, med kort positiv text om att det går bra. Bilden ska vara ett separat utformat delningskort, inte en skärmbild av hela appen.
- Visa en **förhandsgranskning** och låt användaren välja att dela eller avbryta. Dela endast dagens framsteg som användaren uttryckligen godkänner; inga namn, e-postadresser, historik, kontouppgifter eller andra skärmelement ska följa med.
- Undvik överdrivna hälsopåståenden. Anpassa positiv text till faktiska framsteg; även en svårare dag ska få ett respektfullt, icke-skuldbeläggande budskap.
- Utred lämplig befintlig bildgenerering/delning i Expo och om ett native-beroende eller Android-rebuild krävs innan implementation. Lägg till tester för valda fält och frivilligt samtycke. Androids systemdelning och bildformat testas manuellt i fas 25.
- Denna ändring ersätter den tidigare planen om enbart neutral textdelning; tidigare fas 15 förblir avslutad, och vidareutvecklingen sker i fas 16.0.

### Fas 16.0 – teknisk inventering av delningsbild

- Befintliga beroenden inkluderar `react-native-svg` men **inte** `react-native-view-shot`, `expo-sharing` eller `expo-file-system` i `package.json`. `Share.share` i React Native delar text/URL, inte en renderad vy som PNG på Android.
- För en verklig delbar bild bör ett separat, dataavgränsat React Native-kort renderas och fångas till PNG via `react-native-view-shot`; delning av bildfilen bör ske via `expo-sharing` med ett temporärt URI. Kontrollera versioner som stöds av installerad Expo SDK 58 före tillägg och låt CI avgöra TypeScript/Metro-kompatibilitet.
- Nya native-moduler kräver **ny Android development build** efter installation. Den befintliga `Share.share`-funktionen får ligga kvar tills bilddelning fungerar, så att ingen trasig knapp släpps.
- Delningskortets datamodell ska vara explicit begränsad till dagens antal och dagens mål, med kort neutral/positiv text baserad på dessa värden. Användaren ska kunna förhandsgranska, godkänna och avbryta. Ingen skärmbild av hela skärmen och inga namn, e-postadresser eller historik.
- Testa rena formatteringsfunktioner med gränsfall (0, över målet, ogiltiga mål), avbrytande, samt att endast godkända fält används i bildkortet. Verifiera bildexport och Android-delning manuellt i fas 25.

### Fas 16.0 – huvudchecklista och kvarstående acceptans (PR #156)

Fasens **åtta fasta huvudpunkter** återges här utan att ändra nämnaren eller hitta på retroaktiva delpunkter. En numrerad underchecklista fastställdes inte när fasen startade; detta är en avvikelse från `AI_WORKFLOW.md` och delpunktsprocent redovisas därför inte som verifierad. PR-beskrivningen ska ha samma status.

1. [x] Aktivera fas 16 efter fas 15.
2. [x] Inventera gränssnitt och prestandarisker.
3. [ ] Slutgranska navigering och användartexter. Profilens synkgenväg och tryckyta till planen har förbättrats, men helhetsgranskningen är inte dokumenterat klar.
4. [ ] Slutgranska skärmläsare, stora textstorlekar och tryckytor. Profil och PNG-flöde har förbättrats; manuell Android-verifiering flyttas till fas 25.
5. [ ] Slutgranska onödiga omrenderingar och responsivitet. SVG-kortet är memoiserat och profilens snabbgenvägar är stabila; granskning av övriga skärmar återstår.
6. [ ] Slutgranska språk och felmeddelanden. Svenska delnings- och synktexter är justerade; övriga skärmar återstår.
7. [x] Automatiska regressionstester för PNG-delning och integritet.
8. [ ] Slutlig CI-verifiering och merge.

**Verifierat:** 3/8 huvudpunkter (37,5 %). **Delpunkter:** inte mätbara utan tidigare fastställd underchecklista; skapa inte en ny nämnare utan uttryckligt beslut. Senaste verifierade gröna commit före denna dokumentationsuppdatering: `34c1e5e` (båda CI-workflows).

**Fas 17, manuellt på Android:** PNG-export och systemdelning efter ny native-build med `expo-sharing`, TalkBack, maximal systemtextstorlek, olika skärmstorlekar och fullständig regressionskontroll. Inga manuella tester är markerade godkända. Säkerhetskritiska blockerare får inte skjutas upp.

### Fas 16.0 – verifieringsläge inför slutgranskning

- CI för `406d620` är grön i båda obligatoriska arbetsflödena (`Validate Smoke Less 6` och `Firestore rules emulator`). Detta verifierar automatiska tester och byggets kontroller, **inte** Androids faktiska bilddelning.
- Profilens synkgenväg beskriver nu kontosynk utan JSON-backup. Delningskortet har svenska instruktioner, anpassad layout, skärmläsaretikett, felstatus och memoiserad SVG-rendering.
- Bildexporten har skydd mot ändrade dagsvärden, gammal export och förhandsgranskning som stängts eller öppnats igen under ett väntande asynkront anrop. Tillhörande regressionstester finns i `tests/dailyShareCard.test.cjs`.
- **Kvar:** Kontrollera faktisk PNG-export och systemdelning på Android med en ny native-build eftersom `expo-sharing` tillkommit. Bred manuell TalkBack-/stor-text-/enhetsregression är fortsatt öppen i fas 25.0 enligt teststrategin.
- Fas 16.0 markeras inte mergad i statusöversikten förrän PR #156 är avslutad och dess sista commit har grön CI.

### Fas 16.0 – samlad teknisk slutgranskning efter commit 23a4234

- **Navigering och texter (punkt 3, öppen):** Profilens planrad och snabbgenvägar har fulla tryckytor och korrekta synktexter. Hemvyns snabbknappar, statistikgenväg och dagliga avstämning har tydliga tillgänglighetsetiketter. Kvar är en sammanhållen kontroll av andra skärmars navigering och användartexter.
- **Tillgänglighet (punkt 4, öppen):** TalkBack-etiketter och status för PNG-export, påminnelser och hemvyn är förbättrade; hemvyns statistikgenväg har minst 48 dp tryckyta. Layouten för dagens framsteg och rubrik kan brytas vid smala skärmar. Faktisk TalkBack- och maximal textstorleks-QA på Android görs i fas 25, inte som ett påstått genomfört test här.
- **Prestanda och responsivitet (punkt 5, öppen):** Hemvyn sammanställer röksugshistoriken i en enda genomgång, och PNG-kortet är memoiserat. Renderfasens ref-mutationer i profilens PNG-flöde är borttagna. Kvar är slutlig genomgång av övriga skärmars renderbeteende och layout.
- **Språk och felmeddelanden (punkt 6, öppen):** Svenska fel- och statusmeddelanden för PNG-delning och påminnelser har förbättrats; ett sent delningsfel visas inte efter att förhandsgranskningen stängts. Kvar är granskning av andra skärmars meddelanden.
- **Verifieringsgräns:** Gröna GitHub-kontroller på `23a4234` verifierar automatiska kontroller, inte native-delning på Android. Native-build och manuell enhetstestning följer efter merge i fas 25. Inga öppna huvudpunkter markeras klara utan återstående kodgranskning.
