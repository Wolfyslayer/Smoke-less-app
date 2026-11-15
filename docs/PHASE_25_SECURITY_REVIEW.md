# Fas 25 – säkerhetsgranskning och releaseblockerare

Granskad 2026-11-15. Inga hemligheter eller Firestore-regler ändrade. Grön CI betyder inte att produktionens regler eller serverfunktioner är driftsatta.

## Verifierat

- Firestore: ägarskap per UID, stängda okända vägar/föräldradokument, fältwhitelist, revisioner, tombstones och serverägt raderingslås. Klienter kan inte skapa/ta bort låset eller hårdradera historik. Nio negativa/positiva emulatortester passerar lokalt.
- Serverns raderingsprototyp: färsk auth krävs; inga UID-parametrar accepteras; kända samlingar raderas före Auth; okända/nästlade data stoppar slutförandet; lease och permanent lås skyddar återförsök. 21 mockade tester passerar. Det är inte verifierad driftsättning.
- Nya lokala återställningskopior separeras nu mellan gäst och exakt UID. Båda kontovägarna skickar UID; gästreset använder gästnamnrymden. Gamla kopior och historik raderas inte automatiskt.
- Nya stöd-/tips-/planpreferenser lagras enbart lokalt per identitet. Påminnelser är uttryckligen enhetslokala och deras meddelanden är generiska. Källänkar har inga historik- eller kontoparametrar.
- `npm test` upptäcker nu samtliga enhetssviter och serverns mockade säkerhetstester. Storage/migration och riktiga regeltester behåller separata körningar. Tidigare utelämnade tester granskas mot faktisk funktion, inte bara gammal text.

## Blockerande före offentlig lansering

1. **Kontoradering saknar produktionsflöde.** Servern är en prototyp, appen har ingen fungerande raderingsknapp och extern begäransväg saknas. Färdigställ med färsk inloggning, tydlig bekräftelse, pausad synk, kontospecifik lokal städning, återförsök/återhämtning och separata integrationstestkonton. Aktivera inte en knapp som påstår att radering fungerar innan server och klient har verifierats tillsammans.
2. **Äldre lokala kopior saknar ägaridentitet.** `smoke-less-pre-cloud-import-*` kan innehålla kontohistorik men kan inte säkert hänföras till ett konto. De får inte raderas som om de tillhör en viss användare. Fastställ en uttrycklig engångsstädning/övergång och retention före kontoradering/release. Nya v2-kopior löser framtida attribution men inte detta äldre material. Migreringskopior är UID-märkta men behöver också ingå i gallringen.
3. **Produktionskonfiguration ej verifierad.** Bekräfta driftsatta regler, Firebase-regioner, IAM, logg-/backupretention, serverlåsens retention och återhämtningsansvar. Ingen deployment har körts i denna granskning.
4. **Test-/produktionssignering.** Den lokala miljön saknar projektets privata signeringsvariabler. Manuella CI-byggen hade ingen konfiguration för main:s obligatoriska debug-keystore-plugin. De får nu en disponibel CI-testnyckel; detta är endast för färska QA-installationer. Bygget kan inte ersätta en installation med annan signatur och får inte publiceras till Play. Google OAuth behöver rätt testcertifikat; produktionssignering och OAuth måste verifieras separat. Befintlig keystore-plugin är bevarad och inga hemligheter ändras.
5. **Fysisk säkerhetsacceptans återstår.** Testa UID-byten och radering/offline på två isolerade installationer. Användarens verkliga telefonhistorik/konto får inte användas för destruktiva QA-fall.

## Återhämtning och drift

`functions/recoverDeletion.js` är som standard läsande och kräver betrodd operatör. Slutförande får bara bekräftas när Auth och alla granskade datavägar är tomma; låset ska behållas. Före release måste en ansvarig och kontaktväg finnas samt körning/återställning provas i testprojekt. Återställ inte raderat användarinnehåll från backup eller gamla klienter. En rollback får inte ta bort raderingslåset eller försvaga åtkomstkontrollen.
