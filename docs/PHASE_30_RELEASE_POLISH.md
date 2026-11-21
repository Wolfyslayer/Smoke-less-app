# Fas 30 – slutpolering inför release

## Widgetpolering 2026-11-21

Widgetarnas visuella uppdatering hör till fas 30:s 3.4 och 6.3 i befintlig PR #182. Den använder appens petrolbakgrund, mintaccent, kantlinjer och bladform. Vanlig och kompakt dagswidget får tydligare antal, måltext och en diskret målindikator. Registrera och SOS har egna symboler. Dagsvärden och indikator är dolda tills opt-in och ett giltigt dagsvärde finns. Genvägarna visar inga personliga värden och registrerar aldrig en cigarett vid tryck.

De fyra providers och deras skyddade navigering fanns tidigare på samlingsgrenen i PR #184. Samma implementation förs här till fasens källa för att widgetpoleringen ska kunna granskas och levereras i rätt PR. Privat native-widgetlagring, datumkontroll, paketbundna PendingIntent och uppdatering av alla providers vid städning bevaras.

TypeScript och 353 ordinarie tester passerade lokalt. Native-kompilering och visuell acceptans av den nya designen återstår vid denna commit. Ny Android-build JA eftersom Android-resurser och provider ändras. Samlingsgrenen får nästa Preview-versionCode före ett godkänt lokalt kandidatbygge. Fulla punkterna 3.4 och 6.3 förblir öppna tills hela deras acceptans är utförd.

## Inventering och beslut

Inventeringen omfattar routning i `app/`, samtliga 16 skärmfiler i `src/screens/` och presentationskomponenterna i `src/components/`. Sökning efter utvecklingstext, tekniska fel, bygginstruktioner och plattformsdialoger kompletterades med riktad läsning av konto, onboarding, data, inställningar, uppdateringar, synk och påminnelser. Detta är en kodinventering, inte en genomklickad Android-acceptans av varje knapp eller en full språkgranskning.

| Område | Beslut och verifiering |
| --- | --- |
| Hem, plan, registrering, historik, statistik, SOS | Behåll befintliga handlingar och historik. Tidigare navigation-/domäntester passerar. Full fysisk regression återstår. |
| Konto och onboarding | Behåll e-post/Google/gäst samt säker återgång. Ersätt bygginstruktioner och OAuth-/SHA-/tokenfel med begriplig vägledning. |
| Data och återställning | Behåll import, inspektion, kopiering och bekräftelser. Visa inte intern återställningsnyckel. Ingen ny radering eller migration ingår. |
| Synk | Visa generell återhämtningsbar status i stället för råa SDK-fel. Behåll kontogränser och synkgrindar. |
| Inställningar och widget | Ta bort felaktigt påstående om framtida widgetfunktion. Beskriv opt-in och hemskärmens widgetmeny. |
| Preview | Uppdateringar och tekniska versionsfält visas endast i Preview. Behåll varningen om gemensam Firebase. Visa korrekt hämtstatus. |
| Om, kunskap och stöd | Behåll verklig konfigurerad version, källor och medicinsk avgränsning. Ikon/splash finns i app.json; faktisk release-rendering är öppen. |

`userMessage.cjs` använder kända felkoder och en exakt lista över egna valideringsmeddelanden. Övriga fel blir generiska produktmeddelanden. Ingen rå felsträng, UID, credential eller lagringsnyckel ska återges. Avsiktliga säkerhetsmeddelanden i kontoradering och påminnelser har egna typade fel och behålls.

## Notiser

Enbart frivillig avstämning (daglig/veckovis) och förberedelse inför risksituation schemaläggs. Ingen automatisk milstolpsnotis eller notis baserad på utebliven registrering finns. Två stabila identifierare, serialiserad aktivering och avstängning före ersättning hindrar dubletter. Den äldre påminnelsen avregistreras vid migrering; inget återaktiveras utan användarens val.

Android-kanalen `smokeless-reminders-v1`, **Frivilliga påminnelser**, skapas före behörighetsfrågan och endast när användaren aktiverar. Kanalen använder privat låsskärmsvisning. Innehållet är generiskt även om enheten väljer att visa hela notisen. Tysta tider valideras före ändringar. Kalendertriggers följer telefonens lokala tid; dag-/veckotrigger, kanal och behörighetsordning kontrolleras automatiskt. DST, byte av tidszon, bakgrund, omstart, tryck på notis och olika Android-versioner måste provas på enhet. Leverans garanteras inte av en lyckad schemaläggning.

## Releasegrind

