# Kontoradering – konkret acceptans före aktivering

Status 2026-11-15: klient, server och skydd finns i fas 25:s PR. **Avstängt som standard. Inte driftsatt eller nativt slutgodkänt.** Ingen verklig användare har raderats.

Slutlig kodmilstolpe `1a413ad` har grön `validate` och `rules`. Säkerhetsjobbets steg för låst serverruntime, regeltester och verkliga callable-integrationer kördes och passerade i CI med Node 22. Lokalt verifierades 325 fall totalt. Dokumentationsändringar efter denna milstolpe kräver också grön senaste CI före nästa commit.

## Konfiguration som faktiskt hittats

- `google-services.json` anger `smoke-less-75efa` och `com.smokeless.app`. Filens nyckelmaterial har inte ändrats eller checkats in.
- Läsande Firebase-kontroll visar Firestore-plats `eur3`.
- Cloud Functions-listning svarar 403 med `SERVICE_DISABLED` för `cloudfunctions.googleapis.com`. Driftsättning kan därför inte verifieras via listningen. API:t har inte aktiverats.
- Koden anger nu `europe-west1` uttryckligen, både server och klient. Det är [Firebases rekommenderade närmaste region för eur3](https://firebase.google.com/docs/functions/locations), inte ett påstående att all Firebase-behandling sker i EU.
- Driftsättning kräver enligt [Firebase-dokumentationen](https://firebase.google.com/docs/functions/get-started) Blaze-planen. Projektets aktuella betalplan har inte verifierats. Ingen betalplansändring, API-aktivering eller driftsättning har gjorts; detta är ett separat produktions-/kostnadsbeslut.
- `.env.example` har `EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED=false`. Nya kontrolläsningar/lyssnare är också flaggade, så befintlig synk inte kräver nya driftsatta kontrollrättigheter innan funktionen aktiveras. Lokala raderingsmarkörer skyddar alltid mot återuppladdning.

## Flöde och felgränser

Användaren loggar in på nytt och bekräftar permanent radering. Klienten kontrollerar UID, färsk auth och äldre omärkta kopior. Befintliga lokala sparningar får slutföras medan UI/synk pausas; sedan läggs en beständig lokal skrivspärr före serveranropet. Callable-anropet skickar bara tom `data` och token i Authorization-headern, aldrig UID eller historik i URL/body. Se [callable-protokollet](https://firebase.google.com/docs/functions/callable-reference).

Servern använder endast autentiserad UID, skapar ett serverägt lås, raderar granskade samlingar och tar bort Auth sist. Först ett verifierat `deleted: true` eller ett eget serverläst completed-lås får godkänna lokal städning. Gästdata, andra kontons aktiva historik och deras preferenser bevaras. Kvarvarande lokala tombstones saknar hälsohistorik men deras säkerhetsretention måste beskrivas i slutlig policy.

Nätverksfel efter skickat anrop lämnar skrivspärren kvar. Återförsök läser ett autentiserat serverkvitto och kan slutföra städning utan ett nytt destruktivt anrop. Ett lyckat serversvar hålls också i minnet om den efterföljande markörsparningen misslyckas. Klienten får aldrig återställa pending efter confirmed, eller rulla tillbaka ett serverobserverat lås som om det vore ett eget avbrutet förarbete.

Efter bekräftelse städas kontots lokala data/preferenser/kopior, Firestore-cachen och tillfälliga PNG-bilder. Widgetintegritet och utloggning gäller bara samma aktuella UID. Appen kräver sedan omstart och kontrollerar cacheflaggan innan synk får återupptas. Om något steg misslyckas visas återhämtning; ingen lyckad slutstatus visas i förtid.

## Verifierat automatiskt

- Domän-/adaptertester: samtycke, UID-byte, auth-tid, dubbeltryck över flera controllerinstanser, okända serversvar, osäkert nätverk, markeringsfel, partiell städning, sena sparningar, gäst/andra konton, transport och cacheordning.
- Samma skrivspärr används av kontolagring, kontokopiering/migrering, återställningskopior, lokala preferenser och dashboard. Vanlig molnsynk kontrollerar spärren före arbete; kontosessionens epoch stoppar äldre pågående synkar.
- Tre riktiga lokala integrationstest mot Auth + Firestore + Functions i **enbart `demo-smokeless-qa`**: komplett egen radering med annat konto orört; obehörig/UID-styrd begäran nekad; okänd nästlad data stoppar Auth-radering. Lokalt Node 24; säkerhets-CI kör Node 22 enligt runtime-konfigurationen.
- Nio reglerelaterade emulatorfall och 21 server-/återhämtningsmockar finns kvar. Säkerhets-CI upptäcker ändringar i raderingskedjan och kör även de tre integrationsfallen.

## Fortfarande obligatoriskt före påslag

1. Granska färdiga ändringar och grön senaste CI. Bekräfta driftsatta raderingslås/regler, IAM och behörighet att aktivera/driftsätta Cloud Functions i det befintliga projektet. Inga produktionsändringar är körda.
2. Använd separata testkonton och kontrollerade data. Verifiera nativ auth, återförsök, lagringsfel, omstart och faktisk SDK-/PNG-/widgetstädning i en testbuild. Användarens aktuella verkliga konto/historik är inte testmaterial.
3. Prova två enheter: en begär radering medan den andra är online/offline med osynkade poster. Serverlåset ska neka all återuppladdning. Bekräftat serverkvitto ska leda till lokal städning; om autentiseringen redan gått ut utan åtkomligt kvitto krävs dokumenterad support-/återhämtningsväg, ingen gissad lyckad status.
4. Färdigställ offentlig extern raderingsväg, supportansvar, policy och retention. Google Play kräver en begäransväg även utanför appen.
5. Först därefter får `EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED=true` användas i en godkänd kandidat. Detta är en separat aktiveringsgrind, inte en följd av merge.

## Lokala kommandon för säkra testdata

Kör från projektroten med Node 22 och Java 21, inte mot produktion:

```powershell
npm ci --prefix functions
firebase emulators:exec --only auth,firestore,functions --project demo-smokeless-qa "node --test functions/accountDeletion.integration.cjs"
```

Integrationsfilen avbryter innan Admin initieras om emulatorvärdar eller demo-projekt inte stämmer. Användaren har skjutit upp Android-byggen; starta inga sådana nu.
