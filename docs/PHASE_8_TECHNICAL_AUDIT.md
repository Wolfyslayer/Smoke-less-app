# Fas 8.0 – teknisk inventering och kompatibilitetskontrakt

## Verifierade befintliga delar
- `src/domain.ts`: `Profile` har `mode: 'reduce' | 'quit'`, `speed: gentle | balanced | fast`, `startAt`, `dailyTargetOverride`, valfria `planStartTarget` och `originalStartAt`. `target()` ger 0 i quit-läge; reduce sänker dagsmålet en cigarett per 7/4/2 dagar. `quitDate()` beräknar datum från start och takt.
- `src/screens/PlanScreen.tsx`: visar dagsmål, nedtrappning, sjudagarsavstämning, återhämtningsstöd, taktval och 14 kommande mål. Taktbyte bevarar historik och räknar vidare från dagens grundmål.
- `src/hooks/useSmokeLessSessionModel.ts`: sammanbinder onboarding, plan, lokal lagring, kontoflöde och synkronisering. `changeProfile` från `useSessionActions` används för planändringar.
- `src/hooks/useCloudSync.ts`: synkroniserar på kontot med debouncing och skydd mot samtidiga lokala ändringar; profilen ingår i molndata.
- `src/cloudSync.native.ts`: skapar saknade Firestore-dokument transaktionellt men **skriver inte över en redan befintlig fjärrprofil**. Profiländringar måste därför granskas särskilt före implementation; vi får inte lova att de synkroniseras mellan enheter utan verifiering.

## Risker och designbeslut
1. **Bakåtkompatibilitet:** ändra inte innebörden av befintliga `reduce`/`quit` eller redan lagrade profilfält. Utöka med valfria fält och standardvärden för gamla profiler.
2. **Stoppdatum:** nytt planerat stoppdatum ska inte förväxlas med `startAt` (planens start) eller `originalStartAt` (besparingshistorik). Separat valfritt fält och entydig prioritet i `target()`/`quitDate()` krävs.
3. **Tidszon och datum:** dagliga mål ska baseras på lokala kalenderdagar, inte råa millisekunder genom sommartidsbyten. Testa månadsskiften och DST.
4. **Historik:** ändrade mål får aldrig skriva om `entries`, `cravings` eller `checkins`. Bevara `originalStartAt` för historiska beräkningar.
5. **Molnkonflikter:** nuvarande molnsynk är additiv och kan inte utan vidare uppdatera en existerande profil. Innan profiländringar marknadsförs som synkade krävs revisions-/konfliktstrategi och test mot Firestore-reglerna.
6. **Planvy:** `PlanScreen` visar redan mycket innehåll. Prioritera en kompakt huvudöversikt och tillgängliga expanderbara detaljer i stället för mer vertikal scroll.
7. **Säkerhet:** förändringar ska fungera i gästläge och får inte skriva till ett annat användarkonto.

## Rekommenderad implementationsordning
- Inför ren, testbar planmodell med tre användarval och kompatibel migrering.
- Lägg till UI för val och justering av plan utan att ändra registrerad historik.
- Lös synk av profiländringar med konflikt- och revisionsskydd; skriv emulator-/integrationstester.
- Avsluta med tillgänglighets- och Android-acceptanstest.

Inventeringen baseras på aktuell kod i PR #140 och är inte ett påstående om att senare punkter redan är implementerade.
