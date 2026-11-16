# Fas 29 – GitHub Releases och Expo EAS Update

## Aktuellt beslut och avgränsning (2026-11-16)

Arbetet fortsätter i befintlig PR #181, `feat/phase-29-preview-ota`. Senare UI-/widgetarbete ligger kvar på fas 30–32:s branches och rullas inte tillbaka på mobilen. Ingen EAS-molnbyggnad, OTA eller publik release har startats av denna utökning. Lokal Preview från senare fas är redan byggd och installerad; användaren har bekräftat Google-inloggning. Separat vanlig app finns kvar och historiken har bevarats vid `adb install -r`.

Preview har paket `com.smokeless.app.preview`, eget EAS-projekt, schema och kanal. Production har separat EAS-identitet och fjärruppdatering avstängd. `runtimeVersion` använder fingerprint; inga runtime- eller kanalöverskrivningar tillåts. Main:s development-keystore-plugin bevaras. **Firebase är tillfälligt delat efter användarens uttryckliga beslut**, så serverkonton är inte isolerade av paketnamnet. Synlig kontovarning och syntetiska QA-konton gäller tills nytt Firebase-projekt finns. Inga regler, kontodata eller hemligheter ändras här.

## Native: verifierad APK på GitHub Releases

`preview-native-release.yml` ersätter det äldre manifest-only-flödet. Endast manuell körning, environment `preview`, uttrycklig `confirm_release`, concurrency utan avbrott, exakta gröna `validate`/`rules` på källcommit och nya lokala kontroller. Valfritt färdigt EAS build-ID återanvänds; annars startas `eas build --platform android --profile preview --non-interactive --wait --json`. Inget APK-bygge sker vid push/PR.

Innan publicering verifieras FINISHED/Preview/INTERNAL, källcommit, EAS-projekt, paket, version/build/runtime, giltig Expo-artifaktlänk samt **själva APK:n** med Androids apksigner och aapt: samma förväntade certifikat, exakt ett signeringscertifikat, application ID, versionCode, versionName, faktisk runtime/fingerprint, update URL, Preview-kanal, inbäddad bundle och ej debuggable. Filens SHA-256 beräknas efter hämtning.

En ny draft/prerelease `preview-build-N` skapas utan att ersätta befintlig tagg. APK, `preview.json` och checksumfil laddas upp; GitHubs uppladdningsdigest och storlek måste stämma. Releasen publiceras först därefter och appens fasta pointer `preview-release/releases/preview.json` uppdateras sist. Lika gamla/äldre/miljöblandade manifest avvisas; Contents API:s fil-SHA skyddar mot samtidiga skrivningar. Avbrott kan lämna draft eller publicerad release utan pointer; inget befintligt material raderas automatiskt. Granska tillståndet före återförsök. Om publicerad release saknar pointer, använd det verifierade manifestet och `upload-preview-manifest.cjs`; skapa inte om samma release.

Manifest schema 2 innehåller version, build, runtime, applicationId, projectId, kanal/plattform, fast GitHub Release-APK-länk, sha256, certificateSha256, publiceringsdatum och svenska versionsnoteringar. Klienten accepterar bara det egna repots exakta tagg-/filnamn som matchar buildnumret, rätt identitet och högre heltals-build. HTTPS utan query, fragment, credentials, alternativa värdar eller omdirigerat manifest. Storlek/tidsgräns och felhantering gäller. En native-runtime får vara nyare/annorlunda; OTA måste matcha installerad runtime.

Repot verifierades offentligt via GitHub API. Offentlig Release-APK kan hämtas utan app-token. Om repot görs privat stoppar publiceraren distributionen: använd i så fall en separat publik distributionsyta eller autentiserad server med kortlivade länkar, aldrig en inbäddad GitHub-token. Kontrollsumman verifieras av publiceringsflödet och följer med releasen. Appen validerar manifest/URL och öppnar webbläsaren; den hämtar inte APK-bytes och påstår inte att den hashverifierar en webbläsarnedladdning. Android verifierar uppgraderingssignatur och kräver användarens installationsgodkännande. Avinstallera/rensa aldrig för att kringgå signeringsfel.

## OTA och upplevelse i appen

