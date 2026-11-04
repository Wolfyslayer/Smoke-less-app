# Sista fasen – TalkBack och slutlig tillgänglighetskontroll

**Status:** Uppskjutet från fas 8.0 på användarens begäran. Inga TalkBack-tester är markerade som godkända.

**Tidpunkt:** Sista fasen före lansering. Denna kontroll är obligatorisk före slutligt lanseringsgodkännande, men blockerar inte merge av fas 8.0.

## Android / TalkBack

- [ ] Slå på TalkBack och navigera genom Plan-skärmen utan syn. Kontrollera logisk fokusordning.
- [ ] Kontrollera uppläsning av rubriker, dagens mål, delmål, taktval, förhandsvisning och framsteg; vald takt ska anges.
- [ ] Öppna datumväljaren, byt månad, välj datum, avbryt och bekräfta. Kontrollera uppläsning och att fokus inte fastnar bakom dialogen.
- [ ] Kontrollera tryckytor för datumceller, navigering, avbryt, spara, återgång till gradvis nedtrappning och omstart.
- [ ] Testa även onboarding, registrering, SOS, Inställningar och inloggning med TalkBack.
- [ ] Dokumentera datum, enhet, Android-version, app-commit, PASS/FAIL och eventuella reproducerbara fel.

## Slutgrind

- [ ] Alla TalkBack-fel som blockerar användning åtgärdade.
- [ ] Manuella TalkBack-tester bekräftade på fysisk Android-enhet före lansering.

Detta är en flytt av testansvar, inte ett undantag från slutlig tillgänglighetskontroll.
