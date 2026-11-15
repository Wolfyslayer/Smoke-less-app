# Fortsättning – Smoke Less

## Aktivt arbete

- Fas 16.4, PR https://github.com/Wolfyslayer/Smoke-less-app/pull/161 (öppen draft).
- Branch: `feat/phase-16-4-ui-safe-area-audit`.
- Senast verifierad fjärrcommit: `da974ab`, båda obligatoriska CI gröna. Denna fils commit innehåller nästa milstolpe.
- Verifierad checklista: `docs/PHASE_16_4_UI_SAFE_AREA.md`, oförändrade 8 huvudpunkter och 32 delpunkter. 6/8 huvudpunkter (75 %), 29/32 delpunkter (90,625 %). Nya ändringar räknas inte som verifierade innan CI.
- GitHub `validate` och `rules` var gröna på `da974ab`. Kontrollera båda på den nya committen efter push.

## Senaste milstolpe

Ren lokal branch uppdaterades med fast-forward från `5d2cb35` till `e8673f9`. Ingen lokal ändring skrevs över. Rättade saknade nedre insets på onboardingens inloggningslänk och login före onboarding samt sidoinsets på huvudflikar och bottennavigation. Huvudflikarnas nederkant ägs fortsatt av den separata bottennavigationen. Ett källkodsbaserat regressionstest skyddar dessa kontrakt; det mäter inte renderad Android-geometri.

Nästa milstolpe åtgärdar modalernas sidoinsets, Android-tangentbord i auth-modal, knapptryck i kontoscroll och kalenderlayout. Kalendern växlar till fullbreddslista vid smal skärm eller stor text. Onboardingens textfönster kan växa. Lokalt: TypeScript godkänd, ordinarie testsvit 142/142, storage 10/10 och migration 6/6 godkända. Fjärr-CI för den nya committen måste verifieras efter push.

## Kvarstår och nästa steg

Efter push kontrollerar AI själv båda obligatoriska CI på senaste PR-commit och fortsätter när de är gröna enligt användarens beslut 2026-11-15. Separat klartecken krävs inte mellan commits. Fortsätt med kvarvarande granskning och verifiering enligt faschecklistan. Dokumentera faktiska resultat i skärmmatrisen. Ingen fysisk Android-QA är utförd i detta arbetspass.

Senaste kodpaketet förbättrar Historik (48 dp + unik etikett), SOS/Statistik/bottenflikar (radbrytbara val och tryckytor), Backup-rubriker, diagramhöjd och scrollbara sessionsfel. TypeScript och 143 ordinarie tester passerar. Nästa steg efter grön CI: slutavstämning av statiska punkter 2, 4, 5 och 6, därefter bevara senaste main/debug-keystore-pluginet och verifiera acceptans inför merge. Ingen fysisk verifiering ska bockas av.

## Risker och dokumentkonflikter

- Roadmapens äldre checklista för 16.4 skiljer sig i ordalydelse och status från den aktiva fasfilens verifierade 8×4-checklista. Använd den aktiva fasfilens ID och status; ersätt inte delpunkter med äldre roadmaptext.
- AI_WORKFLOW.md har äldre hänvisningar till fas 17 som slut-QA. Senare masterplan och användarens instruktion anger fas 25. Detta gäller bred fysisk QA, inte riskkritiska fel.
- `origin/main` (`30670d7`) har integrerats utan konflikter. Debug-keystore-pluginet och dess app.json-post är oförändrade från main. Ingen keystore eller hemlighet har lagts till. Detta paket innehåller även sista 48 dp-korrigeringarna för onboardingval och tekniska detaljer.
- PR-beskrivningen har synkroniserats med fasfilens checklista; fortsätt hålla dessa uppdaterade.
- Native-build för UI-korrigeringarna: **NEJ**, endast TypeScript/test/dokumentation. Synken återför main:s befintliga native-plugin; ingen ytterligare native-ändring jämfört med main görs. Vid nygenerering av Android-projekt ska main:s etablerade keystore-miljövariabler användas. Riktad Android-verifiering av systemfält återstår i fas 25.

## Återuppta

Läs AGENTS.md och de refererade projektfilerna, kontrollera arbetskatalog, senaste PR-head och CI. Fortsätt självständigt efter gröna kontroller i samma PR. Avsluta 16.4 innan nästa roadmapfas. EAS Update ska ha en separat senare PR.
