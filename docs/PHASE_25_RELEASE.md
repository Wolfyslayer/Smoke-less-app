**Aktuellt beslut 2026-11-16:** GitHub Releases och wolfyslayer.online är distributionsvägen. Google Play och butiksmaterial är uppskjutna. Samma 8×4-ID och verifieringsnivå bevaras. config/apkReleaseReadiness.json håller lanseringen stängd; godkännande binds till exakt APK/hash/certifikat/runtime/källcommit. Alla säkerhets- och manuella grindar måste vara verifierade. Ingen build, OTA eller offentlig publicering är godkänd nu. Användaren tar personuppgifts-/supportansvar; offentligt namn, bevakad kontakt och supportretention återstår. Historiska körnoteringar nedan är inte nya acceptansresultat.

# Fas 25.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)

## Grind och avgränsning

Ingen offentlig publicering eller produktionsändring ingår utan uttryckligt lanseringsbeslut. Verifiera befintlig säkerhetsmodell, negativa emulatorfall, serverns raderingsprototyp, lokal lagring och releaseunderlag. Samla uppskjuten fysisk QA från faser 8–24. Markera inte fysisk eller driftsatt funktion klar på grund av kodtester. Firestore-regler ändras bara vid verifierat behov och då enligt separat säkerhets-PR-policy.

Vid start: ADB finns men `adb devices -l` visar ingen ansluten enhet. Native-projektkällor och signerad releasekonfiguration saknas i arbetskopian (endast tidigare byggcache finns). Kontoradering är en icke driftsatt serverprototyp utan klientflöde. Integritetspolicy saknar ansvarig, kontakt, lagringsregioner och publicerad URL. Kontrollera vad som kan färdigställas lokalt och dokumentera konkret återstående acceptans innan fasen får avslutas. Fas 26 kräver faktisk lansering och verklig återkoppling.

## Faktisk framdrift

Telefon anslöts senare: A024/Android 17, befintlig utvecklingsbuild med aktuell JS. Riktad fysisk granskning och PNG/systemdelning är utförda enligt `PHASE_25_QA_RESULTS.md`; bred acceptans är inte klar. Textskala återställd till 1,0. Inga testposter, kontoändringar eller meddelanden skickades från telefonen.

SOS inställningar ligger nu bakom valbar fördjupning efter hjälpen. Dubblerade introytor tas bort från Hem/SOS. Byte av SOS-situation rensar tidigare hjälpsamhetssvar för att undvika felaktig attribution. Nya lokala återställningskopior identifierar gäst/UID; äldre omärkta kopior behålls och är en uttrycklig releaseblockerare.

Ordinarie enhetssvit upptäcks automatiskt: 265 tester inklusive serverns 21 säkerhetstester passerar, plus 10 storage, 6 migration och 9 riktiga emulatortester (290 totalt). TypeScript passerar. Fem tidigare utelämnade, föråldrade källkontrakt uppdaterades till aktuell funktionsgräns/texter; säkerhetskraven behölls. Emulatorn kördes isolerat utan produktionsdata.

Manuella Android-CI-byggen saknade miljö för main:s obligatoriska keystore-plugin. De förbereds nu med en disponibel QA-testnyckel, utan hemlighetsändringar eller borttagen plugin. Detta är inte Play-signering och får inte ersätta befintlig installation med annan signatur. Ny native QA-build ska köras efter push; signerad produktionsrelease är fortfarande öppen.

Officiella Play-källor kontrollerade 2026-11-15 i `PLAY_DATA_SAFETY_REVIEW.md`. Utkast till policy/listning uppdaterade mot faktisk datahantering. Ansvarig, kontakt, URL, retention och färdig kontoradering återstår. Inget har publicerats eller driftsatts.

Efter grön validate/rules på `3f3d63e`: gästlagring skyddas mot tyst tom återställning vid fel/skadad data, och Inställningar har bekräftad engångsstädning av exakta äldre omärkta backupnycklar. Inget har raderats på telefonen. 272 ordinarie tester + 10 storage + 6 migration + 9 emulatorfall = 297 verifierade automatiska fall; ny slutlig CI inväntas. Enhetsproven är nu kopplade till faktisk commit i QA-protokollet.

**Användarbeslut:** Bygg inte mer nu; användaren ordnar bygge senare. QA-körning 43740485924 är cancelled. Ingen ny APK/release är verifierad. Fortsätt övrig utveckling och tester; beslutet pausar inte fasens övriga arbete.

Kontoraderingens klientkedja är därefter implementerad bakom avstängd flagga: samtycke/färsk auth, pausad synk, beständig UID-spärr, serverkvitto före städning, skydd för sena writes, gäst/andra konton, omstart samt SDK-/PNG-/widgetstädning. Kontrolläsningar är flaggade för kompatibilitet med ännu ej verifierade produktionsregler. Tre verkliga lokala Auth/Firestore/Functions-test passerar; säkerhets-CI kör dem med Node 22. `ACCOUNT_DELETION_ACCEPTANCE.md` beskriver återstående nativa/produktionsgrindar. 297 ordinarie + 10 storage + 6 migration + 9 regler + 3 integration = 325 lokalt verifierade automatiska fall. Denna kod innebär inte att fysisk kontoradering 4.4 är klar.

