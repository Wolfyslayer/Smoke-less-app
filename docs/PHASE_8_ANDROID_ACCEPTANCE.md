# Fas 8.0 – Android-acceptansprotokoll

Detta protokoll skiljer **automatiskt verifierade tester** från **manuella Android-tester**. Markera inte 7.3, 7.4, 8.1 eller 8.2 som färdiga förrän testaren har bekräftat utfallet. Använd testkonton och testdata; ändra inte produktionsdata.

## 7.3 – TalkBack och tryckytor

- [ ] Slå på TalkBack i Androids tillgänglighetsinställningar. Navigera genom planvyn utan att använda synen; verifiera logisk fokusordning.
- [ ] Kontrollera att rubriker, dagens mål, delmål, taktval, förhandsvisning och framsteg läses begripligt; vald takt ska anges.
- [ ] Öppna datumväljaren, byt månad, välj datum, avbryt och bekräfta. Kontrollera att knappar har begriplig uppläsning och att fokus inte fastnar bakom dialogen.
- [ ] Kontrollera tryckytor för datumceller, navigering, avbryt, spara och omstart. Dokumentera eventuella svårträffade element och skärmbilder.

## 7.4 – Små skärmar och maximal text

- [ ] Ställ Androids textstorlek till max. Kontrollera planvyn, taktval, mål, förhandsvisning och datumdialogen utan överlappning eller avklippta kontroller.
- [ ] Ställ skärmstorleken till största läget och upprepa. Alla primära handlingar ska vara åtkomliga via scroll vid behov.
- [ ] Kontrollera minsta tillgängliga skärmläge och standardtextstorlek.
- [ ] Ändra text-/skärmstorlek medan appen ligger i bakgrunden och återvänd. Verifiera att Expo Router inte visar dubbla linking-hanterare. Detta kräver **ny Android-build efter PR #147**, annars är testet inte giltigt.
- [ ] Kontrollera att appen fungerar efter full omstart med den nya storleken.

## 8.1 – Funktionell acceptans

- [ ] Ny användare: välj **sluta direkt**; dagens mål ska bli noll och sparas efter omstart.
- [ ] Ny användare: välj **gradvis nedtrappning**; byt takt, jämför förhandsvisningen och bekräfta/avbryt.
- [ ] Ny användare: välj **planerat stoppdatum**; kontrollera kalendergränser, passerat datum, förhandsvisning och sparad plan.
- [ ] Ändra plan flera gånger och starta om den; tidigare registreringar och besparingsstart ska inte försvinna.

## 8.2 – Gästläge, historik och synk

- [ ] Gäst utan nätverk: ändra plan, registrera cigarett och starta om appen. Kontrollera att plan och historik finns kvar.
- [ ] Logga in med testkonto och verifiera att gästens data inte tyst skriver över en annan användares data.
- [ ] På två testinstallationer med samma testkonto: ändra planen på båda och verifiera att konflikter visas/hanteras utan tyst överskrivning.
- [ ] Logga ut, byt testkonto och logga in igen. Kontrollera isolering av plan och historik.

## Slutgrind

- [ ] Alla ovanstående manuella tester godkända eller dokumenterade avvikelser åtgärdade.
- [ ] Båda obligatoriska CI-kontrollerna gröna på **slutlig commit**.
- [ ] PR #140 mergas först efter bekräftad Android-acceptans.

**Testprotokoll:** Skriv datum, enhet, Android-version, app-commit, PASS/FAIL och kort felbeskrivning vid varje genomförd testomgång. Ingen ruta i detta dokument innebär automatiskt att ett test har körts.
