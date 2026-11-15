# Fortsättning – Smoke Less

## Aktuellt

- Fas **25.0 – slutlig QA, säkerhet och release**.
- Branch `feat/phase-25-release-readiness`, från uppdaterad main `d606126`.
- En PR öppnas för denna branch; hitta den på GitHub och skapa inte dubblett.
- Fast checklista: `docs/PHASE_25_RELEASE.md`. 0/8 och 0/32 (0 %) verifierade. Implementation återstår.

## Senaste avslutade arbete

Fas **16.7** mergad i PR #164 som `1781333`. Slutlig head `34055f4` hade båda obligatoriska CI gröna. 8/8 huvudpunkter och 32/32 delpunkter klara på kod-/test-/dokumentationsnivå. TypeScript och 182 tester godkända lokalt (166 ordinarie, 10 storage, 6 migration).

Kalenderjämförelser visar avslutade veckor/månader, avstämningstäckning, registrerade dagsgenomsnitt och röksug. Saknad data räknas inte som bekräftad rökfrihet. Rekord kräver bekräftade dagar utan cigarettposter; motstridig data nekas. Planmål före senaste planstart anges som saknade. Dashboard och äldre milstolpar är samordnade. Nya aggregat och dashboardmått memoiseras per dataändring/minut. Historik och molnsynk är oförändrade.

Tidigare faser: 16.4 PR #161 (`07ff48c`), 16.5 PR #162 (`a3c53e8`), 16.6 PR #163 (`525b07b`) mergade med grön CI. Main:s debug-keystore-plugin och app.json har bevarats.

## Nästa konkreta steg

Implementerat gemensam modell och SVG-renderare i startsida, förhandsvisning och PNG. Bilden visar kvar av mål, mindre ring och samma stödtext. FontScale får kortet att växa/staplas och ogiltigförklarar gamla exporter. En statisk bildöversikt renderad från faktisk komponent finns i docs/assets/phase17-progress-review.png; visuell inspektion är utförd, men inte Android-export. TypeScript och 183 tester passerar lokalt.

Faserna 17–20 är mergade i #165–#168. Senaste main `7cb70a4`, slutlig head `6861470` grön validate/rules, TypeScript och 198 tester. Nästa steg: verifiera start-CI för fas 21 och färdigställ källbelagda generella stödtexter med verifierade 1177-/Sluta-röka-linjen-länkar, kontrolldatum och offlineinnehåll. Ingen personlig dosering eller känslig inmatning. Fortsätt direkt till fas 22 efter acceptans/merge. Fysisk notis-, PNG-, Android- och TalkBack-QA kvarstår i fas 25.

## Regler och risker

- Användaren har beslutat 2026-11-15 att AI själv kontrollerar båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna; separat klartecken behövs inte mellan commits. Röd CI rättas i samma PR.
- Fysisk Android-, BrowserStack-, TalkBack-, offline-, tvåenhets- och PNG/systemdelnings-QA återstår i fas 25. Statiska kontrakt ersätter inte dessa tester.
- **Ny Android-build: NEJ** för genomförd 16.7 och denna dokumentationsmilstolpe. Inga nya native-beroenden eller inställningar, regler eller hemligheter införda.
- EAS Update ska ha en separat senare PR enligt roadmapen, utan automatisk produktionspublicering.

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, faktisk PR-head och CI innan återupptagning. Bevara lokala ändringar och avsluta aktiv fas före nästa roadmapfas.
