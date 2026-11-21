# Switchar och fler Android-widgetar

Användarbeställning 2026-11-16, som tillägg i befintlig fas 32/PR #184. Fasens fasta 8×4-checklista ändras inte. Bred Android-/TalkBack-acceptans kvarstår i fas 25.

## Leverans

- Gemensam temaanpassad `SettingsSwitch` med riktig React Native-switch, tillgänglig etikett, låst vänteläge och skydd mot oförändrade värden. Avstämning, risksituationspåminnelse, tysta tider, widgetens datavisning och SOS-vibration använder den. Påminnelser schemaläggs fortsatt först med Spara och aktivera; reglagen startar inga notiser på egen hand.
- Befintlig Dagens framsteg-widget och dess provider-ID behålls. Tre nya val: Kompakt dag, Registrera och SOS. Alla fyra är separata val i Androids widgetmeny för respektive appvariant.
- Kompakt dag använder samma privata dagsbild och opt-in som ordinarie widget. Ogiltigt datum/antal eller avstängd datavisning ger neutral text. Native publicering och rensning uppdaterar samtliga providers, även vid kontobyte. Inga nya personuppgifter, lagringsnycklar, konto-ID:n eller molnanrop tillkommer.
- Registrera/SOS är generiska genvägar. De öppnar motsvarande vy och sparar inga poster. Exakt tillåten URI, rätt apppaket och immutable PendingIntent begränsar handlingen. Kall och varm start stöds; navigation väntar på session, plan, raderingskontroll och stängda modal-/inloggningsflöden. En kall handling förbrukas efter navigation och spelas inte upp på nytt vid nästa sessionsmontering.

Native-modellen följer [Androids widgetdokumentation](https://developer.android.com/develop/ui/views/appwidgets) med separata providers och fullständiga RemoteViews-uppdateringar. Ingen periodisk polling, AlarmManager, WorkManager eller bitmapgrafik införs.

## Verifiering och gränser

TypeScript och 352 ordinarie tester PASS lokalt före push. Nya beteendetester täcker switchens etikett/värde/färg/disabled, URI-avvisning, väntande widgetnavigation, kall starts ommontering och skydd mot återspelning. Genererad manifest/Kotlin/XML provas för fyra unika providers, samtliga sekretessuppdateringar och Preview-namespace. Båda teman renderas utan dataskrivningar. Dessa tester ersätter inte native-kompilering, launcherplacering, olika widgetstorlekar eller TalkBack.

**Ny Android-build: JA.** Användaren har nu godkänt lokal build på sin dator och Preview-installation. Bygg lokalt, behåll samma testsignering och installera med `adb install -r`; avinstallera/rensa ingen app. Inga EAS-molnbyggen, OTA-/manifestpubliceringar eller produktionsreleaser följer av denna ändring. Verkligt build-/enhetsresultat redovisas separat efter att det körts.

## Nuläge före denna ändring

4fe43b9 har grön validate/rules/GitGuardian. Lokal Preview 6.0.0/1 byggdes och installerades bredvid ordinarie app på A024; kallstart utan Metro verifierades. Preview-appens certifikat registrerades i Firebase och Android OAuth-klient lästes tillbaka. Användaren bekräftade därefter fungerande Google-inloggning. Det gemensamma Firebase-projektet är uttryckligen godkänt; användarens verkliga kontohistorik får inte användas för testskrivningar. Inga credentials eller regler ändras i switch-/widgetarbetet.
