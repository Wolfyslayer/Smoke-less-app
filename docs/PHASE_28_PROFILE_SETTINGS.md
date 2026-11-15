# Fas 28 – profil, konto och organiserade inställningar

Aktiv branch: `feat/phase-28-profile-settings`. Ny fas efter användarens godkännande av designriktningen i fas 27. Basen är fas 27:s branch, så de ofärdiga native-/releasegrindarna i fas 25/27 inte behöver markeras som godkända eller mergas för att fortsätta utvecklingen. Main:s PR #176 är inläst med bevarad aktuell fasstatus och tidigare kod. En PR för hela fas 28, exakt samma 8×4-checklista som main.

## Inventering och målnavigation

| Tidigare placering | Ny plats | Vad som bevaras |
|---|---|---|
| Profil: plan, logg, hälsa, konto, synk, inställningar, SOS, bild och textdelning | Kort profilöversikt med fem huvudkategorier | Kontostatus och direkt SOS är tillgängliga utan att öppna delning/inställningsformulär. |
| Profilens plan-/utvecklingslänkar och delningskod | Min rökstoppsresa (`journey`) | Samma PNG-modell, förhandsvisning, exportgeneration, färskt samtycke och systemdelning. Ingen e-post behövs i resvyn. |
| Planval och dagligt mål under Appinställningar | Anpassa min plan (`plan-settings`), öppnas från Plan | Samma SettingsPlanSection och handlers för förhandsvisning, bekräftelse, stale-data-skydd och sparning. |
| Tema, widget, påminnelser tillsammans med plan och backupstädning | Appinställningar (`settings`), tre utfällbara avsnitt | Samma lagringsnycklar/tjänster. Innehållet hålls monterat vid hopfällning, så formulärvärden inte tappas och inga nya schemaläggningsflöden skapas. |
| Molnpreview, import och gästkopiering under Kontouppgifter | Data och synkronisering (`backup`, intern route bevarad) | Befintliga request-/bekräftelsehandlers, busy-spärrar och kontoisolering. |
| Äldre omärkta backupkopior under Appinställningar | Data och synkronisering | Samma separata varning och permanenta bekräftelse; ingen automatisk städning. |
| Kontoinloggning, verifiering, Google-koppling, lösenord, utloggning och kontoradering | Mitt konto (`account`) | Autentiseringslogik och avstängd raderingsflagga oförändrade. Dataåtgärder har en tydlig länk till data/synk. |
| Appinformation utspridd | Om Smoke Less (`about`) | Version läses från Expo-konfigurationen, hjälp går till SOS, källor till befintlig kunskapsvy, integritet till dataförklaring. Inga påhittade supportadresser eller policy-URL:er. |

Profilens kategoriuppgifter ligger i `src/profileCategories.ts`. Header och navigationshistorik använder samma Tab-typ. Exempel: Profil → Resa → Plan → Anpassa plan → Tillbaka återgår genom samma steg. Konto öppnat från Data går tillbaka till Data. Lösenords-/e-postutkast får fortsatt en bekräftelse före lämnande; historiken återställs vid sessionsbyte som tidigare.

## Säkerhetsgräns

Inga Firebase-regler, autentiseringstjänster, synkalgoritmer, datamodeller eller lagringsnycklar ändras. UI-flytten anropar befintliga handlers och visar inte gästreset för inloggat konto eller kontoimport för gäst. Kontoraderingsknappen förblir styrd av befintlig releaseflagga. Ingen verklig kontoradering, historikändring, publicering eller Android-build ingår i arbetet.

## Verifiering och acceptans

Lokalt verifierat före push: TypeScript, 322 ordinarie tester, 10 storage, 6 migration samt webbexport PASS. Senaste validate/rules ska verifieras efter push. Inga fysiska Android-resultat ingår i dessa siffror.

- Kategorier har unika destinationer och fungerande handlers i gäst/inloggat läge. Rendering får inte starta dataåtgärder.
- Navigation provas genom hela kategorikedjan, återgång från Konto till Data och rensad historik vid sessionsreset.
- Dataåtgärder provas med adapterspioner: bara befintlig request-handler anropas vid knapptryck, och kontooperationer blockerar parallella molnåtgärder.
- Delningstester följer den oförändrade implementationen till JourneyScreen; anonym text och PNG-datagränsen behålls.
- Renderingsmatrisen inkluderar Profil, Resa och Om i båda teman. TypeScript, ordinarie tester, storage/migration, webbexport och senaste CI verifieras innan nästa commit.
- Fysisk Safe Area, tangentbord, stor text, TalkBack och Android Tillbaka är inte verifierade av adaptertester. 7.3, 7.4 och 8.4 lämnas öppna. Övriga markeringar avser kod-/automatisk acceptans, inte färdig native release.

**Ny Android-build: NEJ för fas 28:s JS/TS-omorganisation.** Tidigare buildbehov från fas 27:s userInterfaceStyle automatic kvarstår. Användaren ordnar build senare; starta ingen nu.
