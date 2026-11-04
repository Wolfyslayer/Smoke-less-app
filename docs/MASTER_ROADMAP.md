# Smoke Less – masterplan för utveckling och lansering

**Syfte:** Denna fil är projektets långsiktiga, versionshanterade facit för vad vi har beslutat att bygga, vad som återstår och vad som är klart. Läs den tillsammans med `AI_WORKFLOW.md` före varje AI-arbetspass. En fas = en PR. Den aktiva PR:ns fasta huvudchecklista och aktuella CI-resultat styr exakt färdigstatus; markera inte en fas klar i denna fil förrän den är mergad och verifierad.

## Teststrategi beslutad 2026-11-04
- Samla omfattande manuell Android-acceptans, BrowserStack, skärmstorlekar, maximal text, TalkBack, tillgänglighet och full regression i **fas 17.0:s slutliga QA-grind före Google Play-lansering**. Tidigare ej utförda testpunkter förs dit och markeras inte som godkända.
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
| 15.0 | Frivilligt socialt stöd | Aktiv – konton och delningsrisker inventerade | #155 |
| 16.0 | Slutpolering, prestanda, tillgänglighet och språk | Planerad | — |
| 16.3 | Android-tillbakaknapp och navigations-UX | Planerad | — |
| 16.1 | Android-hemskärmswidgets | Planerad | — |
| 16.2 | Google-inloggning med Firebase | Planerad | — |
| 17.0 | Säkerhet, integritet och Google Play-lansering | Planerad | — |

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

## Fas 17.0 – Slutlig QA, säkerhet, integritet och Google Play-lansering
- Genomför uppskjutna manuella tester från tidigare faser, inklusive `docs/PHASE_8_ANDROID_ACCEPTANCE.md` (7.4, 8.1, 8.1a, 8.2), på riktiga Android-enheter och BrowserStack. Dokumentera PASS/FAIL, enhet, Android-version och testad commit.
- Verifiera full regression: onboarding, planer, SOS, historik, offline, gästläge, kontobyten, tvåenhetssynk och konflikter, notiser, tillgänglighet, TalkBack, stor text och små skärmar.
- Säkerställ gröna CI, native releasebygge och blockeringsfri slutacceptans innan publicering.
- Säker kontohantering, verifierad radering av konto och tillhörande data samt tydliga användarflöden.
- Granska Firebase-regler, serverfunktioner, datalagring, behörigheter och loggning.
- Färdigställ integritetspolicy, Google Play Data safety, butikstexter, skärmbilder och supportkontakt.
- Bygg och testa signerad release; verifiera riktiga Android-enheter, notifieringar och inloggning.
- Säkerställ aktuell Google Play-policy och obligatoriska kontroller före offentlig lansering.
- Plan för uppföljning, buggrapportering och underhåll efter publicering.

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
- CI var grön för `e0124d7`; denna dokumentationsändring kräver ny grön CI före merge. Bred manuell Android-QA kvarstår i fas 17.

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
