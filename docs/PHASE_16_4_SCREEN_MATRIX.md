# Fas 16.4 – Inventeringsmatris (pågående)

Detta är en **källkodsbaserad** första inventering, inte genomförd fysisk Android-QA. Varje vy granskas mot Safe Area (topp/botten), tangentbord/fokus, scroll/klippning, stora texter, 48 dp-tryckytor, tillgänglighet och Android Tillbaka. Utfall anges först efter verifiering.

| Vy / komponent | Källfil | Första observation | Risk / nästa kontroll |
| --- | --- | --- | --- |
| Sessionsrot och login före onboarding | `src/components/AppSessionView.tsx` | Använder `useSafeAreaInsets` och `ScrollView` med `keyboardShouldPersistTaps` | Kontrollera systemfält, stor text, tangentbord och tillbaka-gest |
| Onboarding | `src/screens/OnboardingScreen.tsx` | Använder `useSafeAreaInsets`, `ScrollView` och `CompactDateModal` | Kontrollera samtliga steg, datumfält, scroll och max textstorlek |
| Plan | `src/screens/PlanScreen.tsx` | Egen `Modal`, datumkomponent och `useWindowDimensions` | Kontrollera modalens insets, smal skärm och knappar vid stor text |
| Datumväljare | `src/components/CompactDateModal.tsx` | React Native `Modal` och `useWindowDimensions`, ingen egen Safe Area-hook | Kontrollera placering nära gestfält och små skärmar |
| Bekräftelsedialog | `src/components/ConfirmationDialog.tsx` | React Native `Modal`, utan egen Safe Area-hook | Kontrollera knappåtkomst vid systemnavigering och maximal text |
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
| Onboarding-inloggningsmodal | `src/components/OnboardingAuthModal.tsx` | React Native `Modal`, ingen egen Safe Area-hook | Kontrollera tangentbord, underkant och Android Tillbaka |
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
