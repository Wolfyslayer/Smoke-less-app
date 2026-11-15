# Fortsättning – Smoke Less

## Aktuellt

- Aktiv fas **16.7 – fördjupad statistik och personliga trender**.
- Branch `feat/phase-16-7-personal-trends`, från uppdaterad lokal main `525b07ba970d528ddafabb295504b2c111e99c29`.
- En ny fas-PR öppnas med denna dokumentationsmilstolpe. Hitta den via branchen på GitHub; skapa inte en till.
- Fast checklista: `docs/PHASE_16_7_TRENDS.md`, 0/8 huvudpunkter och 0/32 delpunkter verifierade (0 %). Implementation återstår.

## Avslutat i detta arbetspass

- **16.4:** PR #161 mergad som `07ff48c`. 8/8 och 32/32 på kod-/test-/dokumentationsnivå. Safe Area, responsiva modaler, större tryckytor, datumlista vid smal skärm/stor text och tillgänglighet granskade. Main:s debug-keystore-plugin och app.json bevarade identiska med main.
- **16.5:** PR #162 mergad som `a3c53e8`. 8/8 och 32/32 på samma verifieringsnivå. Dashboardkort kan väljas, ordnas och återställas; lokal lagring skiljer gäst från konto, hanterar skrivköer/fel och rör inte historik. Slutlig head `3f10f12` hade grön validate/rules.
- **16.6:** PR #163 mergad som `525b07b`. 8/8 och 32/32 på samma verifieringsnivå. Mål-/datumförhandsvisning med bekräftelse, fast/automatiskt datum, skydd för passerade datum och inaktuella profiler/dagar. Kalendern kräver framtida datum och nollställer inte urval vid nya Date-instanser från klocktick. Slutlig head `93f283e` hade grön validate/rules. TypeScript och 173 tester passerade lokalt (157 ordinarie, 10 storage, 6 migration).

## Nästa steg

Kontrollera CI på 16.7:s startcommit och fortsätt i samma PR. Inventera befintlig statistik och bygg rena kalenderperiodsaggregat före UI. Definiera vecka/månad, jämförbara perioder och hantering av saknad data. Noll registreringar får inte tolkas som bekräftad rökfrihet. Följ checklistans 32 ursprungliga delpunkter och testa datumgränser/DST, ofullständiga perioder och framtida data.

## Regler och kvarstående risker

- Användarbeslut 2026-11-15: AI kontrollerar själv båda obligatoriska CI på senaste PR-head och fortsätter när de är gröna; separat klartecken behövs inte mellan commits. Röd CI rättas i samma PR.
- Bred fysisk Android-, BrowserStack-, TalkBack-, offline- och tvåenhets-QA är inte utförd och kvarstår i fas 25. Statiska UI-kontrakt är inte renderade enhetstester.
- Ingen ny Android-build krävs för genomförda UI-/TypeScript-ändringar eller denna dokumentationsmilstolpe. Inga nya beroenden, regler, hemligheter eller native-konfigurationer infördes jämfört med main.
- EAS Update hör till en separat senare PR utan automatisk produktionspublicering. Börja inte nästa roadmapfas innan aktiv fas är korrekt avslutad.

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera arbetskatalog, PR-head och CI innan du återupptar.