Användaren pekade på `C:\SL\google-services.json`. Läsande kontroll bekräftar projekt `smoke-less-75efa`, paket `com.smokeless.app`, Firestore `eur3` och avstängt Cloud Functions-API (`SERVICE_DISABLED`). Funktionen förbereds för närmaste region `europe-west1`; ingen hemlighet, API-aktivering, produktionsdriftsättning eller verklig radering är utförd.

Kodcommit `1a413ad` och dokumentationshead `aea9a54` har verifierats gröna i validate/rules; kodmilstolpens callable-integrationer kördes med Node 22. Efter uttryckligt användargodkännande är serverdelen nu driftsatt och provad i `smoke-less-75efa`/`europe-west1`. Fakturering var redan aktiv; ingen betalplansändring gjordes. Befintliga granskade Firestore-regler driftsattes före funktionen och tillbakalästes med exakt matchning. Två nya syntetiska konton verifierade egen radering, kontoisolering, nekad återuppladdning med gammal token och idempotent återförsök; båda testkontona städades via egen callable. Två serverägda säkerhetslås behålls. Inga befintliga konton eller telefondata raderades. Appflaggan förblir avstängd; native-/tvåenhetsacceptans, extern väg, support och retention återstår. Se `ACCOUNT_DELETION_DEPLOYMENT.md`. Fasstatus är oförändrad 1/8 och 8/32.
Nästa driftmilstolpe: återhämtningsverktyget kräver uttryckligt projekt och separat Admin-app, nekar blandade emulator-/produktionsmål och aktivt/ogiltigt lease samt utelämnar UID/okända sökvägar i diagnostik. Elva riktade återhämtningstest och samtliga 301 ordinarie tester passerar; TypeScript passerar. `SUPPORT_AND_RECOVERY.md` beskriver triage, privat identitetskontroll, säker återhämtning och rollback. En offentlig felrapportmall efterfrågar inga kontouppgifter. Ingen driftändring eller Android-build kördes. Namngiven supportansvarig, kontakt, retention och nativ övning saknas fortfarande, så 7.4 och fasstatus 1/8, 8/32 är oförändrade. Fas 26:s underlag förbereds inom fas 25; efterlanseringsresultat kan inte verifieras före lansering.

**Status:** Pågår. 1/8 huvudpunkter (12,5 %) och 8/32 delpunkter (25 %) verifierade. Fysisk slutacceptans, radering och release är inte klara.

1. [x] **Testplan (4/4)**
   - [x] 1.1 Samla uppskjutna testfall från faser 8–17.
   - [x] 1.2 Fastställ enhetsmatris.
   - [x] 1.3 Dokumentera PASS/FAIL och testad commit.
   - [x] 1.4 Prioritera blockerande fel.
2. [ ] **Android-regression (0/4)**
   - [ ] 2.1 Testa onboarding och planer.
   - [ ] 2.2 Testa SOS, historik och statistik.
   - [ ] 2.3 Testa PNG-delning och widgets.
   - [ ] 2.4 Testa Google-inloggning och notiser.
3. [ ] **Enheter och tillgänglighet (0/4)**
   - [ ] 3.1 Testa Safe Area och systemfält.
   - [ ] 3.2 Testa små/stora skärmar och text.
   - [ ] 3.3 Testa TalkBack och tangentbord.
   - [ ] 3.4 Testa navigering och avslutsdialog.
4. [ ] **Synk och integritet (0/4)**
   - [ ] 4.1 Testa offline och gästläge.
   - [ ] 4.2 Testa tvåenhetssynk och konflikter.
   - [ ] 4.3 Testa kontobyten.
   - [ ] 4.4 Testa kontoradering.
5. [ ] **Säkerhet (3/4)**
   - [x] 5.1 Granska Firestore-regler.
   - [x] 5.2 Verifiera negativa behörighetstester.
   - [x] 5.3 Granska datalagring och loggar.
   - [ ] 5.4 Åtgärda blockerande säkerhetsfel.
6. [ ] **APK-information och integritet (1/4)**
   - [ ] 6.1 Färdigställ integritetspolicy.
   - [ ] 6.2 Färdigställ datalagrings-, support- och raderingsinformation.
   - [ ] 6.3 Färdigställ APK-installationshjälp och verifierad releaseinformation.
   - [x] 6.4 Fastställ APK-distributionsvillkor och uppskjuten Play-avgränsning.
7. [ ] **Release (0/4)**
   - [ ] 7.1 Bygg signerad release.
   - [ ] 7.2 Verifiera release på Android.
   - [ ] 7.3 Verifiera alla obligatoriska CI.
   - [ ] 7.4 Säkerställ support och återställningsplan.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera slutacceptans.
   - [ ] 8.2 Åtgärda blockerande regressioner.
   - [ ] 8.3 Verifiera godkända releasegrindar.
   - [ ] 8.4 Publicera först efter uttryckligt lanseringsbeslut.
