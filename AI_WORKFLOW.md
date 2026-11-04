# AI_WORKFLOW.md – obligatoriskt arbetsflöde för Smoke Less

Den här filen är den gemensamma arbetsinstruktionen för AI-assistenter och utvecklare. Läs den **innan** du ändrar kod, skapar commits eller hanterar en pull request. Läs också `docs/MASTER_ROADMAP.md`, aktuell fasplan, PR-beskrivning och senaste CI-status. Masterplanen anger fasernas ordning och omfattning; den aktiva PR:ns fasta checklista anger verifierad framdrift. Använd den senaste uppdaterade huvudchecklistan i fasens PR som källa till status.

## Testpolicy: slutlig gemensam QA-fas
- Samla omfattande manuella Android-, BrowserStack-, tillgänglighets- och regressionstester i fas 17.0 före offentlig lansering. Flytta kvarstående manuella acceptanspunkter dit utan att markera dem godkända.
- Under funktionsfaser: behåll relevanta automatiska tester och obligatorisk grön CI, samt riktade manuella tester när risk motiverar det.
- Blockerande säkerhetsfel, dataförlust, felaktig kontoåtkomst eller trasig kärnfunktion måste åtgärdas direkt; de får inte skjutas upp.
- Dokumentera i fas-PR vilka manuella kontroller som flyttats till slutfasen.

## En fas = en pull request
- Arbeta **endast i den aktiva fasens befintliga branch och PR**. Skapa inte en ny PR för varje uppgift, fix eller commit.
- Alla commits för fasen läggs i samma PR tills fasen är klar. Gör inte ändringar direkt på `main` under pågående fas.
- Gör **meningsfulla, sammanhängande commits** som ger mätbar funktionalitet eller avhjälper konkreta problem. Samla relaterad kod och tester i **samma commit** så att inte halvfärdiga ändringar orsakar röda CI-kontroller.
- Följ fasens fastställda huvudchecklista i ordning. Skapa inte nya deluppgifter som skjuter upp fasavslut i onödan. Särskilj huvudpunkter och underuppgifter; ändra inte nämnaren utan ett uttryckligt beslut.

## Firestore-regler: samla ändringar till sista säkerhetsfasen
- **Standardregel:** Planera och samla alla icke-blockerande ändringar i `firestore.rules` och tillhörande regeltester till en **gemensam avslutande säkerhetsfas före offentlig lansering**, efter övriga funktionsfaser. Dokumentera behov och beroenden i masterplanen, men ändra inte reglerna i vanliga funktions-PR:er.
- **Undantag endast när nödvändigt:** Om en funktion i den aktiva fasen inte kan fungera säkert eller korrekt utan ändrade Firestore-regler, skapa **en separat, avgränsad PR mot `main`** för just de nödvändiga regeländringarna och testerna. Kör och verifiera Firestore-regel-CI, merga den PR:en innan funktionen betraktas som klar. Dokumentera beroendet i fas-PR:en.
- **Inga genvägar i säkerheten:** Skjut aldrig upp en regeländring som krävs för åtkomstkontroll, integritet, korrekt dataseparering eller säker drift. Utöka aldrig behörigheter bara för att få CI grönt.
- **CI-optimering:** Låt vanliga funktions-PR:er vara fria från Firestore-regeländringar så att regel-workflowens ändringsdetektion kan hoppa över onödiga emulatortester. Ändra inte CI för att kringgå obligatoriska tester när relevanta regler eller säkerhetsberoenden ändras.
- **Avslutande fas:** Granska och testa samtliga uppskjutna regelbehov tillsammans med säkerhet, kontoradering, synk och Firebase-konfiguration **innan** release till Google Play. Skapa en separat PR för den samlade regeluppdateringen; verifiera emulator, negativa behörighetstester och regressioner.

