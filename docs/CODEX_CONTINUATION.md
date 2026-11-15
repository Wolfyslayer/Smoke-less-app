# Fortsättning – Smoke Less

## Aktuellt

- Fas **20.0 – långsiktigt stöd och underhåll**.
- Branch `feat/phase-20-maintenance-support`, från uppdaterad main `9d0505e`.
- En fas-PR öppnas för denna branch; hitta den på GitHub och skapa inte dubblett.
- Fast checklista: `docs/PHASE_20_MAINTENANCE.md`. 0/8 och 0/32 verifierade (0 %). Implementation återstår.

## Senaste avslutade arbete

Fas **16.7** mergad i PR #164 som `1781333`. Slutlig head `34055f4` hade båda obligatoriska CI gröna. 8/8 huvudpunkter och 32/32 delpunkter klara på kod-/test-/dokumentationsnivå. TypeScript och 182 tester godkända lokalt (166 ordinarie, 10 storage, 6 migration).

Kalenderjämförelser visar avslutade veckor/månader, avstämningstäckning, registrerade dagsgenomsnitt och röksug. Saknad data räknas inte som bekräftad rökfrihet. Rekord kräver bekräftade dagar utan cigarettposter; motstridig data nekas. Planmål före senaste planstart anges som saknade. Dashboard och äldre milstolpar är samordnade. Nya aggregat och dashboardmått memoiseras per dataändring/minut. Historik och molnsynk är oförändrade.

Tidigare faser: 16.4 PR #161 (`07ff48c`), 16.5 PR #162 (`a3c53e8`), 16.6 PR #163 (`525b07b`) mergade med grön CI. Main:s debug-keystore-plugin och app.json har bevarats.

## Nästa konkreta steg

Implementerat gemensam modell och SVG-renderare i startsida, förhandsvisning och PNG. Bilden visar kvar av mål, mindre ring och samma stödtext. FontScale får kortet att växa/staplas och ogiltigförklarar gamla exporter. En statisk bildöversikt renderad från faktisk komponent finns i docs/assets/phase17-progress-review.png; visuell inspektion är utförd, men inte Android-export. TypeScript och 183 tester passerar lokalt.

Fas 17 mergad #165 (`0fdd4b1`), fas 18 #166 (`2857e3f`), fas 19 #167 (`9d0505e`), slutlig head `e460027` grön validate/rules. TypeScript och 195 tester passerade. Nästa steg: verifiera start-CI och implementera underhållskort i valt underhållsläge, frivillig uppföljning och veckovis alternativ till befintliga dagliga påminnelser. Återanvänd bekräftade rekord och SOS-planer utan automatisk nollställning. Fortsätt sedan genom roadmapen. Fysisk PNG/systemdelning och TalkBack kvarstår i fas 25.

## Regler och risker

- Användaren har beslutat 2026-11-15 att AI själv kontrollerar båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna; separat klartecken behövs inte mellan commits. Röd CI rättas i samma PR.
- Fysisk Android-, BrowserStack-, TalkBack-, offline-, tvåenhets- och PNG/systemdelnings-QA återstår i fas 25. Statiska kontrakt ersätter inte dessa tester.
- **Ny Android-build: NEJ** för genomförd 16.7 och denna dokumentationsmilstolpe. Inga nya native-beroenden eller inställningar, regler eller hemligheter införda.
- EAS Update ska ha en separat senare PR enligt roadmapen, utan automatisk produktionspublicering.

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, faktisk PR-head och CI innan återupptagning. Bevara lokala ändringar och avsluta aktiv fas före nästa roadmapfas.
