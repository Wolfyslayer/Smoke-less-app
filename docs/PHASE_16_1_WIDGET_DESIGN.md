# Fas 16.1 – Android-widget: teknisk inventering och beslutspunkter

Status: **påbörjad, inte implementerad**. Den fasta checklistan i `docs/MASTER_ROADMAP.md` gäller utan nya delpunkter.

## Befintlig app (verifierat i repository)
- Expo SDK 58, React Native 0.88.1 och Expo Router; Android-paket `com.smokeless.app`.
- `app.json` använder Firebase native-moduler och lokal config-plugin `plugins/withAndroidConfigChanges`; projektet har redan ett native-/prebuild-flöde.
- Startsidan får `goal` och `todayCount` som props. Widgeten får **inte** räkna ut dagens mål med en separat algoritm; använd samma domänberäkning och lokal kalenderdag som appen.
- `react-native-svg` ritar ringindikatorn **inne i appen**, men ger inte i sig en Android App Widget.
- `package.json` har för närvarande inget uttryckligt widgetpaket. Android-widget kräver native `AppWidgetProvider`, `RemoteViews` eller kompatibel Android Glance-integration samt manifest-/resource-konfiguration.

## Föreslagen säker arkitektur – ska verifieras innan kod
1. Utvärdera aktuell kompatibilitet för en Expo-config-plugin som genererar widget-provider, XML och native Android-kod. Om bibliotek saknar verifierat stöd för SDK 58 / RN 0.88, använd en liten egen config-plugin och Kotlin-implementation som genereras reproducerbart av prebuild. Lägg **inte** in en okontrollerad tredjepartsmodul.
2. En enkel Android-widget visar först en **neutral privat standardvy** tills användaren uttryckligen valt att visa dagsmål på hemskärmen. Valet lagras per lokalt konto/gäst och rensas vid utloggning och kontobyte.
3. En begränsad, validerad snapshot av `todayCount`, `goal`, datum och visningsval får delas med native widgeten via privat Android-lagring. Undvik namn, journal/historik, triggers, token, Firebase-ID och hälsouppgifter.
4. Uppdatera snapshot efter en **bekräftat sparad** registrering/ångring, planändring, kontobyte och datumbyte. Vid datumbyte utan körande app ska widgeten inte visa gårdagens data som dagens; visa neutralt tomläge tills ny giltig snapshot finns. Använd Androids ordinarie begränsade uppdateringsmekanismer, inte konstant polling.
5. Widgettryck öppnar appens registrerings-/SOS-flöde med säkra deep links; ingen tyst cigarettregistrering från widgeten. Detta minskar dubbeltryck och dataförlust.
6. Båda widgetstorlekarna ska ha kontrast, tillgänglighetsbeskrivningar, anpassad text och stöd för liten/bred widget. Ingen internetanslutning ska krävas för lokal vy.

## Bygg- och testkonsekvenser
- **Ny Android-build krävs: JA när widgetens native implementation läggs till**, eftersom AndroidManifest, widget-provider, resurser och eventuella plugins ändras. Denna inventeringscommit kräver **ingen** ny Android-build.
- Testmatris: Android 12–16 där stödet tillåter; gest-/treknappsnavigering, liten/stor widget, dagsskifte, app dödad, offline, konto-/gästbyte, omstart, mörkt tema och stor text.
- Automatiska tester: snapshot-sanitization, nollmål, datumbyte, stale snapshot, konto-/gästisolering, uppdateringssignaler och deep-link-validering. Riktade native-tester vid implementation; bred fysisk enhets-QA enligt roadmapens fas 25.
- Blockerare innan native kod: välj och verifiera ett faktiskt kompatibelt widgetpaket eller config-plugin, granska befintlig lokal persistens/synk och säkerställ hur native snapshot kan rensas atomiskt.

## Säkerhetsgräns
Hemsidan på Android är synlig även för andra som kan se telefonen. Därför är opt-in, neutral standardvy och omedelbar rensning vid utloggning obligatoriskt. Ingen widget får registrera en cigarett eller skicka data till molnet utan en bekräftad handling i appen.
