# Fas 7.0 – samlad releasegranskning och beslutspunkter

**Status:** intern Android-beta kan testas; **Google Play-publicering är inte godkänd**. Detta dokument samlar faktiska blockerare i stället för att skapa separata PR:er eller nya småuppgifter. Fasens nio huvudpunkter och deras status finns i beskrivningen till PR #138.

## Bekräftat i repo och genom tidigare Android-tester
- Android-ID: `com.smokeless.app`; version `6.0.0`, `versionCode: 1`; adaptiv ikon och splash-konfiguration i `app.json`.
- `POST_NOTIFICATIONS` är deklarerad. Användaren har bekräftat levererad påminnelse och att avstängd påminnelse inte levererades.
- Firebase-inloggning, gästseparering och återhämtning av kontohistorik har testats på fysisk Android. Molnsynkronisering har en konfliktspärr och transaktionsbaserade skrivningar.
- Manuell JSON-backup/-återställning har avsiktligt tagits bort. Beskriv inte funktionen som tillgänglig i appen.
- Senaste gröna PR-CI kontrollerar kod och Firestore-regler, **inte** signerad Android-release eller Play Console.

## Kvar innan fasens slutliga acceptanstest
1. **Synk:** registrera en *ny* cigarett på ett testkonto, verifiera att den överlever utloggning/återinloggning eller ny installation med samma konto. Använd inte riktiga användardata för destruktiva tester.
2. **Android:** snabb genomgång av Hem, Plan, Registrera, Statistik, Historik, Profil, SOS, Inställningar och notiser på den redan installerade betan. Testa bakgrund/återgång. Bygg om endast om native-konfiguration eller beroenden har ändrats sedan installerad version.
3. **Integritet:** kontrollera att appens texter inte utlovar JSON-backup, färdig kontoradering eller garanterad lagring endast på enheten. Serverprototyp för kontoradering finns men är **inte deployad eller inkopplad**; den får inte markeras som fungerande.
4. **Releasebeslut:** intern testversion kan godkännas separat från offentlig Play-lansering. Kontoradering, offentlig integritetspolicy, ansvarig/kontakt, verifierad Data safety, lagringsregioner och retention måste vara klara **före offentlig lansering**.
5. **Slutgrind:** dokumentera faktisk testad commit och enhet, inga blockerande fel, båda obligatoriska CI gröna på senaste commit. Först då slutförs huvudchecklistan och PR #138 mergas enligt `AI_WORKFLOW.md`.

## Google Play – öppna publiceringskrav
- [ ] Ange verklig personuppgiftsansvarig och support-/integritetskontakt.
- [ ] Verifiera Firebase-region, underbiträden, lagringstider och Data safety mot faktisk konfiguration.
- [ ] Driftsätt och verifiera säker kontoradering samt en tillgänglig väg att begära radering.
- [ ] Publicera integritetspolicy på en åtkomlig URL och länka den i app och Play Console.
- [ ] Ta riktiga skärmbilder, färdigställ feature graphic, åldersgrupp och innehållsklassificering.
- [ ] Skapa och verifiera **signerad release-build** och Play Console-testspår; debug-APK räcker inte.

**Viktigt:** dessa publiceringskrav får inte kryssas av enbart utifrån gröna CI-kontroller. Färdig intern fas 7.0 innebär inte automatiskt att appen är publicerad på Google Play.
