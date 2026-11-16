# Fas 25 – säkerhetsgranskning och releaseblockerare

Granskad 2026-11-15. Inga hemligheter eller regelkällor ändrade. Befintliga regler och server har därefter driftsatts och provats enligt separat körprotokoll; grön CI ensam bevisar inte driftsättning.

## Verifierat

- Firestore: ägarskap per UID, stängda okända vägar/föräldradokument, fältwhitelist, revisioner, tombstones och serverägt raderingslås. Klienter kan inte skapa/ta bort låset eller hårdradera historik. Nio negativa/positiva emulatortester passerar lokalt.
- Serverns raderingsprototyp: färsk auth krävs; inga UID-parametrar accepteras; kända samlingar raderas före Auth; okända/nästlade data stoppar slutförandet; lease och permanent lås skyddar återförsök. 21 mockade tester passerar. Efterföljande driftsatt prov redovisas i `ACCOUNT_DELETION_DEPLOYMENT.md`.
- Nya lokala återställningskopior separeras nu mellan gäst och exakt UID. Båda kontovägarna skickar UID; gästreset använder gästnamnrymden. Gamla kopior och historik raderas inte automatiskt.
- Inställningar har nu en särskild engångsstädning av äldre omärkta kopior, med tydlig information om att flera konton/gästläge kan beröras och en separat permanent-raderingsbekräftelse. Exakta gamla nycklar tas bort; aktiv historik och nya märkta kopior bevaras. Nyckelinspektion är läsande. Partiella fel får inte rapporteras som lyckad radering. Funktionen har endast automatiska tester, inte körts på användarens kopior.
- Gästlagring faller inte längre tillbaka till tom historik vid läsfel, trasig JSON eller ogiltig data. Felet visas utan skrivning. Endast saknad post skapar en tom start; ogiltiga sparningar nekas.
- Nya stöd-/tips-/planpreferenser lagras enbart lokalt per identitet. Påminnelser är uttryckligen enhetslokala och deras meddelanden är generiska. Källänkar har inga historik- eller kontoparametrar.
- `npm test` upptäcker nu samtliga enhetssviter och serverns mockade säkerhetstester. Storage/migration och riktiga regeltester behåller separata körningar. Tidigare utelämnade tester granskas mot faktisk funktion, inte bara gammal text.

## Blockerande före offentlig lansering

1. **Nativ kontoradering och extern begäransväg återstår.** Servern och befintliga regler är driftsatta efter uttryckligt godkännande. Syntetiska konton verifierar faktisk egen radering, kontoisolering, permanent lås och återförsök. Appflaggan förblir avstängd före native-/tvåenhetsacceptans; se `ACCOUNT_DELETION_ACCEPTANCE.md`.
2. **Kopior och retention måste ingå i slutlig radering.** `smoke-less-pre-cloud-import-*` kan innehålla flera kontons historik och får inte raderas som om de tillhör en viss användare. En uttrycklig engångsstädning finns nu i kod, men måste verifieras med testdata och kopplas till slutlig raderingsacceptans. Nya v2- och migreringskopior är UID-märkta och ska ingå i kontots städning. Fastställ även retention och upplysningar före release.
3. **Produktionskonfiguration delvis verifierad.** Projekt `smoke-less-75efa`, paket `com.smokeless.app`, Firestore `eur3`, funktion `europe-west1`. Fakturering var aktiv, API:er aktiverades och server/regler driftsattes. Driftsatta regler matchar källan och serverproven passerar. Ingen betalplansändring eller manuell IAM-utökning gjordes. Full IAM-granskning, logg-/backupretention, låsens retention och återhämtningsansvar återstår. Se `ACCOUNT_DELETION_DEPLOYMENT.md`.
4. **Test-/produktionssignering.** Den lokala miljön saknar projektets privata signeringsvariabler. Manuella CI-byggen hade ingen konfiguration för main:s obligatoriska debug-keystore-plugin. De får nu en disponibel CI-testnyckel; detta är endast för färska QA-installationer. Bygget kan inte ersätta en installation med annan signatur och får inte publiceras till Play. Google OAuth behöver rätt testcertifikat; produktionssignering och OAuth måste verifieras separat. Befintlig keystore-plugin är bevarad och inga hemligheter ändras.
5. **Fysisk säkerhetsacceptans återstår.** Testa UID-byten och radering/offline på två isolerade installationer. Användarens verkliga telefonhistorik/konto får inte användas för destruktiva QA-fall.

## Återhämtning och drift

`functions/recoverDeletion.js` är som standard läsande och kräver betrodd operatör. Slutförande får bara bekräftas när Auth och alla granskade datavägar är tomma; låset ska behållas. Före release måste en ansvarig och kontaktväg finnas samt körning/återställning provas i testprojekt. Återställ inte raderat användarinnehåll från backup eller gamla klienter. En rollback får inte ta bort raderingslåset eller försvaga åtkomstkontrollen.

Klientens vanliga lagrings-/preferensvägar och migrationskopior använder nu samma skrivspärr, även efter sena async-svar. Befintliga sparningar dräneras före spärren så ett lokalt avbrutet förarbete inte tappar historik. Serverobserverad markör får inte rullas tillbaka av ett eget avbrott, och confirmed får aldrig sänkas till pending. Osäkra RPC-svar ger inte lokal radering. Serverloggningen skriver inte längre UID eller råa providerfel i felgrenen. Cache-/PNG-/widgetstädning och omstart måste fortfarande provas nativt innan releaseflaggan slås på.
