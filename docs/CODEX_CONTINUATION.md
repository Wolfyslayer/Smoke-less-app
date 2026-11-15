# Fortsättning – Smoke Less

## Aktiv fas

- Fas **25.0 – slutlig QA, säkerhet och release**, branch `feat/phase-25-release-readiness`, PR #173. Bas main `d606126`.
- Fast checklista: `docs/PHASE_25_RELEASE.md`. Merga inte fasen eller markera roadmapen färdig innan verkliga releasegrindar passerat. Fas 26 kräver lansering och faktisk återkoppling.
- Användaren har gett stående klartecken att AI kontrollerar senaste `validate` och `rules` och fortsätter till nästa commit/fas när de är gröna. Inget extra klartecken mellan vanliga commits/merge. Produktionspublicering kräver uttryckligt beslut.

## Senaste avslutade faser

Fas 17 PR #165 (`0fdd4b1`), 18 #166 (`2857e3f`), 19 #167 (`9d0505e`), 20 #168 (`7cb70a4`), 21 #169 (`70a2295`), 22 #170 (`577558d`), 23 #171 (`3a05bfc`) och 24 #172 (`d606126`) är mergade. Alla hade gröna obligatoriska CI på slutlig head. Kod/test/statisk granskning är dokumenterad som 8/8 och 32/32 per funktionsfas; fysisk QA är uttryckligen överförd till fas 25.

Gemensam SVG/dagsmodell används på Hem, förhandsvisning och PNG. Lokal preferenstjänst separerar gäst/konton för resestöd, handlingsplaner och tips. Underhållsläge bygger på bekräftade dagar. Frivilliga notiser har tysta tider, generisk text och serialisering. Hem prioriterar dagskort/Registrera/SOS; onboarding har frivillig ekonomi och bevarar historik.

## Fas 25 hittills

- Telefon ansluten av användaren: A024, Android 17, 1260×2800/480 dpi. Befintlig dev-build 6.0.0 installerad 2026-11-06; aktuell JS via Metro/USB. Ingen ominstallation/rensning och inga testposter/kontoändringar i verklig historik. Fulla testdetaljer i `PHASE_25_QA_RESULTS.md`.
- PNG skapad nativt, faktisk 680×426-fil inspekterad; systemdelning öppnad och avbruten utan mottagare. Hem/SOS och registreringsmodal/Android Tillbaka granskade riktat. Textskala 1,8 provad efter omstart och återställd till 1,0. TalkBack, andra enheten, offline med skrivningar och full regression är inte utförda.
- SOS-planinställningar flyttade bakom utfällning, dubbla introytor bort från Hem/SOS och situationsbyte rensar tidigare hjälpsamhetssvar. Nya backupnycklar skiljer gäst/konto; äldre omärkta kopior är fortfarande en blockerare för fullständig radering.
- Testupptäckt ersätter fast fillista: 265 enhetstester inklusive 21 servermockar, 10 storage, 6 migration samt 9 Firestore-emulatortester passerar lokalt. TypeScript passerar. Emulatorn använder endast `smokeless-rules-test`.
- Manuella CI-byggen får disponibel testkeystore för main:s befintliga plugin. Ingen privat nyckel/hemlighet ändrad. **Det är inte produktionssignering.** Starta fristående QA-build på fasens commit efter gröna obligatoriska CI och inspektera resultat. Befintlig fysisk installation har annan certifikatgrund; avinstallera den inte för att prova CI-APK.

## Verkliga releaseblockerare

Se `PHASE_25_SECURITY_REVIEW.md` och `PLAY_DATA_SAFETY_REVIEW.md`: fungerande klient/server-kontoradering och extern väg saknas; äldre omärkta backups och retention behöver lösas; produktionens regler/regioner/IAM/loggar är inte verifierade; ansvarig utgivare/offentlig kontakt/policy-URL saknas; testkonton, andra enheten, full fysisk acceptans och signerad release återstår. En fråga om utgivare/kontakt har ställts. Användaren anslöt telefonen men har ännu inte fyllt de uppgifterna.

## Arbetsregler

Läs AGENTS.md, AI_WORKFLOW.md, roadmap och aktiv fasplan. Kontrollera faktisk branch, lokal diff, PR och senaste CI. Bevara lokala ändringar och main:s debug-keystore-plugin. Ingen produktionsdeployment, kontoradering, testskrivning i verklig historik eller hemlighets-/regeländring utan nödvändig verifiering. Regeländring som verkligen behövs får separat avgränsad säkerhets-PR enligt roadmapen.

Efter varje commit: rapportera SHA, PR, ändring, CI, Android-build samt alla fasta 8 huvudpunkter och 32 delpunkter med två procentmått. Fas 25 har verkliga fysiska/releasepunkter som inte får prickas av med enbart kodtester. Fortsätt med tillgängligt arbete och användarens nya information; stanna inte bara för att en fas är förberedd.
