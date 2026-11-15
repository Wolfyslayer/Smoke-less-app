# Fas 30 – slutpolering inför release

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

Production-profilen har ordinarie paket/projekt, store-distribution, ingen development-client och fjärruppdateringar avstängda. Preview har eget paket/projekt/kanal. Det gemensamma Firebase-projektet är ett uttryckligt tillfälligt ägarbeslut; serverkonton är inte isolerade. Produktionsdata får därför inte användas för testskrivningar.

Blockerande före offentlig release: verifierad signering/SHA och Google-inloggning, riktig fristående build, konto-/raderingsacceptans, databevarande, notiser/widget/offline, fysisk tillgänglighet, ansvarig/kontakt och publicerad integritetspolicy samt riktiga butiksskärmbilder. Kontoraderingsflaggan är fortsatt avstängd. Aktivera den inte för att klara en checklista. Slutlig Play Data safety är inte godkänd eller inskickad.

Versionering: `eas.json` använder fjärrhanterade buildnummer; produktversionen kommer från appkonfigurationen. Behåll samma signeringsgrund vid uppgraderingar. Fingerprint avgränsar kompatibla Preview-OTA; native-moduler, plugins och app-ID kräver ny build. Se `PHASE_29_PREVIEW_OTA.md` för Windows-kommandon och återställning. Rollback får inte återställa raderade konton eller kringgå raderingslås.

Releaseunderlag finns i `GOOGLE_PLAY_LISTING_DRAFT.md`, `PRIVACY_POLICY_DRAFT.md`, `PLAY_DATA_SAFETY_REVIEW.md` och fas 25:s acceptansdokument. De är arbetsutkast. Ingen produktion, butik eller OTA har publicerats här.

## Verifiering

TypeScript och 342 ordinarie tester PASS lokalt. Nya tester täcker felredigering, sekretess, begriplig Google-fallback, Android-kanal/behörighetsordning och synkstatusens två navigationsgrindar. Befintliga tester täcker modalbekräftelser, avbryt/dubbeltryck, teman, reminder-serialisering och negativa uppdateringsfall. Kodtester bevisar inte fysisk knappfunktion eller visuell acceptans.

Ny Android-build för enbart fas 30: **NEJ**, endast JS/texter och befintligt notis-API ändras. Det öppna native-buildbehovet från fas 29 kvarstår. Ingen build startas enligt användarens beslut.
