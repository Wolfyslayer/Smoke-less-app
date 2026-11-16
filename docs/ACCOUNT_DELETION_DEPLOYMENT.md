# Kontoradering – driftsatt serverprov 2026-11-15

Användaren godkände aktivering/driftsättning efter information om API- och kostnadskrav. Projekt: `smoke-less-75efa`, Firestore `eur3`, funktion `deleteMyAccount` i `europe-west1`. Ingen Android-build eller offentlig apppublicering utfördes. Testad serverkälla är kodmilstolpen `1a413ad`; dokumentationshead före körningen var `aea9a54`, med grön validate/rules.

## Driftsättning

- Fakturering var redan aktiv (`billingEnabled: true`); ingen betalplan eller hemlighet ändrades.
- Tidigare produktionsregler saknade raderingslåset. Befintlig granskad `firestore.rules` driftsattes först, utan källändring. Tillbakaläsning matchade filen efter normalisering av radslut. Ruleset `735fde30-170f-40a4-ba94-f9e42df5efb0`, aktivt från `2026-11-15T18:39:35Z`.
- Funktionen skapades framgångsrikt med Node 22. CLI avslutade därefter med fel för saknad bildstädpolicy; det var inte ett funktionsfel. Sju dagars städpolicy installerades framgångsrikt i regionens `gcf-artifacts`.
- Runtime: 256 MiB, högst 10 instanser, timeout 540 sekunder. Inga manuella IAM-utökningar behövdes för de verifierade operationerna. Detta ersätter inte full granskning av projektets befintliga roller.

## Faktiska serverresultat

Ett isolerat engångsskript skapade två helt nya Auth-konton med slumpade syntetiska adresser och lösenord. Destruktiva anrop begränsades till just dessa nyskapade UID:n och deras egna token; inga befintliga användare eller telefondata användes. API-nyckel och token skrevs inte till Git eller konsol. Privat körningsunderlag ligger utanför repot.

| Prov | Resultat |
|---|---|
| Callable utan auth | PASS: HTTP 401. |
| Schema för entries, cravings, checkins och plan | PASS: alla accepterade, inklusive nya valfria SOS-/planfält och serverstämplad updatedAt. |
| Läsning av andra kontots sentinel | PASS: HTTP 403. |
| Försök att skicka annat UID i data | PASS: HTTP 400; inget raderingslås skapat. |
| Egen radering | PASS: `deleted: true`, samtliga fyra datavägar därefter HTTP 404. |
| Serverkvitto | PASS: eget completed-lås läsbart med kvarvarande token. |
| Återuppladdning med gammal token | PASS: HTTP 403. |
| Auth och kontoisolering | PASS: raderat konto USER_NOT_FOUND; andra kontots Auth och sentinel intakta. |
| Dubblerat anrop med samma token | PASS: `deleted: true`, idempotent. |
| Städning av andra testkontot | PASS: egen callable bekräftade radering; sentinel därefter HTTP 404. |

Två permanenta serverägda completed-lås behålls enligt säkerhetsdesign. De får inte tas bort för att städa testspår: gamla token ska fortsatt nekas att skriva. UID:n och token publiceras inte i detta protokoll.

## Kvarvarande grind

`EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED` förblir false. Native-auth, lokal cache/PNG/widgetstädning, omstart, avbruten radering och tvåenhetsfall är inte verifierade av detta REST-prov. Punkt 4.4 är därför fortsatt öppen. Extern begäransväg, supportansvar och retention krävs också före aktivering. Se `ACCOUNT_DELETION_ACCEPTANCE.md`.
