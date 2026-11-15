# Fas 17.0 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Pågående i PR #165. Inventering klar mot startcommit `dfb5989` med grön CI: 1/8 huvudpunkter och 4/32 delpunkter (12,5 %). Implementationen inväntar egen CI. Ursprunglig 8×4-checklista är bevarad.

## Nästa arbete och avgränsning

Jämför `HomeScreen`, `DashboardOverview`, `DailyProgressShareArtwork`, `DailyProgressShareCard` och `domain/dailyShareCard` innan ändringar. Startsidan visar kvar av dagsmål som huvudvärde och förbrukad procent i en mindre ring. Delningsbild och förhandsvisning ska använda samma presentationsmodell och utseende.

Bevara befintliga export-/integritetsskydd i ProfileScreen: explicit förhandsvisning, användarinitierad delning, skydd mot ändrade värden och gamla asynkrona svar. Exportera bara kortet utan UID, konto, systemfält eller historikdetaljer. Testa nollmål, övertrassering, stora värden och exporttillstånd. Använd befintliga SVG-/kodresurser; inga nya native-beroenden eller Firestore-regler planeras. Faktisk Android-PNG/systemdelning och bred TalkBack-QA ligger i fas 25 och är inte utförda.

1. [x] **Visuell inventering (4/4)**
   - [x] 1.1 Jämför startsidans kort och delningskort.
   - [x] 1.2 Fastställ gemensam layout och färger.
   - [x] 1.3 Fastställ typografi och ringstorlek.
   - [x] 1.4 Dokumentera exempeldata.
2. [ ] **Gemensam datamodell (0/4)**
   - [ ] 2.1 Beräkna kvar av mål.
   - [ ] 2.2 Beräkna använd procent.
   - [ ] 2.3 Hantera nollmål.
   - [ ] 2.4 Hantera överskridet mål.
3. [ ] **Bildlayout (0/4)**
   - [ ] 3.1 Matcha startsidans huvudvärde.
   - [ ] 3.2 Matcha mindre ring till höger.
   - [ ] 3.3 Matcha rubrik och stödtext.
   - [ ] 3.4 Behåll delningsytan fristående.
4. [ ] **Export (0/4)**
   - [ ] 4.1 Generera PNG av kortytan.
   - [ ] 4.2 Behåll förhandsvisning.
   - [ ] 4.3 Dela endast på uttrycklig åtgärd.
   - [ ] 4.4 Hantera fel och avbrott.
5. [ ] **Integritet (0/4)**
   - [ ] 5.1 Uteslut kontoidentifierare.
   - [ ] 5.2 Uteslut detaljerad historik.
   - [ ] 5.3 Undvik automatisk uppladdning.
   - [ ] 5.4 Förhindra gammal bild efter dataändring.
6. [ ] **Tillgänglighet (0/4)**
   - [ ] 6.1 Tydliga svenska knapptexter.
   - [ ] 6.2 Förhandsvisning med etiketter.
   - [ ] 6.3 Tillräckliga tryckytor.
   - [ ] 6.4 Hantera stora textstorlekar.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa delad beräkningslogik.
   - [ ] 7.2 Testa nollmål och överskridande.
   - [ ] 7.3 Testa exportens integritetsgränser.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (0/4)**
   - [ ] 8.1 Dokumentera visuell acceptans.
   - [ ] 8.2 Samla native-delningstest till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

## Inventering och implementation

Tidigare visade HomeScreen ett liggande kort med kvar av mål och en liten ring, medan delningskortet använde ett separat stående grönt kort, annan typografi och förbrukat antal som huvudvärde. Nu använder HomeScreen, förhandsvisning och PNG exakt samma `DailyProgressShareArtwork`. Den äldre DailyProgressShareCard är endast en kompatibilitetswrapper. `buildDailyShareCard` ger normaliserat antal/mål, kvar, förbrukad procent och samma stödtext till samtliga ytor. Nollmål ger 0 % i ringen även vid en registrering; texten skiljer mål från faktiskt registrerat antal i tillgänglighetsetiketten.

Gemensamma färger kommer från appens tema, med nuvarande kortbakgrund, lime, kant och texttoner. Standardlayout: 340 logiska enheter, kvar/mål till vänster och ring med radie 46 till höger. Vid stor text växer kortet och rubrik, stödtext och ring staplas. PNG:s proportioner beräknas från samma layout och fontScale, i stället för tidigare fast 680×840. FontScale-ändring ogiltigförklarar tidigare PNG på samma sätt som ändrade antal/mål.

## Visuell kontroll och begränsning

[Bildöversikt med sex exempel](assets/phase17-progress-review.png), [SVG-version](assets/phase17-progress-review.svg): 3/10, 0/0, 15/10, 2/0, 900000/1000000 och textskala 2,5. Bilderna renderas från den faktiska React/SVG-komponenten via en webb-adapter och resvg med systemfont. Visuell inspektion hittade först avklippt rubrik och ring/text-överlapp vid stor text; dessa rättades och bilderna renderades om och inspekterades. Detta verifierar den statiska kompositionen, inte Androids typsnitt, native toDataURL, systemdelning eller TalkBack.

Återskapa lokal bildkontroll utan ändrade appberoenden:

```powershell
npm install --prefix .tmp/phase17-render --no-save --package-lock=false @resvg/resvg-js
node scripts/render-progress-card-review.cjs
```

ProfileScreen:s befintliga uttryckliga förhandsvisning, förberedd PNG, separat Dela-knapp, generationskontroll, värdekontroll och fel-/avbrottshantering bevaras. Bara SVG-kortytan exporteras; inga konto-, profil- eller historikfält lämnas till komponenten. Exporttester är domäntester och källkodskontrakt. Lokal TypeScript och 183 tester passerar (167 ordinarie, 10 storage, 6 migration).

Fas 25 ska fortsatt utföra verklig PNG-export/delning på Android, ändra registrering under export, avbryta systemdelning, dubbeltrycka och ändra systemtextstorlek med öppen förhandsvisning. Granska liten skärm och TalkBack. Inget av detta är markerat som ett utfört fysiskt test. Native-build för denna fas: NEJ, inga nya native-beroenden eller konfigurationsändringar.