## CI-grind och användarens klartecken
1. Gör nästa meningsfulla ändring på den aktiva fasens branch och dokumentera vad den löser.
2. Kontrollera att tester/CI körs på **senaste commit**. Rapportera korrekt status; påstå aldrig att tester är gröna innan de faktiskt är det.
3. **Vänta på att användaren säger att kontrollerna är gröna** innan du fortsätter till nästa punkt eller commit. Om de är röda, åtgärda felet i **samma PR**.
4. När användaren bekräftar grönt: fortsätt automatiskt med nästa kvarvarande punkt i **samma fas och PR**. Fråga inte om nytt godkännande för varje rutinmässigt steg.
5. **Efter varje commit ska AI kontrollera om en ny Android-build krävs**. Granska särskilt ändringar i `package.json` och lockfil, Expo-plugins, `app.json`, `android/`, Firebase-konfiguration, Android-behörigheter, appikon, splash och andra nativa resurser. Rapportera alltid **Ny Android-build: JA/NEJ**, kort motivering och, vid JA, vilka bygg- och installationskommandon användaren ska köra. Vid osäkerhet: redovisa osäkerheten och rekommendera verifierande build. Enbart server-, test- och dokumentationsändringar kräver normalt ingen ny native build. JavaScript-/TypeScript-ändringar kan normalt testas genom omladdning av utvecklingsappen men behöver fortfarande funktionstestas. Fysiska testresultat får aldrig hittas på.

## Obligatorisk rapport i chatten efter VARJE commit
Efter varje commit, visa en uppdaterad **checklista över fasens samtliga huvudpunkter**, med `[x]` för verifierat klara och `[ ]` för återstående. Visa även en **completion-stapel**, antal klara/total och procent, t.ex.:

`███████░░ 7/9 (78 %)`

Ange commit-SHA, PR-länk, vad som faktiskt ändrats, CI-status (väntar/grön/röd) och vad som ska ske när användaren bekräftar testerna. Visa TVÅ separata framstegsmått: färdiga huvudpunkter/alla huvudpunkter och verifierade delpunkter/alla delpunkter, båda med procent. Visa varje huvudpunkt med egen delpunktsräknare (t.ex. 2/4) och underliggande fasta delpunkter med `[x]`/`[ ]` i varje rapport. Räkna bara verifierade delpunkter, aldrig enbart kod som ännu inte testats. Huvudpunkten får `[x]` först när alla dess delpunkter är verifierade. Ändra inte fasta delpunkter eller nämnare utan uttryckligt beslut; undvik att skapa nya delpunkter för att förlänga fasen. Om en punkt ännu inte är verifierad, lämna den omarkerad.

## Detaljerad checklista och beständig AI-plan
- Varje aktiv fas ska ha en fast numrerad underchecklista i `docs/MASTER_ROADMAP.md`, med 3–5 konkreta, testbara delpunkter per huvudpunkt. Fas 8 har exakt fyra per huvudpunkt (32 totalt).
- Rapportera efter varje commit **samtliga huvudpunkter med delpunktsstatus**, två framstegsmått och vad som återstår i den aktiva huvudpunkten. Redovisa verifierad status; nya commits med väntande CI räknas inte automatiskt som verifierade.
- Synka checklistan mellan masterplan, PR-beskrivning och chatten. Vid skillnad: kontrollera faktisk implementation, tester och senaste CI innan status justeras. Ingen falsk avprickning.
- Kommande faser ska få en fast underchecklista när fasens PR öppnas, innan implementationen börjar.

## Fasavslut, merge och nästa fas
- När **alla huvudpunkter är genomförda och verifierade**, fasens automatiska acceptanskriterier och eventuella riskkritiska riktade tester är godkända, och senaste commit har gröna obligatoriska kontroller: **merga fasens befintliga PR till `main`**. Merga inte innan dessa villkor är uppfyllda.
- Meddela därefter användaren att köra:
  ```bash
  git checkout main
  git pull origin main
  ```
  Om användaren redan står på `main`, räcker `git pull origin main`.
- Fortsätt sedan till **nästa dokumenterade fas** och skapa **en** PR för den fasen. Om ingen fas finns: planera och föreslå nästa meningsfulla uppgraderingsfas för appen, med prioriterade funktioner och testbara acceptanskriterier, innan implementationen börjar.
- Behåll användarens fokus: en fungerande, vältestad Android-app och tydlig framdrift, inte många små PR:er.

## Aktuell fas och historik
- Aktuell fas och PR finns i `docs/MASTER_ROADMAP.md`. Verifiera alltid mot GitHub innan du arbetar.
- Fas 7.0 avslutades i PR #138. Fas 8.0 mergades i PR #140. Fas 9.0 är nästa utvecklingsfas; bred manuell QA samlas i fas 17.0.
- Ändra roadmap-status när en fas verkligen mergats och verifierats, inte när enstaka commits skapats.
