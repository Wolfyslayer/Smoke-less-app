# Smoke Less – masterplan för utveckling och lansering

**Syfte:** Denna fil är projektets långsiktiga, versionshanterade facit för vad vi har beslutat att bygga, vad som återstår och vad som är klart. Läs den tillsammans med `AI_WORKFLOW.md` före varje AI-arbetspass. En fas = en PR. Den aktiva PR:ns fasta huvudchecklista och aktuella CI-resultat styr exakt färdigstatus; markera inte en fas klar i denna fil förrän den är mergad och verifierad.

## Projektets principer
- Android först (Expo/React Native); professionellt, lugnt svenskt gränssnitt, liten scrollmängd, stora textstorlekar och god tillgänglighet.
- Stöd både rökminskning och fullständigt rökstopp. Ingen skuldbeläggning, inga påhittade hälsolöften; evidensbaserat stöd och tydlig skillnad mellan mål och verklig konsumtion.
- Gästläge med tydlig varning för dataförlust vid enhetsbyte; frivilligt konto med Firebase Authentication och Firestore-synk. Ingen manuell JSON-säkerhetskopiering/återställning.
- Bevara historik när plan ändras. Säkerställ korrekt användaridentitet, bakåtkompatibla profiler, säker molnsynk och skydd mot konflikter.
- Prioritera gratis/låga driftskostnader, minimera onödiga tjänster och håll AI-funktioner frivilliga tills kostnad och integritet utretts.
- Vid varje commit: följ `AI_WORKFLOW.md`, kontrollera CI och rapportera om ny Android-build behövs.

## Statusöversikt

| Fas | Namn | Status | PR / referens |
| --- | --- | --- | --- |
| 7.0 | Intern Android-beta, kvalitet och förberedelser | Klar, mergad | #138 |
| 8.0 | Personal Quit Plan 2.0 | Pågår | #140 |
| 9.0 | SOS och röksug 2.0 | Planerad | — |
| 10.0 | Statistik och beteendeinsikter | Planerad | — |
| 11.0 | Motivation, milstolpar, ekonomi och hälsa | Planerad | — |
| 12.0 | Återfallsprevention och långsiktigt stöd | Planerad | — |
| 13.0 | Kunskapsbank och svenskt stöd | Planerad | — |
| 14.0 | Smart coach | Planerad | — |
| 15.0 | Frivilligt socialt stöd | Planerad, villkorad | — |
| 16.0 | Slutpolering, prestanda, tillgänglighet och språk | Planerad | — |
| 16.1 | Android-hemskärmswidgets | Planerad | — |
| 16.2 | Google-inloggning med Firebase | Planerad | — |
| 17.0 | Säkerhet, integritet och Google Play-lansering | Planerad | — |

Tidigare arbete och detaljer finns i git-historiken, PR #138 och projektets övriga dokument. Fas 7.0 var **intern beta**, inte offentlig Play Store-lansering.

## Fas 8.0 – Personal Quit Plan 2.0 (AKTIV, PR #140)

**Mål:** En personlig, begriplig och ändringsbar rökstoppsplan utan förlorad historik.

**Fast huvudchecklista – exakt åtta punkter:**
1. [x] Inventera befintlig plan, datamodell, skärmar och testtäckning; dokumentera kompatibilitetsrisker.
2. [x] Stöd tre vägar: sluta direkt, trappa ned gradvis, planerat stoppdatum.
3. [ ] Bygg individuella mål och rimlig veckovis progression utan överraskande omräkning av historik.
4. [ ] Skapa tydlig planöversikt med nästa delmål och lättbegripliga justeringar.
5. [ ] Hantera missade mål, ändrat stoppdatum och återstart utan skuld eller förlust av historik.
6. [ ] Säkerställ migration, offline-/gästläge och kontosynk utan datakonflikter.
7. [ ] Lägg till automatiska tester och verifiera tillgänglighet, små skärmar och stora textstorlekar.
8. [ ] Slutligt acceptanstest, gröna obligatoriska CI-kontroller och automatisk merge till main.

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

## Fas 17.0 – Säkerhet, integritet och Google Play-lansering
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
