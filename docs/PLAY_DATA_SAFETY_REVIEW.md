# Play-underlag – datakartläggning och återstående beslut

Arbetsunderlag kontrollerat 2026-11-15, **inte inskickad eller färdig deklaration**. Stäm av signerad release och faktisk Firebase-konfiguration före svar i Console.

| Datamängd | Faktisk användning | Gräns/återstående kontroll |
|---|---|---|
| E-post, UID och autentisering | Frivilligt Firebase-konto; Google kan kopplas uttryckligen | Deklarera relevanta person-/identifierarkategorier. Verifiera Firebase-tjänsternas faktiska SDK-behandling. |
| Cigaretter, röksug, känslor/situationer, avstämningar och mål | Lokal gästhistorik; automatisk Firestore-synk för konto | Behandla som hälsorelaterade/personliga uppgifter. Molnöverföring finns för konto; påstå inte att all data stannar på enheten. |
| Lokal resestödsfas, handlingsplaner, dashboard och dolda tips | Per gäst/konto på enheten | Ingen ny molnväg i dessa funktioner. Dokumentera retention och radering även lokalt. |
| Påminnelsetider och widgetaggregat | Frivilligt, enhetslokalt; kan synas utanför appen | Påminnelser visar generiska texter; appnamn syns. Widget visar valt dagsantal/mål efter opt-in. |
| PNG och generell uppmuntran | Systemdelning först vid användarens tryck | PNG innehåller dagsantal/mål men inga namn; vald mottagarapp har egna villkor. Ingen automatisk uppladdning av appen. |
| Återställnings-/migreringskopior | Lokala kopior före import/reset | UID-märkning för nya kopior; äldre omärkta kopior och gallring är en releaseblockerare. |
| Driftloggar/SDK-metadata | Måste verifieras i Firebase och signerad build | Inga egna annons-/analys-SDK:er i deklarerade appberoenden; detta ersätter inte SDK- och nätverksgranskning. |

## Kontrollerade officiella krav

- [User Data](https://support.google.com/googleplay/android-developer/answer/10144311): integritetspolicy och korrekt redovisning av personliga/känsliga data.
- [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111): tillgänglig begäransväg både i app och på webben samt hantering av tillhörande data. Nuvarande prototyp uppfyller inte ett fungerande användarflöde.
- [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469): uppgifter ska stämma med faktisk behandling, även via SDK:er. Avgör slutliga kategorier och delningsundantag mot tjänsteavtal/konfiguration.
- [Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291) och [Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511): relevant hälsodeklaration, tydlig policy och inga vilseledande medicinska löften.
- [Target API](https://support.google.com/googleplay/android-developer/answer/11926878): för nya telefonappar/uppdateringar gäller API 36 eller högre sedan 2026-08-31. Installerad testbuild anger target 36; verifiera även slutlig releasemanifest.

## Saknas före färdigställande

Ansvarig utgivare, offentlig support-/integritetsadress, publicerad policy-URL, extern raderingsväg, behandlingsgrund, lagringsregioner/överföringar, logg-/backupretention, slutlig SDK-inventering och verifierad kontoradering. Ange även målgrupp, innehållsklassning och vald test-/lanseringskanal i Console. Inga påhittade organisationsuppgifter eller färdigmarkerade formulär.

Teknisk precisering: `google-services.json` och projektmetadata bekräftar `smoke-less-75efa`, `com.smokeless.app` och Firestore `eur3`. Detta fastställer inte alla regioner/överföringar för Authentication, support eller loggar. Raderingsfunktionen är nu driftsatt i `europe-west1` och serverprov med två nya syntetiska konton passerar enligt `ACCOUNT_DELETION_DEPLOYMENT.md`. Klientens releaseflagga är avstängd tills `ACCOUNT_DELETION_ACCEPTANCE.md` passerat. Support-/återhämtningsrutin finns i `SUPPORT_AND_RECOVERY.md`; ansvarig, offentlig kontakt och retention är inte fastställda.