Appinställningar → Sök efter uppdateringar visar installerad version/build, Preview, senaste kontroll, OTA-status och eventuell ny native-version med datum/versionsnoteringar. Egna temaanpassade modalbekräftelser skyddar hämtning och native-länk; knappen heter **Ladda ner uppdatering**. Inga råa fel, system-confirm-dialoger eller återkommande popup-notiser införs. Startkontroll högst var sjätte timme, manuell kontroll vid behov. Delvisa/offlinefel är återhämtningsbara. Endast en separat enhetstimestamp skrivs, aldrig konto-/historiklagring.

OTA hämtas efter bekräftelse och aktiveras vid nästa kalla appstart. Ingen reload avbryter utkast/sparning. `preview-ota.yml` kör exakt grön CI och nya tester, skapar aktuell Android-fingerprint och kräver ett redan publicerat schema-2-manifest med samma Preview-runtime före `eas update --platform android --channel preview --environment preview`. Native-ändring stoppar alltså OTA och kräver APK först. Production publiceras aldrig av dessa workflows. Om en felaktig OTA upptäcks: pausa nya publiceringar, verifiera runtime/kanal, skicka en korrigerad kompatibel Preview-uppdatering eller använd Expos rollback till embedded. Radera aldrig kontohistorik, SDK-lagring eller kontoraderingslås som återhämtning. För felaktig APK: återpublicera rätt kod som **högre versionCode med samma signeringsnyckel**, inte en Android-downgrade.

## Konfiguration som återstår före verklig publicering

GitHub environment `preview`: `EXPO_TOKEN` och `PREVIEW_GOOGLE_SERVICES_JSON_BASE64` som secrets; `PREVIEW_CERTIFICATE_SHA256` som vanlig environment-variable (offentligt certifikatavtryck). Aktivera gärna required reviewer. Använd endast Preview-projektets befintliga behörigheter och stabila credentials; skapa inte ny signeringsnyckel. **EAS måste använda samma Preview-nyckel som installerad lokal APK** för uppgradering utan dataförlust. Kontrollera/importera den privat genom `eas credentials --platform android`; lägg aldrig keystore/lösenord i repo eller chatt. Registrera samma SHA-1/SHA-256 för Preview Android-appen i Firebase; lokal Preview-SHA/Google-login är redan verifierad, men EAS-certifikat måste matcha. GitHub-secrets, EAS-signering och cloud-/publiceringsacceptans är inte konfigurerade/verifierade av den här ändringen.

Workflows måste finnas på default branch för att kunna startas med workflow_dispatch. Merga inte ofärdiga fas-PR:er för att kringgå deras acceptans. För första riktade Preview-acceptansen kan en godkänd operatör köra samma verifierings-/publiceringsskript lokalt från exakt grön fascommit. Senare UI-grenar ska föras in genom deras befintliga PR-beroenden innan en build avsedd för användarens senaste UI publiceras; bygg inte en äldre fas-29-snapshot över senaste UI av misstag.

## PowerShell – operatörens manuella steg

Kommandona är underlag, inte redan utförda publiceringar. Kontrollera kvot, källcommit och stabil signering först.

```powershell
$env:APP_VARIANT='preview'
eas project:info
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
eas credentials --platform android
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Välj/återanvänd befintlig Preview-nyckel. Visa inte privata uppgifter i loggar.
eas build --platform android --profile preview --non-interactive --wait --json > "$env:TEMP\preview-build-result.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Läs ID i resultatet och ersätt UUID nedan:
eas build:view 'UUID' --json > "$env:TEMP\preview-build.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
node scripts/publish-preview-manifest.cjs "$env:TEMP\preview-build.json" "$env:TEMP\preview-build-metadata.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Hämta ENDAST apkUrl från den verifierade metadatafilen till $env:TEMP\preview.apk.
$apkMetadata=Get-Content "$env:TEMP\preview-build-metadata.json" -Raw | ConvertFrom-Json
curl.exe --fail --location --proto '=https' --proto-redir '=https' --max-redirs 5 --max-time 600 --max-filesize 629145600 $apkMetadata.apkUrl --output "$env:TEMP\preview.apk"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:AAPT="$env:LOCALAPPDATA\Android\Sdk\build-tools\37.0.0\aapt.exe"
$env:APKSIGNER="$env:LOCALAPPDATA\Android\Sdk\build-tools\37.0.0\apksigner.bat"
$env:PREVIEW_CERTIFICATE_SHA256='VERIFIERAT_BEFINTLIGT_CERTIFIKATS_SHA256'
$env:GITHUB_REPOSITORY='Wolfyslayer/Smoke-less-app'
$env:GITHUB_SHA=(git rev-parse HEAD).Trim()
$env:GITHUB_TOKEN=gh auth token
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
node scripts/require-green-ci.cjs
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
node scripts/verify-preview-apk.cjs "$env:TEMP\preview-build.json" "$env:TEMP\preview.apk" "$env:TEMP\preview-verified.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
$env:RELEASE_NOTES='Godkända svenska versionsnoteringar'
node scripts/create-preview-release.cjs "$env:TEMP\preview-verified.json" "$env:TEMP\preview.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Separat uttryckligt publiceringsbeslut krävs innan nästa kommando körs:
node scripts/publish-preview-release.cjs "$env:TEMP\preview.json" "$env:TEMP\preview.apk"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
Remove-Item Env:\GITHUB_TOKEN
# Uppgradering på ansluten telefon efter verifiering:
adb install -r "$env:TEMP\preview.apk"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
```

