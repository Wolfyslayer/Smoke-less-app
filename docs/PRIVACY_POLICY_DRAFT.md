# Smoke Less – integritetspolicy (UTKAST, ej publiceringsklar)

**Status:** Utkast för fas 7.0. Granska mot faktisk kod, Firebase-konfiguration och Play Console innan publicering. Policyn får inte användas som färdig integritetspolicy förrän kontaktuppgifter och samtliga kontroller nedan är klara.

## App och ansvarig
Smoke Less är en app för att följa rökvanor, nedtrappning och rökstopp.

**Ansvarig utgivare/personuppgiftsansvarig:** [FYLL I]
**Kontakt för integritetsfrågor:** [FYLL I]
**Senast uppdaterad:** [FYLL I VID PUBLICERING]

## Uppgifter som kan behandlas
Appen kan hantera uppgifter som användaren själv registrerar om rökvanor, mål, tidsstämplar och framsteg. Dessa uppgifter kan avslöja hälsorelaterade förhållanden och ska hanteras med särskild omsorg.

Gästhistorik lagras lokalt på enheten. När användaren väljer att skapa eller använda ett konto kan e-postadress och kontouppgifter behandlas via Firebase Authentication. Kontofunktioner kan även använda Firestore för molnhistorik och synkronisering. Exakt omfattning, tidpunkt och villkor för molnöverföring måste verifieras i den faktiska implementationen.

## Användarens val
Appen kan användas i gästläge utan konto. Användaren kan själv välja att aktivera lokala påminnelser och måste ge telefonens notisbehörighet där det krävs. Manuell JSON-export av historik kan innehålla personliga uppgifter; användaren ansvarar för hur den exporterade filen förvaras och delas.

## Lagring, mottagare och överföringar
Lokala data lagras på enheten. För kontofunktioner används Firebase-tjänster från Google. **Kontrollera före publicering:** exakta Firebase-tjänster, regioner, underbiträden, överföringar utanför EU/EES, lagringstider, säkerhetsåtgärder och eventuell analys-/kraschrapportering. Påstå inte att data aldrig lämnar enheten när konto eller molnsynkronisering används.

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
