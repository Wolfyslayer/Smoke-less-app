### Fas 32.0 – fast checklista (8 × 4 = 32)

**Status:** Kodmilstolpe: 6/8 huvudpunkter (75 %), 28/32 delpunkter (87,5 %). Isolerad säkerhets-CI grön på 3801bdb; nästa push inväntar CI. Prestandaprofilering och slutacceptans är öppna.

1. **Arkitektur- och beroendeinventering (4/4)**
   - [x] 1.1 Kartlägg komponenter, hooks, domän och lagringslager.
   - [x] 1.2 Identifiera överlappande ansvar och svårtestad kod.
   - [x] 1.3 Granska native/Expo-konfiguration och versionspolicy.
   - [x] 1.4 Prioritera endast belagda underhållsproblem.
2. **Sessions- och navigationsansvar (4/4)**
   - [x] 2.1 Separera ren presentationslogik från sessionsbeslut där lämpligt.
   - [x] 2.2 Minska onödig prop-drilling med tydliga gränssnitt.
   - [x] 2.3 Behåll Android Tillbaka och navigationens beteende.
   - [x] 2.4 Lägg till regressionstester före refaktorering.
3. **Datamodell och lagring (4/4)**
   - [x] 3.1 Dokumentera källa till sanning för gäst/konto/moln.
   - [x] 3.2 Verifiera migrerings- och konfliktregler.
   - [x] 3.3 Håll raderings- och retentionlogik tydligt avgränsad.
   - [x] 3.4 Säkra bakåtkompatibilitet och befintlig historik.
4. **Gemensamma komponenter och teman (4/4)**
   - [x] 4.1 Återanvänd UI-komponenter utan dubbel implementation.
   - [x] 4.2 Granska tema- och tillgänglighetstokens.
   - [x] 4.3 Standardisera fel-/laddningsstatus och meddelanden.
   - [x] 4.4 Undvik nya kopplingar mellan UI och Firebase.
5. **Testbarhet och prestanda (2/4)**
   - [ ] 5.1 Profilera endast mätbara flaskhalsar.
   - [ ] 5.2 Minska onödiga omrenderingar där de verifierats.
   - [x] 5.3 Stärk tester för kritiska gränssnitt.
   - [x] 5.4 Undvik nya beroenden utan motiverad nytta.
6. **Bygg- och versionshygien (4/4)**
   - [x] 6.1 Granska låsfil, versionspinning och Expo-kompatibilitet.
   - [x] 6.2 Separera dev/preview/production i config.
   - [x] 6.3 Dokumentera native-ändring kontra OTA-kompatibilitet.
   - [x] 6.4 Minimera långsamma och duplicerade CI-jobb.
7. **Dokumentation och överlämning (4/4)**
   - [x] 7.1 Synkronisera AI_WORKFLOW med faktisk fasordning.
   - [x] 7.2 Rensa motsägande gamla QA-fashänvisningar utan att tappa historik.
   - [x] 7.3 Dokumentera ansvar, drift och felsökningsvägar.
   - [x] 7.4 Gör nästa AI-session reproducerbar utan gissningar.
8. **Verifiering och leverans (2/4)**
   - [x] 8.1 Kör typkontroll och samtliga relevanta regressioner.
   - [x] 8.2 Verifiera konto/synk/radering med isolerade testdata.
   - [ ] 8.3 Verifiera båda obligatoriska CI och Android-buildbehov.
   - [ ] 8.4 Slutför PR endast med oförändrat beteende eller dokumenterad förbättring.

Evidens: PHASE_32_MAINTENANCE.md. Regressionstest rött före och grönt efter UID-/synkfasändringen. TypeScript, 348 ordinarie tester, 10 storage och 6 migration, webbexport och Expo-kompatibilitet kontrolleras före push. 8.2 verifierad med riktiga isolerade Auth/Firestore/Functions-emulatorer på 3801bdb; 8.3 inväntar nästa pushs senaste CI; inga riktiga konto-/Android-testresultat påstås. Native-build JA; användaren bygger senare.
