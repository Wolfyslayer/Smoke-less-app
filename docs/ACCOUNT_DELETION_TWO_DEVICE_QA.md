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

## Kompletterande onlineprov 2026-11-17

Samma befintliga QA-APK och granskade JavaScript på `637fd74` användes på båda emulatorerna. En ny lokal emulatorkörning fick två nya syntetiska konton. Kontrollkontot loggades först in på sekundärklienten och visade sin post, innan båda klienterna loggades in på det gemensamma kontot. Separata privata snapshotar bevarar föregående offlineprovs evidens.

| Prov | Resultat | Evidens |
| --- | --- | --- |
| Positiv tvåklientssynk online | PASS | En registrering skapad genom primärklientens UI gav två poster på servern och två i båda klienternas kontocache. Sekundärklientens logg visade två poster. |
| Radering från sekundärklienten medan primärklienten var online | PASS | Egen bekräftelsemodal användes. Auth och alla fyra samlingar raderades och completed-kvittot behölls. Primärklienten gick till blockerad raderingsåterhämtning. |
| Återhämtning på den anslutna primärklienten | PASS | Försök igen kontrollerade serverkvittot och slutförde lokal städning, varefter Starta om appen visades. |
| Automatisk omstart på båda emulatorerna | PASS | Respektive Starta om appen gav ett nytt huvudprocess-PID i samma QA-paket. Sekundärklienten visade välkomstvyn och primärklienten gästhemmet. En färsk snapshot efter färdig uppstart visade tömda resetflaggor, saknad raderad kontocache och bevarade confirmed-markörer på båda klienterna. |
| Annan lokal historik och kontrollkonto | PASS | Primärklientens befintliga gästcache var exakt bevarad. Sekundärklientens kontrollkontocache var exakt bevarad. Kontrollkontots Auth och fyra samlingar var exakt oförändrade, även efter återinloggning som visade dess enda post. Det raderade kontots serverhistorik förblev tom. |

En snapshot under omstartens laddningsfas hade ännu resetflaggan satt på primärklienten. Slutresultatet bygger på den senare snapshoten efter visat gästhem och avslutad cachekontroll. Den tidiga observationen sparas privat. Sekundärklienten hade ingen gästcache i utgångsläget, så gästbevarande på den klienten räknas inte som ett separat positivt prov.

## Fel- och widgetkontroller 2026-11-17

Ett nytt lokalt syntetiskt konto användes på sekundärklienten. Med Wi-Fi och mobildata avstängda visade egen modal att raderingen inte startades eftersom inloggningen inte kunde verifieras. Före/efter-jämförelser bekräftade oförändrade molndata för både test- och kontrollkonto, kvarvarande lokal kontocache samt frånvaro av serverlås och lokal raderingsmarkör. Nätverket återställdes efter provet.

Native widgetlagring verifierades med opt-in och faktiska dagsaggregat. Efter utloggning var Androids widget-SharedPreferences tomma. Två nya automatiska regressioner verifierar att fel i native widgetstädning behåller opt-in/snapshot och raderingens omstartsspärr, förhindrar för tidig utloggning samt tillåter lyckat återförsök. Den ordinarie fas 25-sviten omfattar därefter 318 passerande tester, varav 19 riktade backend-/widgetfall.

Ett efterföljande raderingsförsök fick ett faktiskt lokalt Firestore/gRPC-avbrott efter att serverns lease skapats. Klienten behöll blockerad återhämtning och rapporterade ingen lyckad radering. Återinloggning kunde göras men återförsök nekades under aktiv lease. Slutförd återhämtning efter ordinarie lease-utgång följs upp separat. Inget serverlås ändras administrativt för att förkorta provet.

## Fortsättning 2026-11-21

Den tidigare lokala emulatorkörningen hade avslutats före återupptagningen. Slutförd återhämtning efter lease-utgång i det avbrutna 17 november-provet är därför fortsatt öppen. Nya prov använder nya syntetiska konton och separat privat evidens. Den nya emulatorkörningen har export vid avslut.

Granskning av det verkliga gRPC-felet visade att fel under låsets skapande, läsning eller lease-transaktion kunde nå Functions ramverksloggning som råa SDK-fel. Servern översätter nu dessa till ett generiskt callable-fel och loggar endast en fast text. Befintliga failed-precondition-svar för aktivt eller ogiltigt lås bevaras. Ett regressionstest var rött före rättningen och passerar efteråt för samtliga tre felsteg, med Auth och historik bevarade. TypeScript och 319 ordinarie fas 25-tester passerade lokalt.

### Verifierad återhämtning efter partiellt fel

Ett nytt syntetiskt konto fick en enda avsiktlig, okänd nästlad testpost i den lokala demoemulatorn. Native-klientens raderingsbegäran skapade det ordinarie tio minuters serverlåset men stoppade före Auth-radering. Auth, kontocache och den ursprungliga posten behölls. Ett nytt autentiserat återförsök under aktiv lease nekades och bevarade data.

Endast den nästlade syntetiska felposten togs bort av testoperatören. Serverlåset och dess tidsgräns ändrades aldrig administrativt. Efter verklig lease-utgång, ny inloggning och Försök igen slutförde klient/server raderingen. Auth och samtliga fyra samlingar var då tomma och completed-kvittot kvar. Knappen Starta om appen gav ny process och välkomstvy. En snapshot efter avslutad uppstart visade tömd resetflagga, saknad kontocache och confirmed-markör. En tidigare snapshot under laddningen hade ännu resetflaggan satt och räknas inte som slutresultat.

Kontrollkontots Auth och fyra samlingar var exakt oförändrade. Primärklientens befintliga gästcache och fyra andra kontocacher på emulatorerna var exakt bevarade. Native widget-SharedPreferences var tomma efter återhämtningskedjan. Eftersom återinloggningen omfattade utloggning tillskrivs detta inte enbart det sista raderingsanropet. Första snapshoten hade verifierade dagsaggregat och opt-in. Server-/klientfel vid widgetstädning täcks dessutom av regressionstesterna.

Privat emulatorexport sparades under pending-läget. Inga lösenord, UID:n, databasfiler eller exportfiler checkas in. Detta prov använder fas 25-klienten i befintlig deletionqa-debugapp och den uppdaterade lokala servern. Full fristående/fysisk acceptans förblir öppen.

## Återstående acceptans

Full konflikt-/lagringsfel-/widgetmatris, fysisk tvåenhets-/tillgänglighetsacceptans och slutlig fristående kandidatacceptans återstår. Fasta faschecklistor behåller sina nämnare. Full 4.4 kräver återstående acceptans. Raderingsproven använder två emulatorer med debug/Metro.
