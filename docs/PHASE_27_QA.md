# Fas 27 – verifiering och återstående buildacceptans

## Implementerat

- Ljust, Mörkt och System i Inställningar, System som standard. En enhetslokal preferens (`smokeless:appearance:v1`) används; inga kontonycklar, historik, Firestore-regler eller serverfunktioner ändras.
- Reaktiv kontext över hela appen. Stilfabriker cachas per palett och delas mellan komponentinstanser. Temabyte ändrar inte sessionsnyckeln. Alla tidigare C-konsumenter är migrerade till hooks; inga hårdkodade hexytor återstår i src:s TSX-filer.
- Startup, rootbakgrund, statusfält, delnings-SVG, dialoger, datumval, onboarding och kontoflöden använder temat. SystemUI-bakgrund uppdateras. Appkonfigurationens userInterfaceStyle är automatic; Androids faktiska systemnavigation kräver ny build och enhetskontroll.
- Hem har en tydlig fylld Registrera-handling och separat omedelbar SOS. Bottennavigation har markerad aktiv flik, större etiketter och minst 56 dp höjd. Kort, kroppstext och dialogytor har samordnats; långa vyer och autentiseringsdialoger begränsas i bredd.
- Modalfade/slide och SOS skalrörelse respekterar reducerad rörelse. Andningsklocka och valbar haptik fortsätter oberoende av visuell animation.
- PNG-generation ogiltigförklaras även vid temabyte så att en äldre förberedd bild inte blir kvar som godkänt resultat efter ändrad förhandsvisning.

## Faktiska automatiska resultat före push

| Kontroll | Resultat och gräns |
|---|---|
| TypeScript | PASS. Genererad dist/.expo/.tmp undantas tillsammans med basens befintliga buildundantag. Efter webbexport försökte TypeScript annars kontrollera minifierad byggoutput och fick stack overflow. Källkod och tester ingår fortfarande. |
| Ordinarie tester | 315 PASS, inklusive temalagring, paletter, reducerad rörelse och renderingsfall. |
| Lagring | 10 PASS: gäst/kontoisolering, sena writes och kontobyten. |
| Migration | 6 PASS: samtycke, backupfel och skydd för befintligt konto. |
| Webbexport | PASS före slutlig commit; detta är inte Android-build eller visuell acceptans. |
| Renderingsmatris | Alla skärmkällor, fyra onboardingsteg, gemensamma kontroller, modaler och SVG provas i båda paletter med simulerad bredd 320/768 och fontScale 1/2. React-/native-adaptrar används. Testet bevisar renderbarhet och valda färger, inte verklig layout, skärmläsarfokus eller systemfält. |
| Kontrast | Text-/knappfärgpar provas numeriskt i båda paletter. Detta ersätter inte visuell kontroll av samtliga kombinationer och interaktionstillstånd. |
| Preferensfel | Saknad/skadad post, läsfel, sena startup-läsningar, serialiserade snabba val, sena skrivfel och rollback till senast beständiga val provas. Endast utseendenyckeln skrivs. |
| Rörelse | Säker initialinställning, sena tillgänglighetssvar och bibehållen andningsklocka utan skalrörelse provas. |

Regel- och callable-integrationer från fas 25 är oförändrade; deras tidigare PASS är inte nya fysiska testresultat för fas 27. Senaste obligatoriska CI på pushad commit måste bli grön innan fortsatt commit/merge.

## Inte utfört – fasta öppna delpunkter

- **2.4:** faktisk Android-status-/systemnavigation och temabyte över modaler/diagram efter ny native-konfiguration.
- **3.4:** visuell dashboardacceptans i båda teman på små/stora skärmar.
- **6.1–6.4:** fysisk Safe Area, tangentbord, stor text, kontrast/tryckytor i layout samt TalkBack/fokus/läsordning under temabyte.
- **7.4:** sammanhållen visuell kontroll av alla huvudflöden.
- **8.4:** fasens PR får inte räknas slutgodkänd innan öppna acceptanskriterier hanterats.

Ingen webbläsare fanns ansluten till datorverktyget under arbetet; ingen visuell webbkontroll kan därför rapporteras. Ingen ny Android-build startades enligt användarens beslut. Befintlig telefonhistorik och befintliga konton har inte använts som testdata.

## När användaren bygger

**Ny Android-build: JA**, på grund av `userInterfaceStyle: automatic` i app.json. Använd projektets befintliga konfigurerade signering och kompatibel installation; behåll keystore-pluginet. Kör när byggmiljön är klar:

```powershell
npx expo run:android --device
npx expo start --dev-client
```

Temagränssnittet kan laddas om som JS i befintlig utvecklingsapp, men det verifierar inte native-konfigurationens systemläge. Bevara telefonens data; avinstallera eller rensa inte den befintliga appen som en genväg. För en fristående färdig releasekandidat behövs projektets signerade releaseflöde och en separat isolerad testinstallation enligt fas 25.