Production-profilen har ordinarie paket/projekt, intern APK-distribution, ingen development-client och fjärruppdateringar avstängda. Preview har eget paket/projekt/kanal. Det gemensamma Firebase-projektet är ett uttryckligt tillfälligt ägarbeslut; serverkonton är inte isolerade. Produktionsdata får därför inte användas för testskrivningar.

Blockerande före offentlig release: verifierad signering/SHA och Google-inloggning, riktig fristående build, konto-/raderingsacceptans, databevarande, notiser/widget/offline, fysisk tillgänglighet, ansvarig/kontakt och publicerad integritetspolicy samt korrekt webb-/installationsinformation. Kontoraderingsflaggan är fortsatt avstängd. Aktivera den inte för att klara en checklista. Play Data safety och butiksmaterial är uppskjutna och förbereds inte nu.

Versionering: `eas.json` använder fjärrhanterade buildnummer; produktversionen kommer från appkonfigurationen. Behåll samma signeringsgrund vid uppgraderingar. Fingerprint avgränsar kompatibla Preview-OTA; native-moduler, plugins och app-ID kräver ny build. Se `PHASE_29_PREVIEW_OTA.md` för Windows-kommandon och återställning. Rollback får inte återställa raderade konton eller kringgå raderingslås.

Aktuellt releaseunderlag är fas 25:s acceptansdokument, PRIVACY_POLICY_DRAFT.md och PHASE_29_PREVIEW_OTA.md. Äldre Play-dokument är historiska framtidsunderlag, inte aktuella arbetskrav. Ingen APK, webbändring eller OTA har publicerats här.

## Verifiering

TypeScript och 342 ordinarie tester PASS lokalt. Nya tester täcker felredigering, sekretess, begriplig Google-fallback, Android-kanal/behörighetsordning och synkstatusens två navigationsgrindar. Befintliga tester täcker modalbekräftelser, avbryt/dubbeltryck, teman, reminder-serialisering och negativa uppdateringsfall. Kodtester bevisar inte fysisk knappfunktion eller visuell acceptans.

Ny Android-build för enbart fas 30: **NEJ**, endast JS/texter och befintligt notis-API ändras. Det öppna native-buildbehovet från fas 29 kvarstår. Ingen build startas enligt användarens beslut.

## Aktuellt APK-beslut och verifiering 2026-11-16

Main 2782933 och fas 25/29 är inlästa i befintlig PR #182. Dubbla roadmapplaner har ersatts med samma fasta faschecklistor; aktuellt distributionsbeslut bevaras. Production-profilen producerar nu en fristående APK med intern distribution, inte AAB/store. Ingen submit-konfiguration eller Play-publicering tillkommer. Detta är en profiländring som behöver nytt uttryckligt bygggodkännande innan en kandidat kan verifieras.

Om-vyn har fungerande, fasta länkar till webbplatsens /support och /privacy, med begriplig återhämtningsbar feltext om webbläsaren inte öppnas. Inga användaruppgifter eller sökparametrar skickas. Länkarna säger inte att policyn är färdig eller att kontoradering redan är tillgänglig. Support och integritet är fortfarande releaseblockerare tills operatör, policy och raderingsväg är verifierade. Användaren tar ansvar; offentligt namn, bevakad mailbox och supportretention återstår.

Den nya fas 25-grinden anropas av fas 29-publiceraren före GitHub-skrivningar. Metadata för webb och app kommer från samma kandidat. Webbplatsen är kontrollerad med HTTP 200 och spärrad APK-länk (available:false). Dess separata manuella synkflöde måste kopplas till verifierad website-preview.json före lansering. Inga webbändringar eller offentliga publiceringar är gjorda här.

Kontoraderingens releaseflagga förblir avstängd; inga verkliga konton/testposter, Firestore-regler, Firebase-konfigurationer eller signeringsnycklar ändras i denna commit. Native/tvåenhetsradering, full Android-regression, notisinteraktion, TalkBack/stor text, verklig APK-uppgradering/OTA samt webbnedladdning återstår. Ingen fas slutgodkänns eller mergas på grund av endast dessa kodtester.

Ny Android-build: JA för att verifiera den ändrade fristående Production-APK-profilen och nya inbyggda klientkoden, men STARTAS INTE. Underlag efter nytt uttryckligt beslut: APP_VARIANT=production och eas build --platform android --profile production (verifiera ordinarie apps befintliga signering först). Första offentliga Preview-kandidaten använder preview-profilen och befintlig verifierad Preview-signering; installera aldrig en annan nyckel över befintlig app och rensa inte data för att kringgå fel.
