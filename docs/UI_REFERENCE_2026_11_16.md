# Visuell riktning från användarens referens

Användaren visade `Smoke Less – Rökfri på svenska.png` och valde uttryckligen **anpassa alla vyer stegvis**. Referensen finns lokalt i användarens Downloads-mapp. Tillägget genomförs i aktiv branch/PR #184; fas 32:s fasta nämnare och tidigare öppna acceptansgrindar behålls.

## Genomförd kodanpassning

| Område | Förändring |
| --- | --- |
| Gemensamt | Petrol/mint i mörkt tema, motsvarande ljus palett, kompaktare kort, kortramar, knappar och rubriker. Samma semantiska färger och temapreferens. |
| Hem | Nytt kompakt sidhuvud och dekorativ sol-/skogsscen, bladmärke, dagsring till vänster och värden till höger, tre kompakta översiktskort, mintgrön registrering och korallfärgad SOS-handling. Anpassningen respekterar dolda/valda kort och underhållsläge. |
| Navigation | Tunnare bottenfält med fem befintliga destinationer, tydlig ikon/text och rund vald indikator. Ingen fylld fyrkant. Befintlig historik och Android Tillbaka behålls. |
| Plan och registrering | Gemensam kompakt kort- och rubrikskala, tydliga registreringsvärden och befintliga plan-/datumhandlingar. Inga nya dataskrivvägar. |
| Statistik | Översikt, Hälsa, Ekonomi och Historik väljer mellan befintliga beräkningar och texter. Översikt prioriterar diagram och tre sammanfattningar. Filter, stödjande förklaringar och fördjupning finns kvar. |
| SOS | Samma petrol-/mintkort, tydligare andningsring, bevarade 4–2–6-steg, timer, vibration och formulär. Ingen automatisk registrering införs. |
| Profil, konto och inställningar | Kompaktare profilrader och kort, ikoner för inställningskategorier och temaval som visar ikon/beskrivning/vald radioknapp. Switchar, integritetsval och kontoåtgärder behålls. |
| Onboarding | Sol-/skogsscen och vektorblad med samma visuella identitet; befintliga fyra steg, validering, gästläge och kontoalternativ behålls. |
| Sekundära vyer/dialoger | Samma kort-, typografi- och radieskala för historik, data, kunskap, resa, egna modalbekräftelser och återhämtning. |

Illustrationerna är repoägda SVG-komponenter (`JourneyLandscape`, `BrandMark`), inte bilder av falska appdata. Ingen ny native-modul eller bibliotek tillkommer. Befintlig launcherikon/splash är inte utbytt av denna JS-anpassning.

## Innehåll och säkerhet

Referensens 28 dagar, belopp och procentsatser hårdkodas inte. Ringen visar fortfarande dagens verkliga antal/mål, och procenten är använd andel av dagsmålet. Bekräftat rökfria dagar blandas inte ihop med dagar utan registrering. Den gemensamma SVG-renderaren och geometrin används även vid förhandsvisning och PNG-delning; större systemtext ger en växande staplad layout. Diagram visar verkliga registreringar med korrekt etikett.

Bildens livstids-/lungfunktionspåståenden, privata låsskärmsstatistik och etiketten redo för release införs inte som faktauppgifter. Nya funktioner i skissen, exempelvis en separat återfallsdatamodell, språkbyte och fristående avancerade inställningar, får inte bli dekorativa knappar utan fungerande flöde. Medicinska texter och privata notisgränser ändras inte här. Inga auth-, lagrings-, synk-, raderings-, hemlighets- eller Firestore-regeländringar ingår.

## Verifiering

TypeScript och 353 ordinarie tester PASS före push. Samtliga vyer renderas i båda teman i den befintliga renderingssviten. Ett nytt beteendetest går igenom samtliga statistikflikar och verifierar att data inte muteras. Kontrastkontroller omfattar text på samtliga ytor och fyllda handlingar. Geometritester täcker stora systemtypsnitt, nollmål, överskridet mål och stora tal. Navigations-/konto-/delningsregressioner behålls.

Detta är kod- och renderingskontroller, inte slutlig visuell acceptans av varje Android-vy. Lokal Preview-APK byggs för faktisk mobilgranskning; inga byggen i molnet eller OTA-/produktionspubliceringar ingår. Native-konfigurationen är oförändrad, så ny native-runtime krävs inte av designkoden. En uppdaterad fristående APK behövs för att få den nya inbyggda JS-bundlen till mobilen. Behåll signering/inloggning/historik med `adb install -r`. Utförda enhetsresultat noteras i PR efter körning; TalkBack och full enhetsmatris är fortfarande öppna i fas 25.