När workflows finns på default branch och environment är konfigurerat:

```powershell
gh workflow run preview-native-release.yml --ref 'GODKÄND_BRANCH' -f build_id='FÄRDIGT_BUILD_UUID' -f release_notes='Godkända svenska versionsnoteringar' -f confirm_release=true
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Utelämna build_id för ett nytt EAS-bygge; detta använder kvot.
gh workflow run preview-ota.yml --ref 'GODKÄND_BRANCH' -f message='Godkänd kompatibel Preview-uppdatering'
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
```

CLI-OTA efter samma grön-CI-/runtime-kontroller:

```powershell
$env:APP_VARIANT='preview'
$env:SMOKELESS_PREVIEW_OTA='true'
eas fingerprint:generate --platform android --environment preview --non-interactive --json > "$env:TEMP\preview-fingerprint.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
curl.exe --fail --proto '=https' --max-time 30 --max-filesize 16384 'https://raw.githubusercontent.com/Wolfyslayer/Smoke-less-app/preview-release/releases/preview.json' --output "$env:TEMP\published-preview.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
node scripts/require-preview-runtime.cjs "$env:TEMP\preview-fingerprint.json" "$env:TEMP\published-preview.json"
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
# Bara efter lyckade kontroller och godkänd publicering:
eas update --platform android --channel preview --environment preview --non-interactive --message 'Godkänd Preview-uppdatering'
if ($LASTEXITCODE -ne 0) { throw 'Kommandot misslyckades; avbryt och utred innan nästa steg.' }
```

## Kostnader och verifieringsgräns

Ingen automatisk build per commit. Återanvänd färdig build från exakt commit och använd OTA för kompatibelt JS/assetarbete. GitHub anger standardrunner-minuter gratis för offentliga repos; EAS Free har begränsad lågprioritetsbyggkvot och Update-kvot. Kontrollera konto-/planens aktuella Usage före körning; ett betalt konto kan få usage-baserade kostnader efter kvot. Ingen betalplan eller budget ändras automatiskt. `confirm_release` och environment-grind ligger före kostnadsdrivande steg. Lokalt bygge på Windows kan fortsatt användas privat utan EAS-byggkvot, men det nya workflowet är uttryckligen för EAS-byggda artefakter.

Källor: https://docs.expo.dev/build/building-on-ci/ ; https://docs.expo.dev/eas/cli/ ; https://docs.expo.dev/eas-update/runtime-versions/ ; https://docs.expo.dev/billing/plans/ ; https://docs.expo.dev/billing/usage-based-pricing/ ; https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions ; https://docs.github.com/en/rest/releases/assets . CLI 27.3.0:s installerade fingerprint-help/schema är också kontrollerad.

**Ny Android-build:** Ingen ny native-konfiguration i detta tillägg. Uppdaterad APK eller kompatibel OTA behövs för den nya klienten; releasekedjan behöver en verklig EAS-build/signatur-/uppgraderingsacceptans. Använd inte en fas-29-build för att oavsiktligt ersätta senare UI. Verklig OTA, native-notis/installation via release, full synk/dataseparation och slutlig merge återstår.

