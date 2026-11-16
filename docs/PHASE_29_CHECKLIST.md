### Fas 29.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

**Verifierad status på 3e04d30:** validate/rules/GitGuardian success. 6/8 huvudpunkter (75 %), 28/32 delpunkter (87,5 %). Ny dokumentationshead behöver egen grön CI. Lokal fristående Preview, Google-login och sida vid sida verifierade från senare fas; ingen EAS-/Release-/OTA-publicering körd.

1. **Inventering och riskbedömning (4/4)**
   - [x] 1.1 Inventera Expo SDK, config-plugins, Android-build och befintlig CI.
   - [x] 1.2 Inventera Firebase, Google-inloggning, SHA och signering.
   - [x] 1.3 Definiera Preview/Production-isolering och kostnadsram.
   - [x] 1.4 Dokumentera native-risker, säkerhet och acceptanskriterier.
2. **EAS-projekt och buildprofiler (3/4)**
   - [x] 2.1 Konfigurera EAS-projekt och versionshanterad `eas.json`.
   - [x] 2.2 Skapa fristående APK-profil för Preview utan Metro-beroende.
   - [x] 2.3 Behåll separat development-profil och säkra produktionsprofilen.
   - [ ] 2.4 Säkerställ reproducerbar Android-build och hantering av credentials.
3. **Separat Preview-app (4/4)**
   - [x] 3.1 Ge Preview eget Android application ID och tydligt namn.
   - [x] 3.2 Separera Preview-konfiguration utan att bryta produktion.
   - [x] 3.3 Säkerställ kompatibel Firebase/Google-inloggning för Preview.
   - [x] 3.4 Verifiera installation sida vid sida med produktionsappen.
4. **EAS Update och kanaler (4/4)**
   - [x] 4.1 Installera och konfigurera `expo-updates` kompatibelt med SDK.
   - [x] 4.2 Konfigurera `preview`-kanal och separat produktionskanal.
   - [x] 4.3 Välj runtimeVersion-strategi som skyddar native-kompatibilitet.
   - [x] 4.4 Verifiera att Preview inte kan få produktionsuppdateringar av misstag.
5. **OTA-upplevelse och återhämtning (4/4)**
   - [x] 5.1 Definiera kontroll vid start och via Appinställningar → Sök efter uppdateringar, samt när OTA hämtas och aktiveras.
   - [x] 5.2 Hantera offline-läge, utebliven uppdatering, omstart och tydlig versionsstatus.
   - [x] 5.3 Visa OTA-dialog respektive native-uppdateringsdialog med verifierad APK-länk, utan påtvingad dataförlust.
   - [x] 5.4 Dokumentera rollback/återställning, versionsmanifest, byggnummerjämförelse och Androids installationsgodkännande.
6. **GitHub Actions och arbetsflöde (4/4)**
   - [x] 6.1 Skapa säker manuell eller kontrollerad Preview-OTA-publicering samt versionsmanifest för EAS-byggda Preview-APK:er.
   - [x] 6.2 Skydda tokens, hemligheter och kanalval.
   - [x] 6.3 Undvik native-build vid rena JS-/asset-ändringar.
   - [x] 6.4 Dokumentera hur Codex använder arbetsflödet utan oavsiktlig release.
7. **Automatiska tester och dokumentation (4/4 på 3e04d30)**
   - [x] 7.1 Testa app-ID, kanaler, profiler och runtime-konfiguration.
   - [x] 7.2 Testa skydd mot fel kanal, fel miljö, felaktig native-version och opålitliga uppdateringslänkar.
   - [x] 7.3 Verifiera TypeScript, regressioner och båda CI-kontrollerna.
   - [x] 7.4 Dokumentera installations- och uppdateringskommandon för Windows.
8. **Android-acceptans och leverans (1/4)**
   - [x] 8.1 Installera fristående Preview APK utan dev-server.
   - [ ] 8.2 Verifiera verklig Preview OTA-uppdatering samt native-uppdateringsnotis och APK-installation på Android.
   - [ ] 8.3 Verifiera Firebase, Google-inloggning, widgets, synk och dataseparation.
   - [ ] 8.4 Slutför fasens PR efter verifierad CI och dokumenterad acceptans.

Verifiering: TypeScript och 344 ordinarie tester PASS, YAML för manuella workflows parsad, faktisk lokal APK läst med aapt/apksigner. Lokal Preview från senare fas innehåller fas 29 och är installerad utan Metro/rensning bredvid ordinarie app; användaren bekräftade Google-login. 2.4 (EAS-credentials/reproducerbarhet), 8.2 (verklig OTA/Release-uppgradering), 8.3 (samlad synk/widget/dataseparation) och 8.4 (slutlig PR) är öppna. Inga mocktester ersätter dessa grindar. Senaste CI-status hålls i PR. Se PHASE_29_PREVIEW_OTA.md.
