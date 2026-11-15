# Fas 16.5 – fast checklista (8 huvudpunkter × 4 delpunkter = 32)
**Status:** Pågående i PR #162, startad från `main` (`07ff48c`). 1/8 huvudpunkter (12,5 %) och 6/32 delpunkter (18,75 %) verifierade genom inventeringen på `e0cb614` med båda CI gröna. Implementationen nedan inväntar egen CI. Checklistans ursprungliga ID och omfattning är frysta.

## Inventering och avgränsning

Befintlig `HomeScreen` har dagens framsteg, uppmuntran, coach, återfallsstöd, snabbval, tid sedan senaste cigaretten, veckodiagram, besparingar/mål och daglig avstämning. Data kommer från sessionsmodellen och befintlig domänlogik. Registrering och SOS ska fortsatt vara direkt åtkomliga oberoende av kortval.

Anpassning ska gälla en begränsad uppsättning översiktskort: dagens mål, tid sedan senaste cigaretten/delmål, besparingar, röksug och veckoframsteg. Val och ordning sparas lokalt separat för gäst och varje konto. Ingen molnsynk eller ändring av profil-/Firestore-modell behövs i denna fas. Återställning påverkar endast layoutval. Inga externa tjänster eller native-beroenden tillkommer.

Först verifieras normalisering, ordning, återställning och lagringsisolering. Sedan kopplas tillgängliga visa/dölj- och flytta-knappar till startsidan. Bred fysisk QA dokumenteras för fas 25.

1. [x] **Dashboardinventering (4/4)**
   - [x] 1.1 Kartlägg befintliga kort.
   - [x] 1.2 Identifiera datakällor.
   - [x] 1.3 Fastställ standardlayout.
   - [x] 1.4 Fastställ integritetsgränser.
2. [ ] **Anpassning (0/4)**
   - [ ] 2.1 Välj synliga kort.
   - [ ] 2.2 Ändra kortordning.
   - [ ] 2.3 Återställ standard.
   - [ ] 2.4 Hantera saknade värden.
3. [ ] **Kortinnehåll (0/4)**
   - [ ] 3.1 Dagens mål.
   - [ ] 3.2 Rökfri tid och delmål.
   - [ ] 3.3 Besparingar.
   - [ ] 3.4 Röksug och framsteg.
4. [ ] **Persistens (0/4)**
   - [ ] 4.1 Spara lokala val.
   - [ ] 4.2 Hantera gästläge.
   - [ ] 4.3 Synka endast när säkert.
   - [ ] 4.4 Hantera kontobyte.
5. [ ] **Layout (0/4)**
   - [ ] 5.1 Behåll överblick utan onödig scroll.
   - [ ] 5.2 Stöd stora textstorlekar.
   - [ ] 5.3 Stöd små skärmar.
   - [ ] 5.4 Granska tillgänglighet.
6. [ ] **Prestanda (0/4)**
   - [ ] 6.1 Undvik onödiga omrenderingar.
   - [ ] 6.2 Beräkna aggregat effektivt.
   - [ ] 6.3 Hantera offline.
   - [ ] 6.4 Hantera snabba registreringar.
7. [ ] **Tester (0/4)**
   - [ ] 7.1 Testa val och ordning.
   - [ ] 7.2 Testa återställning.
   - [ ] 7.3 Testa dataseparering.
   - [ ] 7.4 Verifiera CI.
8. [ ] **Avslut (2/4)**
   - [x] 8.1 Dokumentera standardval.
   - [x] 8.2 Samla enhets-QA till fas 25.
   - [ ] 8.3 Verifiera slutlig grön CI.
   - [ ] 8.4 Merga fas-PR.

## Implementationsmilstolpe

`DashboardOverview` visar valda kort i sparad ordning. Standard är dagens mål, tid sedan senaste registrerade cigaretten, uppskattad besparing och veckans registreringar. Röksug och nästa delmål är tillval. Noll registreringar kallas inte bekräftad rökfrihet. Saknat delmål har neutral fallback. Registrering/SOS/plan/logg ligger före korten och kan inte döljas. Uppmuntran, tidigare coach/återfallsstöd och daglig avstämning bevaras.

`DashboardEditor` har etiketterade switchar samt Upp/Ned-knappar och återställning. Hela redigeringen fälls ihop; högst sex översiktskort finns. Kontrollerna har minst 48 dp, text får radbrytas och veckans dagrader kan radbrytas på smal skärm. Ingen fixerad höjd eller avstängd textskalning införs.

`dashboardPreferences` normaliserar formatversion/ID/ordning utan duplicerade kort. Eget AsyncStorage-namespace skiljer gäst från varje UID. Varje identitet har en skrivkö; återinläsning inväntar tidigare skrivningar. Hooken döljer en föregående identitets layout direkt och ignorerar inaktuella asynkrona läs-/felsvar. Läsfel spärrar redigering och visas; skrivfel visas utan att röra historik. Ingen molnsynk sker: 4.3 verifieras genom att layoutval aldrig skickas till Firestore.

Redigeraren är memoiserad och callbacken stabil vid klocktick. Röksugsaggregat beräknas vid nya data/dag/minut, delmål vid ny profil/dag och besparing vid nya data/dag. Snabba registreringar använder fortsatt befintlig sessionsmodell; layoutval skriver aldrig registreringsdata.

Lokalt: TypeScript godkänd, ordinarie tester 150/150, storage 10/10 och migration 6/6. Sju nya tester täcker normalisering, val/ordning/återställning, gäst/konto-isolering, skrivkö, lagringsfel och återhämtning; hook/editor har kompletterande källkodskontrakt. Dessa tester är inte verklig Android-rendering eller en full React-interaktionstestsvit.

Fas 25 ska verifiera: kallstart/offline, konto A → gäst → konto B → A, tappningar i snabb följd, alla kort dolda/återställda, maximal text/skärmskalning, smal skärm, TalkBack-läsordning/etiketter och fokus vid flytt av kort. Ingen sådan fysisk QA är markerad godkänd.

