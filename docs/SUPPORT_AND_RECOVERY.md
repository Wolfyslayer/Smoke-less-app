# Support och återhämtning före release

Arbetsrutin för fas 25. Inte en publicerad supporttjänst. Ansvarig operatör, offentlig kontakt, åtkomst till drift och beslutade svarstider måste fyllas i före release. Fas 25 punkt 7.4 är därför fortsatt öppen. Rutinen kan användas som underlag för fas 26 efter lansering.

## Ta emot och prioritera

Be först om appversion/build, Android-version, korta reproduktionssteg, förväntat/faktiskt resultat och om problemet gäller gästläge eller konto. Be aldrig om lösenord, inloggningskod, token, google-services.json, full historik, databasexport eller osanerade loggar. Skärmbild är frivillig och ska maskera namn, e-post och hälsouppgifter. GitHub är offentlig felkanal och får endast innehålla avidentifierade tekniska uppgifter; privata kontoärenden kräver den ännu ej fastställda kontaktvägen.

| Prioritet | Exempel | Första åtgärd |
|---|---|---|
| Blockerande | Annans data synlig, dataförlust, återuppladdning efter radering | Stoppa kandidat/utrullning, bevara säkerhetsspärrar, utred privat. |
| Hög | Krasch vid start, synk fastnar, radering saknar bekräftelse | Reproducera isolerat; rekommendera inte avinstallation eller datarensning. |
| Normal | Layout, felaktig text, icke blockerande förslag | Dokumentera minsta reproduktion och relevant enhetskonfiguration. |

Spara ett internt ärendenummer, kategorin, verifierad build och åtgärdsstatus. Koppla UID till ärendet endast i behörighetsstyrd privat hantering när det behövs. Rapportera aldrig en genomförd kontoradering utifrån enbart användarens e-post eller ett HTTP-timeoutfel. Identitet och behörighet måste verifieras i en separat godkänd rutin innan en extern begäran leder till destruktiva åtgärder; e-postavsändare räcker inte. Extern begäransväg är ännu inte publicerad.

## Fastnad kontoradering

1. Kontrollera projekt, build och om klienten visar pending eller bekräftat serverkvitto. Stoppa manuell återställning/import. Ta inte bort lokala markörer eller serverns `control/deletion` och slå inte av säkerhetsreglerna.
2. Om Auth finns kvar: ny inloggning/klientens godkända återförsök kan behövas efter serverns tiominuterslease. Verktyget nedan raderar inte kvarvarande Auth/data och kan inte ersätta det flödet. Felsök utan att kopiera användarens historik till ett annat projekt.
3. Om Auth saknas men serverlåset är deleting: använd läsande inspektion med uttryckligt projekt. Ett svar att Auth saknas bevisar inte att alla data är borta. Okända samlingar, föräldradokument, extra kontrollposter eller läsfel kräver utredning.
4. Bara när all granskad data och Auth saknas, låset är deleting och leasen är utgången får betrodd operatör uttryckligen slutföra kvittot. Verktyget kontrollerar villkoren och låstillståndet igen i transaktion. Raderingslåset bevaras permanent.
5. Klienten måste därefter kunna bekräfta kvittot och slutföra lokal städning. Har token gått ut och kvittot inte kan läsas krävs den ännu ej verifierade privata supportvägen. Utlova inte lokal städning på andra/offline-enheter utifrån serverresultatet.

Kör från projektroten med godkända Application Default Credentials för avsett projekt. Firebase CLI-inloggning garanterar inte Admin-behörighet för verktyget. Lägg aldrig tjänstekontonycklar i repot eller i ett supportärende.

```powershell
# Läsande inspektion. Ersätt exempel-UID med privat verifierat ärende-UID.
node functions/recoverDeletion.js VERIFIERAT_UID --project smoke-less-75efa

# Ändrar enbart serverkvittot om samtliga säkerhetsvillkor är uppfyllda.
node functions/recoverDeletion.js VERIFIERAT_UID --project smoke-less-75efa --confirm-completed
```

Verktyget kräver projektargument, använder en separat Admin-app för just det projektet och nekar blandade emulator-/produktionsinställningar. Demo-projekt kräver båda emulatorerna på loopback. Delbar diagnostik innehåller projekt och status, inga UID:n eller okända sökvägsnamn. Verktyget är en administrativ reservväg, inte appens publika raderings-API. Det har automatiska tester; återhämtningsövning med verklig nativ klient och ansvarig operatör återstår.

## Incident och rollback

Behåll raderingslås och regler vid varje rollback. Återställ inte raderad historik från backup, gamla klienter eller importer. Stäng inte av regler för att rädda synk. Appflaggan för kontoradering är redan avstängd; detta stoppar inte gamla klienters eller direkta anrop till servern. En serverincident kräver bedömning av anropsvägen och säkra pågående raderingar innan drift ändras.

Använd samma fas-PR för verifierade korrigeringar och kräv gröna validate/rules. Ny native kandidat provas separat enligt användarens byggbeslut. Dokumentera testad commit, påverkan, faktisk åtgärd och kvarvarande risk utan kontouppgifter. Inga driftsändringar ingår i denna rutin automatiskt.

## Beslut som återstår

- Namngiven support-/driftansvarig, ersättare och offentlig kontakt.
- Publicerad policy och extern begäransväg med säker identitetsverifiering.
- Beslutade svarstider, gallring av ärenden och åtkomstgranskning.
- Inventerade logg-/backupretentioner och policy för säkerhetstombstones. Sju dagars Artifact Registry-städning gäller funktionsbilder, inte användardata eller loggar.
- Återhämtningsövning med isolerade testkonton, nativ klient och två enheter samt faktisk releaseacceptans.
