# AI_WORKFLOW.md – obligatoriskt arbetsflöde för Smoke Less

Den här filen är den gemensamma arbetsinstruktionen för AI-assistenter och utvecklare. Läs den **innan** du ändrar kod, skapar commits eller hanterar en pull request. Kontrollera också aktuell fasplan, PR-beskrivning och senaste CI-status. Använd den senaste uppdaterade huvudchecklistan i fasens PR som källa till status.

## En fas = en pull request
- Arbeta **endast i den aktiva fasens befintliga branch och PR**. Skapa inte en ny PR för varje uppgift, fix eller commit.
- Alla commits för fasen läggs i samma PR tills fasen är klar. Gör inte ändringar direkt på `main` under pågående fas.
- Gör **meningsfulla, sammanhängande commits** som ger mätbar funktionalitet eller avhjälper konkreta problem. Samla relaterad kod och tester i **samma commit** så att inte halvfärdiga ändringar orsakar röda CI-kontroller.
- Följ fasens fastställda huvudchecklista i ordning. Skapa inte nya deluppgifter som skjuter upp fasavslut i onödan. Särskilj huvudpunkter och underuppgifter; ändra inte nämnaren utan ett uttryckligt beslut.

## CI-grind och användarens klartecken
1. Gör nästa meningsfulla ändring på den aktiva fasens branch och dokumentera vad den löser.
2. Kontrollera att tester/CI körs på **senaste commit**. Rapportera korrekt status; påstå aldrig att tester är gröna innan de faktiskt är det.
3. **Vänta på att användaren säger att kontrollerna är gröna** innan du fortsätter till nästa punkt eller commit. Om de är röda, åtgärda felet i **samma PR**.
4. När användaren bekräftar grönt: fortsätt automatiskt med nästa kvarvarande punkt i **samma fas och PR**. Fråga inte om nytt godkännande för varje rutinmässigt steg.
5. **Efter varje commit ska AI kontrollera om en ny Android-build krävs**. Granska särskilt ändringar i `package.json` och lockfil, Expo-plugins, `app.json`, `android/`, Firebase-konfiguration, Android-behörigheter, appikon, splash och andra nativa resurser. Rapportera alltid **Ny Android-build: JA/NEJ**, kort motivering och, vid JA, vilka bygg- och installationskommandon användaren ska köra. Vid osäkerhet: redovisa osäkerheten och rekommendera verifierande build. Enbart server-, test- och dokumentationsändringar kräver normalt ingen ny native build. JavaScript-/TypeScript-ändringar kan normalt testas genom omladdning av utvecklingsappen men behöver fortfarande funktionstestas. Fysiska testresultat får aldrig hittas på.

## Obligatorisk rapport i chatten efter VARJE commit
Efter varje commit, visa en uppdaterad **checklista över fasens samtliga huvudpunkter**, med `[x]` för verifierat klara och `[ ]` för återstående. Visa även en **completion-stapel**, antal klara/total och procent, t.ex.:

`███████░░ 7/9 (78 %)`

Ange commit-SHA, PR-länk, vad som faktiskt ändrats, CI-status (väntar/grön/röd) och vad som ska ske när användaren bekräftar testerna. Räkna endast färdiga huvudpunkter; underuppgifter höjer inte procenten. Om en punkt ännu inte är verifierad, lämna den omarkerad.

## Fasavslut, merge och nästa fas
- När **alla huvudpunkter är genomförda och verifierade**, slutligt acceptanstest är godkänt och senaste commit har gröna obligatoriska kontroller: **merga fasens befintliga PR till `main`**. Merga inte innan dessa villkor är uppfyllda.
- Meddela därefter användaren att köra:
  ```bash
  git checkout main
  git pull origin main
  ```
  Om användaren redan står på `main`, räcker `git pull origin main`.
- Fortsätt sedan till **nästa dokumenterade fas** och skapa **en** PR för den fasen. Om ingen fas finns: planera och föreslå nästa meningsfulla uppgraderingsfas för appen, med prioriterade funktioner och testbara acceptanskriterier, innan implementationen börjar.
- Behåll användarens fokus: en fungerande, vältestad Android-app och tydlig framdrift, inte många små PR:er.

## Nuvarande fas vid införandet
- Fas: **7.0 – Betatestning, kvalitetssäkring och lanseringsförberedelser**
- Aktiv PR: **https://github.com/Wolfyslayer/Smoke-less-app/pull/138**
- PR-beskrivningens huvudchecklista är auktoritativ. Den kan ändras; läs den på nytt inför nästa steg.
- Pågående arbete får **inte** flyttas till en ny PR för denna instruktion.
