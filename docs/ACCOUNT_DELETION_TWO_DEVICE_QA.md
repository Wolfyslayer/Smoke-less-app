# Kontoradering med två klienter – riktad QA 2026-11-17

## Miljö och avgränsning

Två separata Android 17/x86_64-emulatorer: `SmokeLess_QA`/`emulator-5556` och en ny disponibel `SmokeLess_QA_Secondary`/`emulator-5558`. Båda kör det befintliga debugpaketet `com.smokeless.app.deletionqa`; installerade APK-bytes jämfördes med samma befintliga QA-APK. Ingen ny Android-build gjordes. QA-klientens JavaScript jämfördes med granskad fas 25-kod på `637fd74`, med normaliserade radslut. Ingen Preview-installation eller telefon användes för testdata.

Endast lokala Auth-, Firestore- och Functions-emulatorer för `demo-smokeless-qa` användes. Nya syntetiska konton skapades för detta prov: ett gemensamt testkonto på båda klienterna och ett separat kontrollkonto med data i samtliga fyra samlingar. Hemligheter och UID:n finns endast privat på testdatorn; lösenorden är Windows-DPAPI-skyddade och skrivs inte ut. Kontona i det delade Firebase-projektet användes inte. Lokal Functions körde hostens Node 24; obligatorisk CI kör Node 22.

## Faktiskt verifierade resultat

| Prov | Resultat | Evidens |
| --- | --- | --- |
| Båda klienterna online med samma konto | PASS | Båda visade samma serverplan och en post; scoped server- och RKStorage-snapshotar sparades före ändringar. |
| Andra klienten offline | PASS | Wi-Fi och mobildata stängdes av endast på andra emulatorn. En ny post sparades lokalt: två lokala poster, fortfarande en på servern. |
| För gammal inloggning på första klienten | PASS | Egen modal visade att raderingen inte startades och krävde ny inloggning. Auth/data/cache var oförändrade och inget server-/lokalt raderingslås skapades. |
| Egen radering efter ny inloggning | PASS | Första klientens egen bekräftelsemodal användes. Kontots Auth och alla fyra historiksamlingar raderades, completed-lås behölls. Första klienten återstartade via Starta om appen och behöll gästhistoriken. |
| Fortsatt registrering på den fortfarande offline klienten | PASS | Ytterligare en lokal post sparades efter serverraderingen: tre lokala poster, noll på servern. Två poster var alltså osynkade. |
| Återanslutning av andra klienten | PASS | Nätverket återställdes. Klienten visade bekräftad serverradering och blockerade fortsatt användning. Serverhistoriken förblev tom; ingen av de osynkade posterna återuppladdades. |
| Slutför lokal städning på andra klienten | PASS | Båda osynkade posterna och den gamla kontocachen togs bort. Tombstone och resetflagga behölls tills ny process kunde verifiera SDK-cache. |
| Avbrott efter lokal städning och efterföljande kallstart | PASS | Android avslutade appen när Google Play-tjänster uppdaterades. Exit-info visade reason 16/PACKAGE UPDATED med Google Play-tjänster som orsak; ingen Java-krasch observerades. Efter användarens öppning visades tom välkomstvy, resetflaggan var tömd, kontocachen saknades och serverhistoriken var fortsatt tom. |
| Kontrollkonto och annan historik | PASS | Kontrollkontots Auth och samtliga fyra samlingar var exakt oförändrade enligt kanoniska jämförelser. Gästhistoriken och en annan kontocache på första klienten var exakt bevarade. Kontrollkontot kunde därefter logga in på andra klienten och visa sin post utan att det raderade kontots data återkom. |
| Automatisk omstart på den andra emulatorn i detta offlinefall | EJ VERIFIERAD | Systemuppdateringen avbröt före agentens omstartsklick. Den efterföljande manuella kallstarten räknas inte som automatisk omstart. Automatisk omstart på första klienten och föregående riktade native-prov är separat evidens. |

Råa RKStorage-filer, kontonycklar, krypterade testhemligheter och UID-mappningar är inte versionshanterade. Sammanfattningar skapades endast efter kontroller av exakta, kontobundna snapshotar. Primärklientens och den sekundära klientens nätverk är åter online.

## Starkare negativ serverkontroll

`functions/accountDeletion.integration.cjs` omfattar nu fyra riktiga lokala Auth/Firestore/Functions-fall. Det nya fallet skriver först giltiga klientdokument i entries, cravings, checkins och settings med HTTP 200. Efter radering återspelas exakt samma payload med den gamla tokenen och nekas med HTTP 403 för samtliga fyra. Tokenen kan fortfarande läsa sitt eget completed-kvitto med HTTP 200; nekandet kan därför kopplas till raderingslåset och inte bara till fel dokumentformat eller förlorad identitet. Ett annat konto kan samtidigt skriva en giltig post och behålla sin befintliga data.

Alla fyra integrationer passerade lokalt. Detta förstärker de tidigare 403-observationerna, som utan en positiv kontroll av samma payload inte ensamma kan bevisa varför skrivningen nekades. Firestore-regler och serverns produktionskod ändrades inte.

## Öppna gränser

Detta är ett riktat native-prov med två emulatorer och debug/Metro, inte fysisk tvåenhetsacceptans eller verifiering av en ny fristående Preview-APK från samlingsgrenen. Onlinefallet där den andra klienten är ansluten under själva raderingen, full konflikt-/lagringsfel-/widgetmatris och fysisk/tillgänglighetsacceptans återstår. Fasta faschecklistor och deras nämnare ändras inte; full 4.4 markeras inte klar från detta avgränsade prov. Publik radering, releaseattest, APK, OTA och webbdistribution är fortsatt avstängda/opublicerade.
