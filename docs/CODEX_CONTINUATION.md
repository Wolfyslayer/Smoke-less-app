# Fortsättning – Smoke Less

## Aktuellt

- Fas **16.6 – flexiblare planering**, PR https://github.com/Wolfyslayer/Smoke-less-app/pull/163.
- Branch `feat/phase-16-6-flexible-planning`, bas main `a3c53e8`.
- Senast verifierad implementationscommit: `f4231c3`, både validate och rules gröna.
- Verifierad checklista: `docs/PHASE_16_6_PLANNING.md`. 6/8 huvudpunkter (75 %) och 28/32 delpunkter (87,5 %). Sista bekräftelsefeedbacken i nästa commit räknas först efter egen grön CI.

## Senaste arbete

Implementerat dagsmålsförhandsvisning, sju dagars mål och bekräftelse/avbryt. Fast datum kan behållas eller tas bort till förmån för automatisk beräkning. Passerat datum kan inte skapa startAt efter plannedQuitAt. Gammal profil eller kalenderdag nekar applicering; aktuella historikarrayer behålls. Kalendern spärrar även dagens datum och kontrollerar framtida datum på nytt vid bekräftelse. Date-proppars tidsstämpel hindrar återställning vid klocktick.

Lokalt: TypeScript godkänd och 173 tester godkända (157 ordinarie, 10 storage, 6 migration). Inga nya beroenden, profilfält, Firestore-regler eller native-inställningar. **Ny Android-build: NEJ.**

## Nästa steg

Kontrollera båda CI på sista bekräftelsefeedbacken. Förhandsvisning stängs nu först när renderad profil motsvarar den bekräftade; en konflikt lämnar utkastet öppet med förklaring. Takt/datum och befintliga revisionsskydd är avstämda i fasplanen. Därefter återstår slutacceptans 6.1–6.2, 8.3–8.4 innan merge. Bred fysisk Android-, TalkBack-, offline- och tvåenhets-QA ligger i fas 25 och är inte genomförd.

## Avslutade faser

- **16.4:** PR #161 mergad som `07ff48c`. 8/8, 32/32 på kod-/test-/dokumentationsnivå. Debug-keystore-plugin och app.json från main bevarades oförändrade.
- **16.5:** PR #162 mergad som `a3c53e8`, grön slutlig PR-head `3f10f12`. 8/8, 32/32 på kod-/test-/dokumentationsnivå. Dashboardkort kan väljas, ordnas och återställas; lokal lagring är skild för gäst/konto. 166 tester passerade vid fasavslut.

## Återuppta och regler

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, aktuell PR-head och CI. Användarens beslut 2026-11-15: AI verifierar själv båda obligatoriska kontrollerna på senaste commit och fortsätter när de är gröna; separat klartecken krävs inte mellan commits. Röd CI rättas i samma PR. Bevara lokala ändringar och hemligheter. EAS Update hör till en separat senare PR. Nästa fas efter korrekt avslutad 16.6 är 16.7 enligt roadmapen.
