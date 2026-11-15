# Fortsättning – Smoke Less

- Aktiv fas: **16.5 – personlig dashboard**, branch `feat/phase-16-5-personal-dashboard`, PR https://github.com/Wolfyslayer/Smoke-less-app/pull/162.
- Bas: uppdaterad lokal main `07ff48c315f7d535da56f3053594f503cfd0bc00`.
- Fas 16.4 är avslutad och mergad i PR #161. `validate` och `rules` gröna på slutlig head `d19dd36`; 159 lokala tester och TypeScript godkända. 8/8 huvudpunkter och 32/32 delpunkter klara på kod-/test-/dokumentationsnivå. Fysisk Android-, BrowserStack- och TalkBack-QA återstår i fas 25.
- Main:s debug-keystore-plugin och app.json-post har bevarats oförändrade. Inga hemligheter eller regler ändrades.

## Fas 16.5

Fast checklista finns i `docs/PHASE_16_5_DASHBOARD.md`, kopierad från roadmapens ursprungliga 8×4-punkter. Verifierat på `ee6fffd` med grön CI: 7/8 huvudpunkter (87,5 %) och 31/32 delpunkter (96,875 %). Kortval, ordning, återställning, lokal persistens och UI är implementerade. TypeScript och 166 lokala tester är godkända. Fysisk QA är inte utförd.

Nästa steg: kontrollera båda CI på slutdokumentationscommitten, kontrollera PR-head/mergebarhet och merga #162 först när båda är gröna. Uppdatera därefter roadmap och fasfil med faktiskt merge-SHA innan 16.6. Registrering och SOS förblir direkt åtkomliga. Datamodell, Firestore-regler och molnsynk är oförändrade. Ny Android-build: NEJ, bara TypeScript, testscript och dokumentation; inga beroenden tillkom.

## Arbetsregler och risker

- Användarens beslut 2026-11-15: AI kontrollerar själv båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna. Separat klartecken krävs inte mellan commits.
- Vid röd CI: felsök och rätta i samma PR. Bevara alltid lokala ändringar. Ingen destruktiv Git-åtgärd är godkänd.
- Äldre roadmapchecklista för 16.4 har avvikande ordalydelse; den avslutade fasfilen och PR #161 dokumenterar faktiskt resultat. Äldre QA-hänvisningar till fas 17 är ersatta av fas 25 enligt senare masterplan.
- Ny Android-build för dashboardens planerade TypeScript-/lagringsarbete: **NEJ**, om inga native-beroenden eller konfigurationer ändras.
- EAS Update ska planeras i en separat senare PR enligt roadmapens prioriteringar, utan automatisk produktionspublicering.

## Återuppta

Läs AGENTS.md, AI_WORKFLOW.md, roadmapen och aktiv fasplan. Kontrollera arbetskatalog, aktuell PR/head och CI innan ändringar. Uppdatera denna fil vid nästa verkliga milstolpe.
