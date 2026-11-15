# Smoke Less – integritetspolicy (UTKAST, ej publiceringsklar)

**Status:** Tekniskt uppdaterat i fas 25, 2026-11-15. Inte publiceringsklart. Se `PLAY_DATA_SAFETY_REVIEW.md` och `PHASE_25_SECURITY_REVIEW.md`. Kontakt, tjänstekonfiguration, retention och fungerande radering återstår.

## App och ansvarig
Smoke Less är en app för att följa rökvanor, nedtrappning och rökstopp.

**Ansvarig utgivare/personuppgiftsansvarig:** [FYLL I]
**Kontakt för integritetsfrågor:** [FYLL I]
**Senast uppdaterad:** [FYLL I VID PUBLICERING]

## Uppgifter som kan behandlas
Appen kan hantera uppgifter som användaren själv registrerar om rökvanor, mål, tidsstämplar och framsteg. Dessa uppgifter kan avslöja hälsorelaterade förhållanden och ska hanteras med särskild omsorg.

Gästhistorik lagras lokalt på enheten. När användaren väljer konto används Firebase Authentication för inloggning och Firestore för automatisk synk av kontots plan, cigaretter, röksug och avstämningar. Google-inloggning är frivillig och koppling till befintligt konto kräver uttryckligt val. Gästhistorik flyttas inte automatiskt till ett befintligt konto.

Dashboardval, resestöd, personliga handlingsplaner och avvisade tips sparas lokalt för gäst/konto. Påminnelser väljs per enhet och använder generiska texter. Widgeten kan efter opt-in visa dagens antal och mål på hemskärmen. PNG-delning kan innehålla dagens antal/mål; appen öppnar systemets delningsdialog och användaren väljer själv mottagare eller avbryter. Externa källänkar innehåller inga tillagda registreringar eller konto-ID:n.

Lokala återställningskopior kan skapas före import och återställning. Nya kopior är märkta per identitet. Äldre omärkta kopior och gallring måste hanteras innan kontoradering kan beskrivas som fullständig; ingen färdig raderings- eller retentionstid utlovas i detta utkast.

## Användarens val
Appen kan användas i gästläge utan konto. Användaren kan själv välja att aktivera lokala påminnelser och måste ge telefonens notisbehörighet där det krävs. Manuell JSON-export och JSON-återställning erbjuds inte i appens gränssnitt. Kontohistorik synkroniseras via Firebase medan gästhistorik lagras lokalt på enheten.

## Lagring, mottagare och överföringar
Lokala data lagras på enheten. För kontofunktioner används Firebase-tjänster från Google. **Kontrollera före publicering:** exakta Firebase-tjänster, regioner, underbiträden, överföringar utanför EU/EES, lagringstider, säkerhetsåtgärder och eventuell analys-/kraschrapportering. Påstå inte att data aldrig lämnar enheten när konto eller molnsynkronisering används.

## Säker kontoradering – blockerande implementationskrav
Serverfunktion och klientflöde finns nu i kod men är **inte driftsatta/aktiverade för användning**. Tre lokala emulatorintegrationstest och domän-/säkerhetstester passerar. Detta utgör inte en färdig raderingsmöjlighet i den distribuerade appen. Firestore-reglerna tillåter inte klienten att skapa serverns raderingslås eller hårdradera dokument. Före publicering krävs nativ slutacceptans, verifierade produktionsregler/IAM, betrodd serverdriftsättning och offentlig extern begäransväg. Flödet kräver färsk inloggning och bekräftelse, spärrar synk, städar granskade lokala kontokopior/cache först efter serverkvitto och bevarar gäst/andra konton. Tombstones och äldre kopiors retention måste redovisas. Se `ACCOUNT_DELETION_ACCEPTANCE.md`. Inga befintliga verkliga konton har raderats i QA.

## Rättigheter, radering och support
Användaren ska få tydlig information om hur data kan begäras ut, rättas och raderas samt hur ett konto avslutas. **Blockerande inför publicering:** kontrollera faktiskt fungerande radering av lokal data, molnhistorik och Firebase-konto samt att synkronisering inte återställer raderade uppgifter. Ange en fungerande kontaktväg och svarsrutin.

## Innan publicering – obligatorisk verifiering
- [ ] Fyll i ansvarig, kontaktuppgifter och datum.
- [ ] Bekräfta faktiska kategorier av insamlade uppgifter och rättslig grund.
- [ ] Bekräfta Firebase-behandling, lagringsregioner och internationella överföringar.
- [ ] Bekräfta lagringstider och gallringsrutiner.
- [ ] Verifiera fungerande radering av konto, moln- och lokal historik.
- [ ] Kontrollera appbehörigheter, notiser och eventuell telemetri.
- [ ] Stäm av formuläret **Data safety** i Google Play med faktisk behandling.
- [ ] Publicera en tillgänglig URL och länka den från appen och butikssidan.

Detta dokument är ett arbetsutkast, inte juridisk rådgivning.
