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
| Övriga tabbar, SOS, statistik, historik, delning och widgets | Respektive `src/screens/`, `src/components/` | Ännu ej källkodsgranskade i denna matris | Kartlägg samtliga vyer före kodändringar |

## Konfigurationsavvikelse mellan main och fasbranch

Efter att PR #161 skapades uppdaterades `main` med en extra `./plugins/withCustomDebugKeystore`-post i `app.json` och den nya filen `plugins/withCustomDebugKeystore.js`. De finns **ännu inte** i fasbranchen. Rör inte den lokala debug-keystoren eller hemligheter. Synkronisera med senaste `main` innan fasen mergas och bedöm native-buildbehov separat; enbart dokumentationsändringarna i denna commit kräver ingen ny Android-build.

## Avgränsning och verifiering

- Källkodsinventering betyder inte att en fysisk telefon, BrowserStack eller TalkBack har testats.
- Prioritera påvisade klippnings-/fokusfel och blockerande tillgänglighetsproblem.
- Bred enhets- och TalkBack-QA förs vidare till fas 25 enligt masterplanen.