Verifiering av utökningen: TypeScript och 344 ordinarie tester PASS. YAML för båda manuella workflows parsad med js-yaml. Faktisk befintlig lokal APK inspekterad med aapt/apksigner inklusive native fingerprint och kanal. Publicerarens checksum-felgren verifierad med isolerade mockanrop: ingen publicering/pointer-skrivning vid fel. Direkt environment/secrets-listning gav 404; övergripande environment-listning bekräftade endast firebase-production/github-pages, alltså saknas preview. Inga secrets eller signeringscredentials ändrade. 3e04d30 har grön validate/rules/GitGuardian; ny dokumentationshead kontrolleras separat efter push.
## Uppdaterat APK-beslut och beroenden 2026-11-16

Main 2782933 och fas 25:s releasegrind är inlästa utan borttagning av tidigare implementation. Google Play förbereds inte. PR #173 ansvarar för säkerhets-/raderings-/integritetsacceptans, #181 för APK/OTA/manifest och #182 för slutlig användarupplevelse. Senare UI ligger kvar i fas 32 och måste integreras före kandidatbygge; inget har skrivits över på telefonen.

GitHub environment preview, Firebase-secret, certifikatvariabel och repository-secret EXPO_TOKEN är konfigurerade. Efter uttryckligt användargodkännande är befintlig lokal Preview-nyckel importerad som default i endast EAS Preview-projektet; separat tillbakaläsning verifierade samma certifikat som installerad APK. Inga privata uppgifter finns i Git. Detta verifierar signeringskonfiguration, inte ett nytt EAS-bygge eller fysisk uppgradering.

Publiceraren anropar nu fas 25:s assertReleaseReady INNAN något GitHub-anrop. Standardpolicyn är stängd. Efter verklig acceptans och separat lanseringsbeslut kan operatören lägga ett fullständigt acceptansobjekt i environment-variabeln APK_RELEASE_ACCEPTANCE_JSON. Det har samma form som config/apkReleaseReadiness.json, men alla verkligt verifierade grindar är true och candidate innehåller exakt commit/sha256/certificateSha256/build/runtime/applicationId från godkänd kandidat. Ingen sådan variabel eller acceptans har skapats här. Separat driftattest undviker att en godkänd källcommit ändras bara för att dess APK-hash ska registreras. Kopiera inte true-värden utan testprotokoll och uttryckligt beslut.

Workflow skiljer confirm_build (enbart byggkvot) från confirm_release (publik publicering). Publicering kräver redan färdigt build_id och separat acceptansobjekt; nytt bygge publiceras alltså inte automatiskt i samma körning. Befintligt explicit confirm_release är inte ett substitut för säkerhetsacceptans. Inga workflows kördes.

GitHub-releasen får även website-preview.json, genererat från exakt samma schema-2-manifest: faktisk versionCode, runtime, paket, APK-länk, hash, certifikat, datum och versionsnoteringar. Detta matchar webbplatsens befintliga fältnamn utan parallell datamodell eller manuellt gissade versionsvärden. Filen ligger kvar i draft tills samtliga uppladdningsdigests och lanseringsgrinden passerat.

Webbplatskontroll: https://wolfyslayer.online/updates/preview.json svarade HTTP 200 med available:false och downloadUrl:null. Behåll detta tills verklig publicerad release är verifierad. Webbplatsens separata repo har inget öppet PR; inget har publicerats eller ändrats där. Vid godkänd lansering måste dess manuella manifestflöde läsa den publicerade releaseasseten website-preview.json, kontrollera att den matchar preview.json och APK-hash/tagg/version/certifikat, samt först därefter uppdatera public/updates/preview.json. Nuvarande webbskript saknar denna fulla metadatakoppling och är därför en kvarstående integrationsgrind. Hämta aldrig ett manifest ur en draft eller kopiera en overifierad länk. Nytt webb-PR krävs för ändring i det separata repot; appens fas-PR dupliceras inte.

Senaste tillåtelse: ingen ny Android-build, OTA eller offentlig release. Fysisk kontoradering/tvåenhetsskydd, tillgänglighet, färdig policy/supportretention och faktisk release/webbnedladdning är fortsatt öppna. Användaren tar personuppgifts-/supportansvar, men offentligt namn, bevakad adress och supportretention är inte bekräftade. Raderingsflaggan förblir avstängd.
