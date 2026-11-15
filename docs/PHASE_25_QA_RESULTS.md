# Fas 25 – QA-protokoll

Datum: 2026-11-15. Källbas för enhetsproven: `3f3d63e` (samma JS-korrigeringar som provades lokalt inför commit). Obligatoriska CI är gröna på denna commit. Senare städ-/gästlagringsändringar har automatiska tester men har inte körts destruktivt på telefonen. **Detta är inte slutacceptans.**

## Enhetsmatris

| Miljö | Faktiskt tillgänglig | Användning |
|---|---|---|
| A024, Android 17, 1260×2800, 480 dpi, gestnavigering | Ja, USB/ADB | Befintlig utvecklingsbuild 6.0.0, versionCode 1, target 36; installerad 2026-11-06. Aktuell JS via Metro/USB. Ingen ominstallation eller datarensning. |
| Samma A024, textskala 1,8 efter omstart | Ja | Begränsad visuell granskning av startsida/SVG/navigation. Återställd till ursprungliga 1,0. Inte maximal text eller full regression. |
| Liten Android-skärm, treknappsnavigering och äldre API | Nej | Krävs före slutacceptans; emulator/BrowserStack eller separat testenhet. |
| Andra enheten med samma testkonto | Nej | Krävs för samtidighet, offlinekonflikter och radering utan återuppladdning. |
| Signerad produktionskandidat | Nej | Utvecklingsbuild och JS-omladdning ersätter inte releaseprov. |

## Genomförda riktade prov

| ID | Utfall | Faktisk observation och begränsning |
|---|---|---|
| DEVICE-01 | PASS | Appen laddar aktuell JS via USB/Metro utan startkrasch. Befintlig historik rensas inte. |
| DEVICE-02 | PASS | Startsida: dagskort, Registrera och SOS synliga. Dubblerat introduktionskort togs bort efter observation. |
| DEVICE-03 | PASS | Registreringsdialog öppnad och stängd med Android Tillbaka. Inget sparat eller hoppat över som skulle skapa en cigarett. |
| DEVICE-04 | PASS efter korrigering | SOS hade inställningar före hjälpen. Efter korrigering visas andningsövning först; personlig plan är valbar längre ned. Inget röksug sparat. |
| DEVICE-05 | PASS | Profilens SVG-förhandsvisning kan öppnas och PNG förberedas. Faktisk cachefil avläst: PNG 680×426, 35732 byte. Visuell jämförelse mot samma dagskort utan namn/kontouppgifter. Endast det aktuella dataläget provat. |
| DEVICE-06 | PASS | Androids systemdelningsdialog öppnas för PNG och avbryts med Tillbaka. Ingen mottagare vald, inget skickat. |
| DEVICE-07 | BEGRÄNSAT PASS | Textskala 1,8 efter full omstart: dagskortet växer och ringen staplas utan observerad klippning. Live-konfigurationsbyte, maximal text och andra vyer återstår. |
| DEVICE-08 | PASS | Android Tillbaka från Hem visar avslutsbekräftelse; Avbryt återgår till appen. System-/tredjepartsöverlägg tog initialt fokus, så provet gjordes om med Smoke Less bekräftat i förgrunden. |
| AUTO-01 | PASS | `3f3d63e`: TypeScript och 265 ordinarie tester, 10 storage, 6 migration samt 9 emulatorfall (290 totalt). Efter ytterligare skydd för äldre kopior/gästlagring: 272 ordinarie tester; total 297 med samma separata sviter. Nya slutliga CI krävs efter push. |
| AUTO-02 | PASS | Nio Firestore-regeltester mot lokal emulator, projekt `smokeless-rules-test`. Anonym/annan användare, otillåtna fält, revisioner, hårdradering och raderingslås provas. Ingen produktionsdata används. |
| AUTO-03 | PASS | 21 mockade server-/återhämtningstester: ordning, delvisa fel, färsk auth, okänd data, lease och återförsök. Inte en driftsatt klient/server-integration. |
| BUILD-01 | AVBRUTET | Fristående QA-workflow 43740485924 är cancelled. Användaren har beslutat att själv ordna bygge senare. Starta inga ytterligare byggen nu; inget nytt APK-resultat har godkänts. |
| AUTO-04 | PASS | Tre riktiga callable-integrationstest i Auth + Firestore + Functions, enbart `demo-smokeless-qa`: full egen radering med annat konto bevarat, nekad obehörig/UID-styrd begäran och stopp vid okänd nästlad data. Lokalt Node 24; CI verifierar Node 22. |

Senaste lokala raderingsmilstolpe: TypeScript, 297 ordinarie tester (inklusive 21 servermockar), 10 storage, 6 migration, 9 regler och 3 integration = **325 fall**. Ingen fysisk radering, native-cacheacceptans, API-aktivering eller produktionsradering ingår i detta resultat. Releaseflaggan är avstängd.

## Kvarvarande obligatoriska prov

Alla nedan är **EJ KÖRDA**, inte godkända:

- Ny onboarding för alla tre planvägar, första registrering, planändring, bakåt/framåt, tom och ogiltig inmatning på en isolerad testinstallation.
- Nollmål, över mål, bekräftad rökfrihet, motstridig avstämning, lång historik och underhållsläge med kontrollerade testdata.
- SOS-timer, intensitet, hjälpsamhetsval och sparning; personliga handlingsplaner efter omstart.
- Notisbehörighet nekad/tillåten/återkallad, faktisk daglig/veckovis/riskleverans, tysta tider, omstart och tidszonsbyte.
- Widgets: opt-in, launcherplacering, uppdatering, midnatt, kontobyte, avstängning och återkallad integritet.
- PNG för noll/över mål, fel/avbrott, maximal text och ändrade värden under export.
- TalkBack med faktisk uppläsning/fokus, tangentbord, maximal text/skärmstorlek, liten skärm, treknappsnavigering, Safe Area och systemfält på fler konfigurationer.
- Gästläge/offline med sparning och omstart; Google/e-post, kontobyten, tvåenhetssynk och konflikter med separata testkonton.
- Kontoradering från app och extern väg, omstart/avbrott/utloggning under radering, lokal städning och ingen återuppladdning från andra enheten.
- Signerad releasekandidat: installation/uppgradering, kallstart utan Metro och hela matrisen igen.

Detaljer från `PHASE_8_ANDROID_ACCEPTANCE.md` (7.4, 8.1, 8.1a, 8.2), `FINAL_PHASE_ACCESSIBILITY.md` samt fas 16.4–24:s enhetsbegränsningar ingår i denna grind. Privata skärmbilder, konton, mottagarlistor och enhets-ID:n ska inte checkas in som QA-underlag.
