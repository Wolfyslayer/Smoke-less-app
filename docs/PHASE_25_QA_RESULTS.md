# Fas 25 – QA-protokoll

Datum: 2026-11-15. Källbas: `873c5df` plus fasens lokala korrigeringar, som ska få commit-SHA och omtest efter push. **Detta är inte slutacceptans.**

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
| AUTO-01 | PASS | TypeScript och utökad automatisk svit. Exakta slutliga antal/commit förs in efter slutkörning. |
| AUTO-02 | PASS | Nio Firestore-regeltester mot lokal emulator, projekt `smokeless-rules-test`. Anonym/annan användare, otillåtna fält, revisioner, hårdradering och raderingslås provas. Ingen produktionsdata används. |
| AUTO-03 | PASS | 21 mockade server-/återhämtningstester: ordning, delvisa fel, färsk auth, okänd data, lease och återförsök. Inte en driftsatt klient/server-integration. |

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
