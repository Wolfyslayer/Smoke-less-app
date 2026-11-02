# Fas 8.0 – Personlig rökstoppsplan 2.0

## Mål
En sammanhållen, begriplig och trygg plan för användare som vill sluta direkt eller trappa ned. Återanvänd befintliga profil-, plan- och historikmodeller. Bevara gästläge, Firestore-synk och tidigare data.

## Fast huvudchecklista (0 av 8)
- [ ] Inventera befintlig plan, datamodell, skärmar och testtäckning; dokumentera kompatibilitetsrisker.
- [ ] Stöd tre vägar: sluta direkt, trappa ned gradvis, planerat stoppdatum.
- [ ] Bygg individuella mål och en rimlig veckovis progression utan överraskande omräkning av historik.
- [ ] Skapa tydlig planöversikt med nästa delmål och lättbegripliga justeringar.
- [ ] Hantera missade mål, ändrat stoppdatum och återstart utan skuld eller förlust av historik.
- [ ] Säkerställ migration, offline-/gästläge och kontosynk utan datakonflikter.
- [ ] Lägg till automatiska tester och verifiera tillgänglighet, små skärmar och stora textstorlekar.
- [ ] Slutligt acceptanstest, båda CI gröna och automatisk merge till main.

## Genomförande
- **En PR för hela fasen.** Samla relaterad implementation och tester i meningsfulla commits.
- Efter varje commit: hela checklistan, framsteg, SHA, CI-status och **Ny Android-build: JA/NEJ** med motivering.
- Vänta på användarens bekräftelse av gröna CI innan nästa commit; merga automatiskt när alla punkter och acceptanstest är verifierade.
- Undvik nya molntjänster, prenumerationer och AI-kostnader i denna fas.
- Ändra inte produktionsdata eller befintliga konton under tester.

## Acceptanskriterier
1. En ny användare kan välja metod och förstå dagens mål på högst några steg.
2. En befintlig användare behåller historik och befintlig plan efter uppgradering.
3. Ändringar i planen påverkar framtida mål, inte redan registrerade cigaretter.
4. Planen fungerar utan konto och med synkroniserat konto, utan tyst dataförlust.
5. Appen ger hjälpsam återkoppling vid missade mål och tillåter ändrad plan.
6. Tester är gröna och nativa ändringar identifieras för eventuell Android-ombyggnad.

**Avgränsning:** ingen AI-coach, community eller offentlig Google Play-publicering i fas 8.0. De kommer i senare faser.
