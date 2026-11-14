# Fas 16.4 – Inventeringsmatris (pågående)

Detta är en **källkodsbaserad** första inventering, inte genomförd fysisk Android-QA. Varje vy granskas mot Safe Area (topp/botten), tangentbord/fokus, scroll/klippning, stora texter, 48 dp-tryckytor, tillgänglighet och Android Tillbaka. Utfall anges först efter verifiering.

| Vy / komponent | Källfil | Första observation | Risk / nästa kontroll |
| --- | --- | --- | --- |
| Sessionsrot och login före onboarding | `src/components/AppSessionView.tsx` | Använder `useSafeAreaInsets` och `ScrollView` med `keyboardShouldPersistTaps` | Kontrollera systemfält, stor text, tangentbord och tillbaka-gest |
| Onboarding | `src/screens/OnboardingScreen.tsx` | Använder `useSafeAreaInsets`, `ScrollView` och `CompactDateModal` | Kontrollera samtliga steg, datumfält, scroll och max textstorlek |
| Plan | `src/screens/PlanScreen.tsx` | Egen `Modal`, datumkomponent och `useWindowDimensions` | Kontrollera modalens insets, smal skärm och knappar vid stor text |
| Datumväljare | `src/components/CompactDateModal.tsx` | React Native `Modal`, `useWindowDimensions`, `useSafeAreaInsets` och scroll; kalendercellen är tryckyta (minhöjd 48 dp) | Kontrollera placering nära gestfält och små skärmar |
| Bekräftelsedialog | `src/components/ConfirmationDialog.tsx` | React Native `Modal` med `useSafeAreaInsets` och scroll | Kontrollera knappåtkomst vid systemnavigering och maximal text |
| Registrera cigarett | `src/components/CigaretteRegisterModal.tsx` | Använder `useSafeAreaInsets` och `ScrollView` | Kontrollera underkant, val och avbrytbekräftelse |
| Samlade överlägg | `src/components/AppSessionOverlays.tsx` | Kopplar registreringsmodal och bekräftelsedialog | Kontrollera prioritet och Android Tillbaka |
| Gemensamma UI-knappar | `src/components/ui.tsx` | Återanvändbar `AppButton` | Granska faktisk minsta tryckyta och textskalning |
| Konto, profil, inställningar och backup | `src/components/AccountSettingsRoutes.tsx` | Flera separata skärmar via routingkomponent | Inventera varje underskärm och formulär |
| Appens rotlayout | `app/_layout.tsx` | `SafeAreaProvider` förekommer | Kontrollera om den delas konsekvent mellan flöden |
| Bottennavigering | `src/components/BottomNavigation.tsx` | `useSafeAreaInsets` används | Kontrollera dubbel bottom-padding och 48 dp |
| Hem | `src/screens/HomeScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera insets från gemensam layout, kort och scroll |
| SOS | `src/screens/SOSScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera övning, tangentbord, tillbaka och max text |
| Statistik | `src/screens/StatsScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera diagram, bredd och textskalning |
| Historik | `src/screens/HistoryScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera långa listor och tomläge |
| Registreringsvy | `src/screens/RegisterScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera val, formulär och knappar |
| Fördelar | `src/screens/BenefitsScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera långa texter och kort |
| Profil | `src/screens/ProfileScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera kort, scroll och knappstorlek |
| Konto | `src/screens/AccountScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera e-postfält, tangentbord och feltexter |
| Inställningar | `src/screens/SettingsScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera val, formulär och skärmstorlek |
| Backup / molnsäkerhet | `src/screens/BackupScreen.tsx` | Separat skärm, ingen egen Safe Area-hook | Kontrollera dialoger, status och scroll |
| Onboarding-inloggningsmodal | `src/components/OnboardingAuthModal.tsx` | React Native `Modal` med `useSafeAreaInsets` och scroll; även avbrytbekräftelsen kan scrollas | Kontrollera tangentbord, underkant och Android Tillbaka |
| Delningskort | `src/components/DailyProgressShareCard.tsx` | Delningskomponent utan egen Safe Area-hook | Kontrollera förhandsvisningens skalning |
| Skärmrouter | `src/components/ProgressScreenRoutes.tsx`, `src/components/AccountSettingsRoutes.tsx`, `src/components/AppScreenRouter.tsx` | Skärmarna väljs via separata routingkomponenter | Kontrollera att samma insets och scrollregler gäller alla |
| Widget | `src/widgets/` och `plugins/withSmokeLessWidget.js` | Native hemskärmswidget, inte en appskärm | Separat native-verifiering enligt widgetplanen |

## Inventeringsresultat – steg 1

Samtliga huvudsakliga skärmkomponenter, onboardingflöden, routing, modaler och delningskort har identifierats i källkoden. Att en skärm saknar egen Safe Area-hook är **inte** i sig ett fel; rotlayout och föräldrakomponenter kan hantera insets. Nästa steg är att spåra faktisk padding och hitta verifierbara överlapp. Inga fysiska tester påstås genomförda.

## Konfigurationsavvikelse mellan main och fasbranch

Efter att PR #161 skapades uppdaterades `main` med en extra `./plugins/withCustomDebugKeystore`-post i `app.json` och den nya filen `plugins/withCustomDebugKeystore.js`. De finns **ännu inte** i fasbranchen. Rör inte den lokala debug-keystoren eller hemligheter. Synkronisera med senaste `main` innan fasen mergas och bedöm native-buildbehov separat; enbart dokumentationsändringarna i denna commit kräver ingen ny Android-build.

## Avgränsning och verifiering

- Källkodsinventering betyder inte att en fysisk telefon, BrowserStack eller TalkBack har testats.
- Prioritera påvisade klippnings-/fokusfel och blockerande tillgänglighetsproblem.
- Bred enhets- och TalkBack-QA förs vidare till fas 25 enligt masterplanen.

## Ansvar och prioriterad verifieringsmatris

**Ansvarig för statisk granskning och automatiska tester:** utvecklingsflödet i PR #161. **Ansvarig för fysisk acceptans:** appägaren på Android-enhet; bred enhets- och TalkBack-verifiering samlas i fas 25. Inget nedan innebär att fysisk QA redan är utförd.

| Riskklass | Vyer | Kontroller som återstår | Ägare / acceptans |
| --- | --- | --- | --- |
| Hög – inmatning och tangentbord | Onboarding, onboarding-inloggning, Konto, Inställningar, login före onboarding | Öppna tangentbord, fokusera sista fältet, stäng tangentbord, max textstorlek, Android Tillbaka; inga dolda primärknappar | Utveckling: källkod + CI; appägare: Android-test |
| Hög – modal och systemkanter | Datumväljare, bekräftelsedialog, cigarettregistrering, avbrytbekräftelser, Plan | Gestnavigering och treknappsnavigering, statusfält/kamerahål, små skärmar, stor text; bekräfta att alla knappar nås | Utveckling: källkod + CI; appägare: Android-test |
| Hög – navigation | Sessionsrot, bottennavigering, överlägg, SOS | Android Tillbaka stänger överlägg före navigation; navigationsfält täcker inte knappar; SOS-timer fortsätter inte efter avslut | Utveckling: regressionstest; appägare: Android-test |
| Medel – datatäta vyer | Statistik, Historik, Plan, delningskort | Inga kapade diagram/etiketter, ingen oavsiktlig horisontell scroll, delningsbildens innehåll får plats | Utveckling: källkodsgranskning; appägare: Android-test |
| Medel – övriga vyer | Hem, Registrera, Fördelar, Profil, Backup/molnsäkerhet | Smal och bred skärm, max textstorlek, tom-/fel-/laddningsläge, tryckytor | Utveckling: källkodsgranskning; appägare: Android-test |
| Separat native-spår | Android-widget | Widgetstorlekar och launcher-specifika beteenden enligt widgetplan | Appägare: native Android-test |

### Kvarstående verifieringsbegränsningar

- CI:s layouttester kontrollerar **källkodsmönster**, inte faktisk renderad geometri, tangentbord eller TalkBack.
- På skärmar där kalendercellens bredd understiger 48 dp uppnås inte 48 dp i båda riktningar. Detta måste bedömas på enhet; inga falska tillgänglighetsgodkännanden.
- main har debug-keystore-plugin som saknas i denna äldre fasbranch. Bevara main-ändringarna vid merge; ingen hemlig keystore ska läggas i Git.

## Safe Area – statisk genomgång av systemfält (16.4, punkt 2.2)

**Granskade källor:** `app/_layout.tsx`, `src/components/AppSessionView.tsx`, `src/components/BottomNavigation.tsx`. Detta är en statisk granskning, inte en fysisk verifiering av kamerahål eller Androids navigeringslägen.

- Rotlayouten omsluter `Stack` och intro-overlay med `SafeAreaProvider`. `StatusBar` har ljus ikonstil och döljs under den två sekunder långa introduktionen; appens vanliga innehåll ligger i en `flex:1`-rot.
- Sessionsvyns huvudflikar använder `paddingTop:Math.max(insets.top,18)+12` i sin `ScrollView`. Inloggningen före onboarding använder `Math.max(insets.top,30)+36`. Dessa vägar har uttrycklig toppmarginal för statusfältet, men marginalerna skiljer sig åt avsiktligt och måste kontrolleras visuellt.
- `BottomNavigation` använder `paddingBottom:Math.max(insets.bottom,10)` och en separat 48 dp hög tryckyta för varje flik. Huvudflikarnas `ScrollView` är ett syskon ovanför bottennavigeringen, inte ett absolut positionerat lager. Därför syns ingen direkt dubbel bottom-padding i denna kodväg.
- Splash-overlay är helskärmstäckande och statusfältet dolt medan den visas. Det är avsiktligt; efter introduktionen återgår statusfältet.
- **Kvarstår:** fysisk granskning med kamerahål, statusfält, gestnavigering, treknappsnavigering, kant-till-kant-läge och maximal text-/skärmskalning. Rotens `StatusBar`-stil bekräftar inte i sig att Android 15+/17 hanterar alla systemfält korrekt.
- **Risk att följa upp:** huvudflikarnas toppmarginal `Math.max(insets.top,18)+12` kan ge extra luft på enheter med stora toppinsets. Den ska inte ändras utan visuellt underlag. Kalenderns smala tryckytor är fortsatt öppet tillgänglighetsproblem.
