# Fortsättning – Smoke Less

## Aktuellt

- Fas **19.0 – personliga handlingsplaner**.
- Branch `feat/phase-19-personal-action-plans`, från uppdaterad main `2857e3f`.
- Aktiv PR: https://github.com/Wolfyslayer/Smoke-less-app/pull/167.
- Fast checklista: `docs/PHASE_19_ACTION_PLANS.md`. 1/8 (12,5 %) och 6/32 (18,75 %) verifierade på startcommit `e442d15` med grön CI. Implementation inväntar egen CI.

## Senaste avslutade arbete

Fas **16.7** mergad i PR #164 som `1781333`. Slutlig head `34055f4` hade båda obligatoriska CI gröna. 8/8 huvudpunkter och 32/32 delpunkter klara på kod-/test-/dokumentationsnivå. TypeScript och 182 tester godkända lokalt (166 ordinarie, 10 storage, 6 migration).

Kalenderjämförelser visar avslutade veckor/månader, avstämningstäckning, registrerade dagsgenomsnitt och röksug. Saknad data räknas inte som bekräftad rökfrihet. Rekord kräver bekräftade dagar utan cigarettposter; motstridig data nekas. Planmål före senaste planstart anges som saknade. Dashboard och äldre milstolpar är samordnade. Nya aggregat och dashboardmått memoiseras per dataändring/minut. Historik och molnsynk är oförändrade.

Tidigare faser: 16.4 PR #161 (`07ff48c`), 16.5 PR #162 (`a3c53e8`), 16.6 PR #163 (`525b07b`) mergade med grön CI. Main:s debug-keystore-plugin och app.json har bevarats.

## Nästa konkreta steg

Implementerat gemensam modell och SVG-renderare i startsida, förhandsvisning och PNG. Bilden visar kvar av mål, mindre ring och samma stödtext. FontScale får kortet att växa/staplas och ogiltigförklarar gamla exporter. En statisk bildöversikt renderad från faktisk komponent finns i docs/assets/phase17-progress-review.png; visuell inspektion är utförd, men inte Android-export. TypeScript och 183 tester passerar lokalt.

Fas 17 mergad i #165 (`0fdd4b1`); fas 18 mergad i #166 (`2857e3f`). Fas 19 har nu stabila SOS-ID:n, privata max-tre-stegsplaner per situation, ordning/reset och direkt tipsval utan automatisk loggning. TypeScript och 195 tester passerar lokalt. Nästa steg: verifiera implementations-CI, slutgranska persistens/avbrott/tillgänglighet och merga #167 när acceptansen är uppfylld. Fortsätt därefter direkt till fas 20 enligt roadmapen. Fysisk PNG/systemdelning och TalkBack ligger kvar i fas 25.

## Regler och risker

- Användaren har beslutat 2026-11-15 att AI själv kontrollerar båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna; separat klartecken behövs inte mellan commits. Röd CI rättas i samma PR.
- Fysisk Android-, BrowserStack-, TalkBack-, offline-, tvåenhets- och PNG/systemdelnings-QA återstår i fas 25. Statiska kontrakt ersätter inte dessa tester.
- **Ny Android-build: NEJ** för genomförd 16.7 och denna dokumentationsmilstolpe. Inga nya native-beroenden eller inställningar, regler eller hemligheter införda.
- EAS Update ska ha en separat senare PR enligt roadmapen, utan automatisk produktionspublicering.

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, faktisk PR-head och CI innan återupptagning. Bevara lokala ändringar och avsluta aktiv fas före nästa roadmapfas.
