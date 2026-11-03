# Fas 8.0 – Android-acceptansprotokoll

Detta protokoll skiljer **automatiskt verifierade tester** från **manuella Android-tester**. Markera inte 7.4, 8.1 eller 8.2 som färdiga förrän testaren har bekräftat utfallet. TalkBack i 7.3 är uttryckligen flyttat till sista fasen och är inte ett godkänt test. Använd testkonton och testdata; ändra inte produktionsdata.

## 7.3 – TalkBack (flyttat till sista fasen)

TalkBack-navigering, uppläsning, fokusordning och tillhörande tryckytor ingår inte längre i fas 8.0:s acceptansgrind. Testerna är uppskjutna, **inte godkända eller borttagna**. Se `docs/FINAL_PHASE_ACCESSIBILITY.md` för obligatorisk slutverifiering före lansering.

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

### 8.1a – Anpassning av dagsmål och byte av plan

- [ ] Välj **Minska gradvis** utan eget datum. Höj dagsmålet i Inställningar och kontrollera att beräknat stoppdatum flyttas framåt med samma valda takt.
- [ ] Sänk dagsmålet igen. Kontrollera att stoppdatum flyttas närmare och att kommande delmål räknas om.
- [ ] Välj eget stoppdatum på Plan-skärmen. Höj dagsmålet till **fler cigaretter än ursprunglig startnivå**. Kontrollera att stoppdatumet är oförändrat, att nedtrappningen anpassas och att målet är noll på stoppdatumet.
- [ ] Ändra dagsmålet flera gånger med eget stoppdatum. Kontrollera att historik, ursprunglig startnivå och besparingsstart bevaras.
- [ ] Välj **Återgå till minska gradvis** efter att ett datum valts i efterhand. Kontrollera bekräftelse/avbryt, att tidigare takt återkommer och att ett automatiskt slutdatum visas.
- [ ] Skapa en ny plan med **eget stoppdatum redan i onboarding**. Återgå därefter till gradvis nedtrappning på Plan-skärmen och kontrollera att samma beteende gäller.
- [ ] Kontrollera att **Sluta helt** fortfarande har dagsmål noll och inte kan ändras till ett positivt dagsmål via Inställningar.
- [ ] Kontrollera att knappar, bekräftelsetexter och datum inte klipps av vid maximal Android-textstorlek.

## 8.2 – Gästläge, historik och synk

- [ ] Gäst utan nätverk: ändra plan, registrera cigarett och starta om appen. Kontrollera att plan och historik finns kvar.
- [ ] Logga in med testkonto och verifiera att gästens data inte tyst skriver över en annan användares data.
- [ ] På två testinstallationer med samma testkonto: ändra planen på båda och verifiera att konflikter visas/hanteras utan tyst överskrivning.
- [ ] Logga ut, byt testkonto och logga in igen. Kontrollera isolering av plan och historik.

## Slutgrind

- [ ] Fas 8.0:s kvarvarande manuella tester godkända eller dokumenterade avvikelser åtgärdade. TalkBack är uppskjutet till sista fasen och blockerar inte denna merge.
- [ ] Båda obligatoriska CI-kontrollerna gröna på **slutlig commit**.
- [ ] PR #140 mergas först efter bekräftad Android-acceptans.

**Testprotokoll:** Skriv datum, enhet, Android-version, app-commit, PASS/FAIL och kort felbeskrivning vid varje genomförd testomgång. Ingen ruta i detta dokument innebär automatiskt att ett test har körts.
