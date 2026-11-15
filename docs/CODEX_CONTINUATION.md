# Fortsättning – Smoke Less

## Aktiv fas

- Fas **25.0 – slutlig QA, säkerhet och release**, branch `feat/phase-25-release-readiness`, PR #173. Bas main `d606126`.
- Fast checklista: `docs/PHASE_25_RELEASE.md`. Merga inte fasen eller markera roadmapen färdig innan verkliga releasegrindar passerat. Fas 26 kräver lansering och faktisk återkoppling.
- Användaren har gett stående klartecken att AI kontrollerar senaste `validate` och `rules` och fortsätter till nästa commit/fas när de är gröna. Inget extra klartecken mellan vanliga commits/merge. Produktionspublicering kräver uttryckligt beslut.

## Senaste avslutade faser

Fas 17 PR #165 (`0fdd4b1`), 18 #166 (`2857e3f`), 19 #167 (`9d0505e`), 20 #168 (`7cb70a4`), 21 #169 (`70a2295`), 22 #170 (`577558d`), 23 #171 (`3a05bfc`) och 24 #172 (`d606126`) är mergade. Alla hade gröna obligatoriska CI på slutlig head. Kod/test/statisk granskning är dokumenterad som 8/8 och 32/32 per funktionsfas; fysisk QA är uttryckligen överförd till fas 25.

Gemensam SVG/dagsmodell används på Hem, förhandsvisning och PNG. Lokal preferenstjänst separerar gäst/konton för resestöd, handlingsplaner och tips. Underhållsläge bygger på bekräftade dagar. Frivilliga notiser har tysta tider, generisk text och serialisering. Hem prioriterar dagskort/Registrera/SOS; onboarding har frivillig ekonomi och bevarar historik.

## Fas 25 hittills

