# Fas 32 – ansvar och underhåll

## Arkitektur och avgränsning

| Lager | Ansvar och källa till sanning |
| --- | --- |
| `SmokeLessSession` / `useSmokeLessSessionModel` | Samordnar den aktiva auth-sessionen, navigation, data och hooks. Aktuell UID verifieras innan asynkrona kontoresultat används. |
| `useLocalSession` / `localSessionStorage` | Aktiv lokal gäst-/kontosession och serialiserad lagring. Gästnyckeln `smoke-less-v6` och konto-prefixet `smoke-less-v6-account:` behålls. Läsfel får inte tolkas som tom historik. |
| Domän, `guestMerge`, `syncMerge`, `cloudSchema` | Validering, planberäkning och konfliktsäker sammanslagning. UI får inte vara alternativ lagringsauktoritet. |
| `useCloudSync` / native cloud-adaptrar | Debounce, köade återförsök, kontobunden synk och backup före ändrad lokal import. Serverdata läses/valideras innan onboarding kan ersätta en frånvarande lokal plan. |
| `accountDeletionFlow` / `accountDeletionSafety` / serverfunktioner | Raderingsprotokoll, kvitto och permanenta skrivspärrar. Ingen radering ingår i denna refaktorering. Retention/lås får inte kringgås av rollback. |
| `AppSessionView` / route-komponenter | Skärmval, Android Tillbaka och presentationsgränser. `AccountSyncGate` får endast fas, meddelande och återförsökshandling. Den importerar ingen Firebase- eller lagringsklient. |
| Tema/UI | Befintliga färg-, typografi-, radie- och tryckytetokens, reducerad rörelse och enhetslokalt temaval. Inga parallella temasystem tillkommer. |
| Buildvarianter / Preview-klient | Native identitet, kanal/runtime och validerat manifest. Ingen apphistorik kopplas till uppdateringsklienten. |

Belagt problem före ändring: UI jämförde den svenska framgångstexten för att tillåta onboarding/gästmigrering. Hookens status kunde samtidigt leva kvar efter ett kontobyte. Regressionstestet för konto A → B var rött före ändringen: det nya kontot fick gamla framgångstexten. Ett uttryckligt `SyncPhase` och UID-bunden status tar bort den kopplingen. Fas och status maskeras omedelbart för annan UID och nollställs vid byte. Sena resultat från tidigare UID publicerar ingen klarstatus i den nya sessionen.

`AccountSyncGate` innehåller samma vänt-/felpresentation och återförsök som tidigare. Detaljfältet heter nu anslutningsstatus eftersom råa SDK-fel inte längre visas. Sessionsbeslut och kontogrind ligger kvar i samordnaren; presentationskomponenten får tre tydliga props. Ingen allmän kontext, ny state-manager eller omlagd datamodell införs.

## Tester och prestanda

Regressionsfall skrevs och kördes före ändringen. De täcker kontobyte efter lyckad synk, sen avslutning från föregående konto, retry, lyssnarfel och övergång till gäst. Komponenttest täcker vänteläge, dold/expanderad status och uttryckligt återförsök. Befintliga navigations-, modal-, tema-, migrerings-, konflikt-, lagrings- och raderingstester behålls.

Ingen faktisk renderflaskhals är uppmätt. Därför görs ingen spekulativ memo-/callback-optimering och inga påhittade prestandasiffror redovisas. Fasta punkter 5.1/5.2 lämnas öppna för en relevant verklig profilering och endast motiverade åtgärder. Ingen ny appdependency införs för refaktoreringen.

## Bygg- och CI-hygien

Expo:s kompatibilitetskontroll hittade SDK 58-patchar som låg efter. Expo och berörda SDK-paket uppdaterades inom SDK 58, med låsfil. CLI kunde inte automatiskt skriva till den dynamiska konfigurationen; rekommenderade registreringar för `expo-sharing` och `expo-status-bar` lades därför till i app.json. Sharing-pluginens inkommande delning är avstängd som standard; ingen share-extension aktiveras. Main:s egna Android-/widget-/debug-keystore-plugins bevaras. Variantfabriken väljer fortsatt development, Preview och Production uttryckligt.

`expo install --check` och offentlig configläsning passerar efter ändringarna. Ny Android-build krävs för uppdaterade native-moduler/plugins och ny fingerprint. Ingen tidigare kompatibel OTA antas fungera med en annan fingerprint. Inga credentials eller Firebase-regler ändras. Användaren bygger senare; inga builds startas.

Snabba tester upptäcks automatiskt av `run-tests.cjs`; storage/migration körs separat. `validate` och `rules` är separata obligatoriska grindar. Rules-workflowet identifierar synkhookändringen och ska därför köra säkerhetstester, inte hoppa över dem. Pågående äldre körningar avbryts av befintlig concurrency. Android E2E och Preview-publicering är manuella; inget långsamt native-bygge läggs på varje PR. Ta inte bort negativa säkerhetstester för att spara CI-tid.

## Drift och felsökning

Läs först aktuell checklista, PR-head och senaste check-runs. Vid synkfel: verifiera aktiv UID och semantisk fas, därefter anslutning och säker återförsökshandling. Visa inte råa SDK-fel, tokens eller UID i produktgränssnittet. Vid datakonflikt: behåll båda ursprung och säkerhetskopian; skriv inte över för att få testet grönt. Vid raderingslås: följ kvitto-/återhämtningsprotokollet, återaktivera inte kontoskrivningar.

Fas 25 är fortsatt gemensam fysisk QA-/releasegrind. Äldre fas 17-hänvisningar i historiska anteckningar är inte aktuell fasordning. Faser 29–32 är separata staplade PR:er; kodarbetet är tillåtet av användaren medan nativeacceptans är öppen. Ingen av dem ska mergas som färdig eller roadmapen markeras färdig på grund av testförberedelser. Fas 26 kräver verklig lansering/återkoppling. Ingen fas efter 32 finns dokumenterad här.

Windows för senare Preview-build:

```powershell
$env:APP_VARIANT='preview'
eas build --platform android --profile preview
```

Behåll signeringsgrund och registrera rätt SHA före Google-acceptans. Se fas 29 för Firebase/EAS-miljö och uppdateringspublicering, fas 30 för releasehinder och fas 31 för disponibel QA-emulator. Ingen offentlig release eller OTA-publicering ingår.

Slutgranskning: även fel från lokal sessionsläsning/sparning och den äldre återställningshandlern använder nu samma säkra produktmeddelanden. Guarderna mot gammalt konto och överskrivning behålls. 19 riktade presentation-/storage-/migrationstester och TypeScript passerar. 3801bdb har grön validate/rules inklusive riktiga isolerade Auth-, Firestore- och Functions-emulatorer; den efterföljande felmeddelandepushen måste få egen grön senaste CI.
