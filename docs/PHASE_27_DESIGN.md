# Fas 27 – designriktning och inventering

Beslut 2026-11-15: användaren prioriterar redesign före färdig testbuild och offentlig lansering. Fas 25:s verifierade arbete bevaras; dess återstående QA-/releasepunkter är öppna. Fas 26 skjuts upp till efter faktisk lansering. Inga fler Android-byggen startas nu.

## Befintligt UI och konkreta problem

Inventerade skärmar i `src/screens`: Home, SOS, Register, Plan, Settings/SettingsPlanSection, Stats, History, Profile, Benefits, Onboarding, Account och Backup. Routing sker via AppScreenRouter, ProgressScreenRoutes och AccountSettingsRoutes; session och overlays via AppSessionView, AppSessionOnboarding och AppSessionOverlays. Backup är en befintlig källvy; den ska inte återinföras som JSON-export i produktflödet.

Gemensamma komponenter: AppCard/AppButton i ui, ScreenHeader, BottomNavigation, ConfirmationDialog, CompactDateModal, CigaretteRegisterModal, OnboardingControls/AuthModal. Funktionsytor: DashboardOverview/Editor, DailyProgressShareCard/Artwork, PersonalTrends/Journey/ActionPlan, MaintenanceSupport, EvidenceSupport, ReminderSettings, GettingStartedTip, SectionIntroCard, LegacyRecoveryCleanup och AccountDeletionStatus.

- `theme.ts` har en enda mörk palett med färgnamn som white/lime i stället för roller. Statisk StyleSheet skapas vid modulimport. Enbart ny Context runt appen uppdaterar inte dessa stilar; varje konsument måste migreras till en temaberoende stilfabrik/hook.
- 60 hexträffar på 36 rader i 18 filer under src vid inventeringen. Exempel: SOS, plan, statistik och introytor har egna gröna bakgrunder/border. Dessa behöver semantiska roller, inte blind hex-ersättning.
- `app/_layout.tsx` tvingar ljust statusfält och mörk Stack-bakgrund. Startup/intro måste också följa valt tema utan att visa fel bakgrund vid laddning.
- AppCard/AppButton är en gemensam grund men flera skärmar upprepar kort-/knappstilar, olika padding och textstorlekar. Samla hierarki och mått i tokens innan vyerna byggs om.
- Knapparnas text använder nu bakgrundsfärgen som kontrast. Nytt tema behöver explicit onAccent så knapptextens läsbarhet inte beror på sidbakgrunden.

## Designriktning

Ljust tema: varm grågrön sidyta, vita kort och djupgrön primär handling. Mörkt tema: djup skogsgrön sidyta, lätt separerade gröna kort och ljusgrön primär handling. Typografi och information ska bära hierarkin; undvik ytterligare dekorativa kort eller fler steg i kärnflöden.

`src/themeTokens.ts` fastställer semantiska paletter, spacing 4/8/12/16/24/32, kort 24, kontroller 14, minsta tryckyta 48 och innehållsbredd högst 640. Normaltext börjar vid 16. Tokens är grund; nuvarande UI byter ännu inte tema. Befintlig C-palett behålls under kontrollerad migration.

## Referensvyer och acceptans

1. Hem: dagsöversikt först, tydlig Registrera och omedelbar SOS, sekundär coachinformation under. Samma dagsmodell i ring och delningsbild, ingen extra bekräftelse för vanlig registrering.
2. SOS: hjälpen först, utfällbar plan och lugna kontroller. Intensitet och hjälpsamhet får inte kopplas till fel situation.
3. Inställningar: Ljust/Mörkt/System, System som standard, växling utan omstart. Preferens är enhetslokal och får aldrig skriva om kontodata eller återställa historik.
4. Konto/onboarding/dialog: läsbart tangentbordsläge, 48 dp handlingar, tydliga fel och bevarade inmatningar. Ingen inloggning eller dataradering från en temaändring.
5. Statistik/PNG: text, diagram och tomlägen i båda teman. Dagens PNG innehåller fortsatt endast godkända uppgifter; inga nya konto-/historikfält.

Automatiskt: text/action-färgpar har minst 4,5:1 i båda paletter, systemtema följs med stabil fallback, lagring/race/fel testas i nästa milstolpe. Fysisk acceptans: maximal text, TalkBack, tangentbord, systemfält, olika skärmar och båda teman efter färdig testbuild. Dessa punkter kan inte markeras klara av tokenprov.

## Leveransordning

Inventering/tokens → temaprovider och robust lokal preferens → gemensamma komponenter och systemfält → Hem/SOS → övriga vyer och PNG → tillgänglighet/polering → slutlig kandidat. Ingen Firebase-, datamodells-, regel- eller serverändring ingår. Fas 27 har exakt checklistan från main:s PR #174, åtta huvudpunkter och 32 delpunkter.