- Telefon ansluten av användaren: A024, Android 17, 1260×2800/480 dpi. Befintlig dev-build 6.0.0 installerad 2026-11-06; aktuell JS via Metro/USB. Ingen ominstallation/rensning och inga testposter/kontoändringar i verklig historik. Fulla testdetaljer i `PHASE_25_QA_RESULTS.md`.
- PNG skapad nativt, faktisk 680×426-fil inspekterad; systemdelning öppnad och avbruten utan mottagare. Hem/SOS och registreringsmodal/Android Tillbaka granskade riktat. Textskala 1,8 provad efter omstart och återställd till 1,0. TalkBack, andra enheten, offline med skrivningar och full regression är inte utförda.
- SOS-planinställningar flyttade bakom utfällning, dubbla introytor bort från Hem/SOS och situationsbyte rensar tidigare hjälpsamhetssvar. Nya backupnycklar skiljer gäst/konto; äldre omärkta kopior är fortfarande en blockerare för fullständig radering.
- Testupptäckt ersätter fast fillista: 265 enhetstester inklusive 21 servermockar, 10 storage, 6 migration samt 9 Firestore-emulatortester passerar lokalt. TypeScript passerar. Emulatorn använder endast `smokeless-rules-test`.
- Manuella CI-byggen får disponibel testkeystore för main:s befintliga plugin. Ingen privat nyckel/hemlighet ändrad. **Det är inte produktionssignering.** Byggkörningen är uppskjuten enligt användarens senare beslut. Befintlig fysisk installation har annan certifikatgrund; avinstallera den inte för att prova CI-APK.
- **Senaste styrning från användaren: bygg inte nu, användaren fixar det senare.** Workflow 43740485924 är cancelled. Starta inga fler byggen. Fortsätt kod/test/underlag; byggets uppskjutande är inte en paus av utvecklingen.
- `3f3d63e` har grön validate/rules. Därefter tillagt: gästlagring kastar fel vid läs-/JSON-/valideringsfel i stället för att återgå tomt, och frivillig bekräftad städning av äldre omärkta kopior i Inställningar. Inte körd på användarens riktiga kopior. Lokalt 272 ordinarie + 10 storage + 6 migration + 9 emulatorfall = 297 tester, TypeScript grön. Klient/server-kontoradering och återuppladdningsskydd hanteras i den efterföljande milstolpen; deploya eller radera inte verkliga konton.
- `064035b` (gästskydd/städning) har också grön validate/rules. Därefter implementerad klient/server-kedja för kontoradering bakom **avstängd releaseflagga**. Se `ACCOUNT_DELETION_ACCEPTANCE.md`: färsk auth/samtycke, UID-spärr för samtliga kontoskrivvägar, dränering av tidigare sparningar, serverkvitto, sena async-svar, städning av SDK/PNG/widget och omstart. Serverns felgren loggar inte längre UID/råa fel. Säkerhets-CI får riktiga Auth/Firestore/Functions-integrationstest med Node 22 och låst `functions/package-lock.json`.
- Senaste lokala verifiering: TypeScript; 297 ordinarie (inklusive 21 servermockar), 10 storage, 6 migration, 9 regler, 3 riktiga lokala callable-integrationer = **325 testfall**. Lokala Functions kördes med hostens Node 24; CI ska verifiera Node 22. Ingen native radering eller produktionsradering är gjord.
- Användaren hänvisade till `C:\SL\google-services.json` för projektinformation. Bekräftat `smoke-less-75efa`, paket `com.smokeless.app`, Firestore `eur3`. Cloud Functions-API ger `SERVICE_DISABLED`; aktivera/deploya inte utan konkret godkännande. Server och klient förbereds för `europe-west1` enligt Firebase-mappningen för eur3. Ingen hemlighet eller google-services.json är ändrad. Ingen separat stagingmiljö har bekräftats; emulatorerna använder endast `demo-smokeless-qa`.
- Roadmapens gamla Planerad-rader för 16.1–16.3 har korrigerats efter GitHub-verifiering: PR #158 (`e9ee298`), #159 (`27d0e0f`) och #160 (`1811444`) är faktiskt mergade. Inga nya checklistor eller påhittade fysiska testresultat.
- Slutlig kodmilstolpe `1a413ad` och dokumentationshead `aea9a54` har grön validate/rules. Efter uttryckligt användargodkännande är serverdelen nu driftsatt och provad i `smoke-less-75efa`/`europe-west1`. Fakturering var redan aktiv; ingen betalplansändring gjordes. Befintliga granskade Firestore-regler driftsattes före funktionen och tillbakalästes med exakt matchning. Två nya syntetiska konton verifierade egen radering, kontoisolering, nekad återuppladdning med gammal token och idempotent återförsök; båda testkontona städades via egen callable. Två serverägda säkerhetslås behålls. Inga befintliga konton eller telefondata raderades. Appflaggan förblir avstängd; native-/tvåenhetsacceptans, extern väg, support och retention återstår. Se `ACCOUNT_DELETION_DEPLOYMENT.md`. Fasstatus är oförändrad 1/8 och 8/32. Inga Android-byggen ska startas.

## Verkliga releaseblockerare

Se `PHASE_25_SECURITY_REVIEW.md` och `PLAY_DATA_SAFETY_REVIEW.md`: nativt slutverifierad kontoradering och extern väg saknas; äldre omärkta backups och retention behöver lösas; produktionens regler/region är verifierade men full IAM-/logg-/retentionsgranskning återstår; ansvarig utgivare/offentlig kontakt/policy-URL saknas; isolerad nativ testinstallation, andra enheten, full fysisk acceptans och signerad release återstår. En fråga om utgivare/kontakt har ställts. Användaren anslöt telefonen men har ännu inte fyllt de uppgifterna.

## Arbetsregler

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera faktisk branch, lokal diff, PR och senaste CI. Bevara lokala ändringar och main:s debug-keystore-plugin. Ingen produktionsdeployment, kontoradering, testskrivning i verklig historik eller hemlighets-/regeländring utan nödvändig verifiering. Regeländring som verkligen behövs får separat avgränsad säkerhets-PR enligt roadmapen.

Efter varje commit: rapportera SHA, PR, ändring, CI, Android-build samt alla fasta 8 huvudpunkter och 32 delpunkter med två procentmått. Fas 25 har verkliga fysiska/releasepunkter som inte får prickas av med enbart kodtester. Fortsätt med tillgängligt arbete och användarens nya information; stanna inte bara för att en fas är förberedd.
