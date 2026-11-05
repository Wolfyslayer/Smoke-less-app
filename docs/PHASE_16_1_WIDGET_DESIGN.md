# Fas 16.1 – Android-widget: teknisk inventering och beslutspunkter

Status: **implementation pågår i PR #158; native-build och fysisk Android-verifiering återstår**. Den fasta checklistan i `docs/MASTER_ROADMAP.md` gäller utan nya delpunkter.

## Faschecklista – uppdaterad efter grön CI för c7a4b15

**28/32 färdiga (88 %).** Här betyder [x] implementerat och täckt av kodgranskning eller automatiska tester, **inte** fysiskt Android-verifierat. Native-build och enhets-QA är separata blockerare.

### 1. Inventering (4/4)
- [x] 1.1 Verifiera vald Expo-/Android-lösning
- [x] 1.2 Kartlägg datakällor och offlinekrav
- [x] 1.3 Fastställ privacy-by-default
- [x] 1.4 Dokumentera native-build och testmatris

### 2. Widgetvyer (4/4 – implementation)
- [x] 2.1 Skapa kompakt widget
- [x] 2.2 Skapa större widgetvariant
- [x] 2.3 Hantera tomma värden och nollmål
- [x] 2.4 Anpassa storlekar och tema (kompakt/bred layout, responsiv minbredd, rutnätsstorlek och mörkt tema implementerat; fysisk Android-QA i fas 25)

### 3. Datauppdatering (4/4, implementerad)
- [x] 3.1 Uppdatera efter registrering
- [x] 3.2 Uppdatera vid datumbyte
- [x] 3.3 Hantera omstart och bakgrund
- [x] 3.4 Begränsa batteriförbrukning

### 4. Snabbåtgärder (4/4 – implementation)
- [x] 4.1 Öppna rätt vy från widget (widgettryck öppnar appens startsida via smokeless://, verifierat i kod och automatiskt navigationstest; faktisk Android-verifiering i fas 25)
- [x] 4.2 Skydda mot dubbelregistrering (widgeten har ingen registreringsåtgärd)
- [x] 4.3 Hantera gästläge säkert (lokal data och kontoseparering)
- [x] 4.4 Verifiera navigationsvägar (automatiskt test av widgetens deep link, appens schema och indexrutt; faktisk Android-öppning i fas 25)

### 5. Integritet (4/4, implementerad)
- [x] 5.1 Låt användaren välja synlig information (opt-in/avstängning)
- [x] 5.2 Hantera utloggning och kontobyte
- [x] 5.3 Undvik personuppgifter som standard
- [x] 5.4 Verifiera lokal dataseparering (automatiska tester)

### 6. Tillgänglighet (4/4 – kod och automatiska tester)
- [x] 6.1 Granska textskalning (max tre rader och ellips i båda genererade widgetlayouterna, automatiskt testat; fysisk QA i fas 25)
- [x] 6.2 Granska kontrast och tryckytor (kontrastrik text och klickbar hel widgetyta i kod; fysisk QA i fas 25)
- [x] 6.3 Hantera olika widgetstorlekar (kompakt/bred och resize-händelse)
- [x] 6.4 Dokumentera enhetstestfall

### 7. Tester (2/4)
- [x] 7.1 Testa målberäkning
- [x] 7.2 Testa uppdateringssignaler
- [ ] 7.3 Testa offline och kontobyte på Android (pågår)
- [ ] 7.4 Verifiera native-build och CI

### 8. Avslut (2/4)
- [x] 8.1 Dokumentera implementation
- [x] 8.2 Samla kvarvarande enhets-QA till fas 25 (testmatris och överlämningskrav nedan)
- [ ] 8.3 Verifiera slutlig grön CI
- [ ] 8.4 Merga fas-PR

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

## Överlämning till fas 25 – fysisk Android-QA

Följande verifieras på riktig Android-enhet i fas 25 och får **inte** räknas som godkänt enbart för att automatiska tester är gröna:

1. Installera en **fristående** APK med genererad widget-provider. Lägg till både liten och bred widget via launchern; testa ändrad storlek och mörkt tema.
2. Kontrollera neutral vy före opt-in, dagens värden efter opt-in, nollmål, överskridet mål och att widgettryck öppnar startsidan utan registrering.
3. Registrera/ångra en cigarett, ändra plan och återvänd från bakgrund; verifiera att launcher-vyn uppdateras först efter lokal sparning.
4. Byt datum/tidszon, starta om telefonen, tvångsstäng appen och kör offline. Gammal dagsstatistik får inte visas som dagens.
5. Växla mellan gäst och konto, logga ut och radera lokal historik; widgeten ska rensas och får aldrig visa föregående identitets statistik.
6. Testa stor systemtext, TalkBack, kontrast, tryckytor och navigering med gester respektive tre knappar.

**Fas 16.1 måste fortfarande verifiera att Kotlin-koden kompilerar och att APK:n kan byggas innan merge.** Ovanstående skjuter endast upp fysisk enhets-QA, inte build-verifieringen.
