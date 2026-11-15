# Fortsättning – Smoke Less

## Aktuellt

- Fas **17.0 – delningsbild som matchar dagens framsteg**.
- Branch `feat/phase-17-share-progress-card`, från uppdaterad lokal main `1781333a1689ae7c163a0b7bf484bee01b3d5338`.
- Exakt en ny fas-PR öppnas med denna dokumentationsmilstolpe. Hitta den via branchen; skapa inte en till.
- Fast checklista: `docs/PHASE_17_SHARE_PROGRESS.md`. 0/8 huvudpunkter och 0/32 delpunkter verifierade (0 %). Implementation återstår.

## Senaste avslutade arbete

Fas **16.7** mergad i PR #164 som `1781333`. Slutlig head `34055f4` hade båda obligatoriska CI gröna. 8/8 huvudpunkter och 32/32 delpunkter klara på kod-/test-/dokumentationsnivå. TypeScript och 182 tester godkända lokalt (166 ordinarie, 10 storage, 6 migration).

Kalenderjämförelser visar avslutade veckor/månader, avstämningstäckning, registrerade dagsgenomsnitt och röksug. Saknad data räknas inte som bekräftad rökfrihet. Rekord kräver bekräftade dagar utan cigarettposter; motstridig data nekas. Planmål före senaste planstart anges som saknade. Dashboard och äldre milstolpar är samordnade. Nya aggregat och dashboardmått memoiseras per dataändring/minut. Historik och molnsynk är oförändrade.

Tidigare faser: 16.4 PR #161 (`07ff48c`), 16.5 PR #162 (`a3c53e8`), 16.6 PR #163 (`525b07b`) mergade med grön CI. Main:s debug-keystore-plugin och app.json har bevarats.

## Nästa konkreta steg

Kontrollera båda CI på fas 17:s startcommit och fortsätt i samma PR. Inventera startsidans faktiska framstegskort och befintlig SVG/PNG-export. Skapa en gemensam presentationsmodell för kvar av mål, använd procent och stödtext; återanvänd den i startsida, förhandsvisning och PNG. Bevara uttryckligt godkännande, känslig-data-gräns och befintliga skydd mot föråldrade exportsvar. Dokumentera visuell jämförelse utan att påstå fysisk Android-delning.

## Regler och risker

- Användaren har beslutat 2026-11-15 att AI själv kontrollerar båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna; separat klartecken behövs inte mellan commits. Röd CI rättas i samma PR.
- Fysisk Android-, BrowserStack-, TalkBack-, offline-, tvåenhets- och PNG/systemdelnings-QA återstår i fas 25. Statiska kontrakt ersätter inte dessa tester.
- **Ny Android-build: NEJ** för genomförd 16.7 och denna dokumentationsmilstolpe. Inga nya native-beroenden eller inställningar, regler eller hemligheter införda.
- EAS Update ska ha en separat senare PR enligt roadmapen, utan automatisk produktionspublicering.

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, faktisk PR-head och CI innan återupptagning. Bevara lokala ändringar och avsluta aktiv fas före nästa roadmapfas.
