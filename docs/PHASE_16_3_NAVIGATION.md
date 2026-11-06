# Fas 16.3 – Android-tillbakaknapp och navigations-UX

Mål: Systemets Tillbaka-knapp/gest ska i första hand stänga översta modalen, därefter navigera till föregående interna vy och endast från startsidan erbjuda en tillgänglig avslutsbekräftelse. Bevara formulärdata och befintliga funktioner.

## Fast checklista (8 huvudpunkter × 4 delpunkter = 32)

**Status:** Pågår. 0/8 huvudpunkter, 0/32 delpunkter verifierade (0 %).

1. **Inventering (0/4)**
   - [ ] 1.1 Kartlägg nuvarande tabbar och navigationshistorik.
   - [ ] 1.2 Kartlägg alla modaler och deras stängningsprioritet.
   - [ ] 1.3 Kartlägg formulär med osparade ändringar.
   - [ ] 1.4 Granska Expo Router och Android BackHandler.
2. **Navigationsmodell (0/4)**
   - [ ] 2.1 Inför en enda central hanterare för Android Tillbaka.
   - [ ] 2.2 Bevara intern navigationshistorik utan dubbletter.
   - [ ] 2.3 Navigera ett steg bakåt före avslut.
   - [ ] 2.4 Undvik dubbla listeners och stale callbacks.
3. **Modaler (0/4)**
   - [ ] 3.1 Stäng översta modal före tabbyte.
   - [ ] 3.2 Hantera datumväljare och formulär.
   - [ ] 3.3 Hantera SOS-övningar säkert.
   - [ ] 3.4 Bevara avbryt- och bekräftelseflöden.
4. **Avslut från startsidan (0/4)**
   - [ ] 4.1 Visa tillgänglig avslutsdialog på startsidan.
   - [ ] 4.2 Avbryt ska behålla appen öppen.
   - [ ] 4.3 Avsluta endast efter bekräftelse.
   - [ ] 4.4 Undvik avslut från annan intern vy.
5. **Datasäkerhet (0/4)**
   - [ ] 5.1 Skydda osparade formulärändringar.
   - [ ] 5.2 Behåll registreringar och historik.
   - [ ] 5.3 Behåll konto- och synkflöden.
   - [ ] 5.4 Bevara lokal Android/Google-konfiguration.
6. **UI och tillgänglighet (0/4)**
   - [ ] 6.1 Enhetliga tillbaka- och avbrytknappar.
   - [ ] 6.2 Tryckytor och skärmläsaretiketter.
   - [ ] 6.3 Safe area och små skärmar.
   - [ ] 6.4 Stor text och TalkBack-QA.
7. **Automatiska tester (0/4)**
   - [ ] 7.1 Testa navigationshistorik.
   - [ ] 7.2 Testa modalprioritet.
   - [ ] 7.3 Testa avslutsbekräftelse.
   - [ ] 7.4 Testa regressionsskydd och CI.
8. **Android-acceptans och avslut (0/4)**
   - [ ] 8.1 Testa hårdvaru-/systemknapp och gest på telefon.
   - [ ] 8.2 Testa bakgrund/återupptagning och osparade ändringar.
   - [ ] 8.3 Kontrollera båda CI och behov av native-build.
   - [ ] 8.4 Merga fas-PR efter verifiering.

## Arbetsregler

En PR för hela fasen, flera små commits. Efter varje commit kontrolleras båda CI-arbetsflödena innan nästa steg. Uppdatera checklistans verkliga status och procent. Inga otestade punkter markeras som färdiga. Inga ändringar i signeringsnycklar eller `google-services.json` committas. Fysisk Android-testning krävs innan merge.
