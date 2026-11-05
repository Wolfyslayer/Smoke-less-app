# Fas 16.1 – Android-widget: teknisk inventering och beslutspunkter

Status: **implementation pågår i PR #158; native-build och fysisk Android-verifiering återstår**. Den fasta checklistan i `docs/MASTER_ROADMAP.md` gäller utan nya delpunkter.

## Befintlig app (verifierat i repository)
- Expo SDK 58, React Native 0.88.1 och Expo Router; Android-paket `com.smokeless.app`.
- `app.json` använder Firebase native-moduler och lokal config-plugin `plugins/withAndroidConfigChanges`; projektet har redan ett native-/prebuild-flöde.
- Startsidan får `goal` och `todayCount` som props. Widgeten får **inte** räkna ut dagens mål med en separat algoritm; använd samma domänberäkning och lokal kalenderdag som appen.
- `react-native-svg` ritar ringindikatorn **inne i appen**, men ger inte i sig en Android App Widget.
- `package.json` har för närvarande inget uttryckligt widgetpaket. Android-widget kräver native `AppWidgetProvider`, `RemoteViews` eller kompatibel Android Glance-integration samt manifest-/resource-konfiguration.

## Säker arkitektur – implementerad hittills, med kvarvarande verifiering
1. Egen Expo-config-plugin `plugins/withSmokeLessWidget.js` genererar Kotlin-provider, native React Native-brygga, widgetlayouter och manifestregistrering. Automatisk prebuild-test finns; faktisk Kotlin-kompilering på Android återstår.
2. Widgeten är opt-in och visar neutral standardvy utan godkänd dagsöversikt. Inställningen är lokal; vid kontobyte och utloggning rensas både native och JS-lagring. Fysisk verifiering återstår.
3. En begränsad, validerad snapshot av `todayCount`, `goal`, datum och visningsval får delas med native widgeten via privat Android-lagring. Undvik namn, journal/historik, triggers, token, Firebase-ID och hälsouppgifter.
4. Uppdatera snapshot efter en **bekräftat sparad** registrering/ångring, planändring, kontobyte och datumbyte. Vid datumbyte utan körande app ska widgeten inte visa gårdagens data som dagens; visa neutralt tomläge tills ny giltig snapshot finns. Använd Androids ordinarie begränsade uppdateringsmekanismer, inte konstant polling.
5. Widgettryck öppnar appen via `smokeless://` utan att registrera någon cigarett. Navigering till specifikt registrerings-/SOS-flöde och verifiering av deep link återstår.
6. Båda widgetstorlekarna ska ha kontrast, tillgänglighetsbeskrivningar, anpassad text och stöd för liten/bred widget. Ingen internetanslutning ska krävas för lokal vy.

## Bygg- och testkonsekvenser
- **Ny Android-build krävs: JA när widgetens native implementation läggs till**, eftersom AndroidManifest, widget-provider, resurser och eventuella plugins ändras. Denna inventeringscommit kräver **ingen** ny Android-build.
- Testmatris: Android 12–16 där stödet tillåter; gest-/treknappsnavigering, liten/stor widget, dagsskifte, app dödad, offline, konto-/gästbyte, omstart, mörkt tema och stor text.
- Automatiska tester: snapshot-sanitization, nollmål, datumbyte, stale snapshot, konto-/gästisolering, uppdateringssignaler och deep-link-validering. Riktade native-tester vid implementation; bred fysisk enhets-QA enligt roadmapens fas 25.
- Kvarvarande blockerare för att godkänna fasen: Android-native-kompilering, faktisk widgetinstallation, navigering och integritetstester i riktig Android-miljö.

## Säkerhetsgräns
Hemsidan på Android är synlig även för andra som kan se telefonen. Därför är opt-in, neutral standardvy och omedelbar rensning vid utloggning obligatoriskt. Ingen widget får registrera en cigarett eller skicka data till molnet utan en bekräftad handling i appen.

## Kvarvarande testmatris – genomförs innan fasen stängs eller förs uttryckligen till fas 25

- [ ] Android-build med ren Expo-prebuild: Kotlin-kompilering, provider i manifest, två widgetstorlekar i launcher.
- [ ] Widgetens opt-in: neutral standardvy före samtycke, korrekta siffror efter samtycke, nollmål och målöverskridande.
- [ ] Registrering och ångring: uppdatera efter sparad lokal data, aldrig dubbelregistrering vid upprepade widgettryck.
- [ ] Datum/tidszon: vid midnatt och byte av tidszon visas neutral vy tills ny dagsöversikt finns; ingen kontinuerlig polling.
- [ ] Integritet: utloggning, kontobyte, gästbyte och radering tömmer launcher-vyn även om en tidigare uppdatering väntar.
- [ ] Omstart, app dödad, offline och återöppning: inga tidigare kontouppgifter visas; widgettryck öppnar rätt appvy.
- [ ] Android 12–16 där tillgängligt: liten/bred storlek, stor systemtext, TalkBack, kontrast, mörkt läge och tryckytor.

Testerna ovan är **inte** markerade som genomförda bara för att TypeScript-CI och statiska plugin-tester är gröna. Fysisk enhets-QA kan samlas i fas 25 enligt roadmapen, men native-kompilering måste verifieras innan widgetimplementationen anses byggbar.
