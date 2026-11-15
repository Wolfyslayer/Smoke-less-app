# Fas 16.5 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Mergad i PR #162, commit `a3c53e854f5e784d8a7fea1c2c40409c8aabddff`. 8/8 huvudpunkter och 32/32 delpunkter (100 %) verifierade på kod-/automatisk test-/dokumentationsnivå. Båda CI var gröna på slutlig head `3f10f12`. Ingen fysisk Android-QA har utförts; den återstår i fas 25. Checklistans ursprungliga ID och omfattning är bevarade.

## Inventering och avgränsning

Befintlig `HomeScreen` har dagens framsteg, uppmuntran, coach, återfallsstöd, snabbval, tid sedan senaste cigaretten, veckodiagram, besparingar/mål och daglig avstämning. Data kommer från sessionsmodellen och befintlig domänlogik. Registrering och SOS ska fortsatt vara direkt åtkomliga oberoende av kortval.

Anpassning ska gälla en begränsad uppsättning översiktskort: dagens mål, tid sedan senaste cigaretten/delmål, besparingar, röksug och veckoframsteg. Val och ordning sparas lokalt separat för gäst och varje konto. Ingen molnsynk eller ändring av profil-/Firestore-modell behövs i denna fas. Återställning påverkar endast layoutval. Inga externa tjänster eller native-beroenden tillkommer.

Först verifieras normalisering, ordning, återställning och lagringsisolering. Sedan kopplas tillgängliga visa/dölj- och flytta-knappar till startsidan. Bred fysisk QA dokumenteras för fas 25.

1. [x] **Dashboardinventering (4/4)**
   - [x] 1.1 Kartlägg befintliga kort.
   - [x] 1.2 Identifiera datakällor.
   - [x] 1.3 Fastställ standardlayout.
   - [x] 1.4 Fastställ integritetsgränser.
2. [x] **Anpassning (4/4)**
   - [x] 2.1 Välj synliga kort.
   - [x] 2.2 Ändra kortordning.
   - [x] 2.3 Återställ standard.
   - [x] 2.4 Hantera saknade värden.
3. [x] **Kortinnehåll (4/4)**
   - [x] 3.1 Dagens mål.
   - [x] 3.2 Rökfri tid och delmål.
   - [x] 3.3 Besparingar.
   - [x] 3.4 Röksug och framsteg.
4. [x] **Persistens (4/4)**
   - [x] 4.1 Spara lokala val.
   - [x] 4.2 Hantera gästläge.
   - [x] 4.3 Synka endast när säkert.
   - [x] 4.4 Hantera kontobyte.
5. [x] **Layout (4/4)**
   - [x] 5.1 Behåll överblick utan onödig scroll.
   - [x] 5.2 Stöd stora textstorlekar.
   - [x] 5.3 Stöd små skärmar.
   - [x] 5.4 Granska tillgänglighet.
6. [x] **Prestanda (4/4)**
   - [x] 6.1 Undvik onödiga omrenderingar.
   - [x] 6.2 Beräkna aggregat effektivt.
   - [x] 6.3 Hantera offline.
   - [x] 6.4 Hantera snabba registreringar.
7. [x] **Tester (4/4)**
   - [x] 7.1 Testa val och ordning.
   - [x] 7.2 Testa återställning.
   - [x] 7.3 Testa dataseparering.
   - [x] 7.4 Verifiera CI.
8. [x] **Avslut (4/4)**
   - [x] 8.1 Dokumentera standardval.
   - [x] 8.2 Samla enhets-QA till fas 25.
   - [x] 8.3 Verifiera slutlig grön CI.
   - [x] 8.4 Merga fas-PR.

## Implementationsmilstolpe

**Slutgranskning:** Samtliga funktionella delpunkter är genomförda och kontrollerade i koden. Testerna kör den faktiska normaliserings-/lagringsmodulen med styrda lagringsfel och fördröjningar. Identitetsgränsen i React-hooken samt tillgänglig UI/layout kompletteras med källkodskontrakt och statisk granskning. CI verifierar TypeScript, 150 ordinarie tester, 10 storage och 6 migrationstester. Offline betyder här att dashboardvalen inte har något nätverksberoende; fysisk flygplans-/kontobytes-QA återstår i fas 25. Snabba registreringar använder oförändrade sessionsuppdateringar och nya dataproppar; det är granskat statiskt, inte stresskört på telefon. Native-build: NEJ, inga native-konfigurationer eller beroenden har ändrats, endast npm:s testscript.

`DashboardOverview` visar valda kort i sparad ordning. Standard är dagens mål, tid sedan senaste registrerade cigaretten, uppskattad besparing och veckans registreringar. Röksug och nästa delmål är tillval. Noll registreringar kallas inte bekräftad rökfrihet. Saknat delmål har neutral fallback. Registrering/SOS/plan/logg ligger före korten och kan inte döljas. Uppmuntran, tidigare coach/återfallsstöd och daglig avstämning bevaras.

`DashboardEditor` har etiketterade switchar samt Upp/Ned-knappar och återställning. Hela redigeringen fälls ihop; högst sex översiktskort finns. Kontrollerna har minst 48 dp, text får radbrytas och veckans dagrader kan radbrytas på smal skärm. Ingen fixerad höjd eller avstängd textskalning införs.

`dashboardPreferences` normaliserar formatversion/ID/ordning utan duplicerade kort. Eget AsyncStorage-namespace skiljer gäst från varje UID. Varje identitet har en skrivkö; återinläsning inväntar tidigare skrivningar. Hooken döljer en föregående identitets layout direkt och ignorerar inaktuella asynkrona läs-/felsvar. Läsfel spärrar redigering och visas; skrivfel visas utan att röra historik. Ingen molnsynk sker: 4.3 verifieras genom att layoutval aldrig skickas till Firestore.

Redigeraren är memoiserad och callbacken stabil vid klocktick. Röksugsaggregat beräknas vid nya data/dag/minut, delmål vid ny profil/dag och besparing vid nya data/dag. Snabba registreringar använder fortsatt befintlig sessionsmodell; layoutval skriver aldrig registreringsdata.

Lokalt: TypeScript godkänd, ordinarie tester 150/150, storage 10/10 och migration 6/6. Sju nya tester täcker normalisering, val/ordning/återställning, gäst/konto-isolering, skrivkö, lagringsfel och återhämtning; hook/editor har kompletterande källkodskontrakt. Dessa tester är inte verklig Android-rendering eller en full React-interaktionstestsvit.

Fas 25 ska verifiera: kallstart/offline, konto A → gäst → konto B → A, tappningar i snabb följd, alla kort dolda/återställda, maximal text/skärmskalning, smal skärm, TalkBack-läsordning/etiketter och fokus vid flytt av kort. Ingen sådan fysisk QA är markerad godkänd.

